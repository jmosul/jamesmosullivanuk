# Panel images

Persona panels can carry an image: a watercolour portrait for fantasy panels,
an optional logo for sci-fi tiles. A SuperAdmin uploads it in the persona
editor; the homepage serves it as a `srcset`.

## Pipeline

Everything up to the upload happens in the admin's browser (`src/media/`):

1. `decodeImage(file)` reads the file into a bitmap, applying EXIF
   orientation. It refuses empty files, files over 25 MB, and formats the
   browser can't read (HEIC on most desktops), with an `ImagePipelineError`
   whose message the editor shows as it is.
2. `renderWidths(bitmap)` draws it at 480, 960 and 1600 px wide, keeping the
   aspect ratio and any transparency, and never upscaling: a 700 px source
   gives 480 and 700. Each rendition is WebP at quality 0.85, or PNG where
   the browser can't encode WebP (Safari).
3. `PanelImageStore.upload` (`src/admin/panelImages.ts`) uploads each
   rendition with Amplify's `uploadData`, one at a time, and returns the
   `PanelImage` to put on the panel. The bitmap is closed once rendered.

## Keys

```
persona-images/<imageId>/<width>.<ext>
```

e.g. `persona-images/6f1c…/960.webp`. `panelImagePath` builds them. Every
upload gets a fresh `crypto.randomUUID()` id, so a key is written once and
never reused:

- uploads use `preventOverwrite: true` (S3 `If-None-Match: *`), so a clash
  fails rather than replacing someone else's bytes;
- objects are stored with `Cache-Control: public, max-age=31536000, immutable`;
- replacing an image means a new id, not new bytes under the old keys.

The record stores the paths, not URLs (`PanelImage.variants[].path`), as the
Amplify Gen 2 docs recommend: URLs are signed when they're needed. The panel's
`width` and `height` are the largest variant's, for its aspect ratio.

## Access

Storage and Data authorise separately. Being allowed to save a persona doesn't
let you write its images, and the other way round.

| Who | `persona-images/*` |
| --- | --- |
| Guests and signed-in users | `get` (`amplify/storage/resource.ts`) |
| SuperAdmins | `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts` (the `SuperAdminPersonaImages` policy in `amplify/backend.ts`) |

Guests get `get`, not `read`. `read` is `get` plus `list`, and listing would
reveal images no published persona points at: drafts, replaced images and
orphans. With `get` alone, a file can only be fetched by someone who already
has its path from a persona record. Nobody needs to list the folder, the
admin included, since the paths are on the records.

SuperAdmins are granted through the website's SuperAdmin IAM role rather than
`defineStorage`'s `allow.groups`, because the shared user pool's group has no
role of its own for `referenceAuth` to resolve.

`uploadData` switches to multipart above 5 MB, which a 1600 px PNG can reach.
Multipart parts are covered by `s3:PutObject`. Before starting a multipart
upload, Amplify checks localStorage for an unfinished upload of the same file
to the same key and, if it finds one, calls ListParts to resume it; that's
what `s3:ListMultipartUploadParts` is for. It's an object-level action, so it
doesn't allow listing the folder. Abandoned multipart uploads are aborted by a
bucket lifecycle rule after a day.

## Cleanup

Files are deleted only after no saved record points at them, so a failed save
never leaves a persona with a broken image.

- **Save.** After `PersonaStore.update` succeeds, the editor compares the
  variant paths of the last saved version with the new one (`staleImages`)
  and removes the ones that are gone. That covers replaced images, removed
  images and removed panels. An image that moved to another panel is kept.
- **Delete.** After `PersonaStore.remove` succeeds, every image on the
  persona's last saved version is removed.
- **Failed upload.** If one rendition fails, the ones already uploaded are
  removed before the error is shown.
- **Panel removed mid-upload.** When the upload finishes and its panel is
  gone (or the editor closed), its files are removed.

All of these are best effort: a failure is logged to the console, not shown,
because the persona itself is already right.

### Accepted orphans

Some files are left behind on purpose:

- an image uploaded and then replaced, removed or abandoned (by leaving the
  editor) before the persona was saved, since it was never on a record;
- files whose best-effort removal failed.

Orphans cost a little storage and nothing else: no record points at them and
nobody can list the folder. Tracking unsaved uploads to clean them up would
need state outside the record, which isn't worth it at this size.

## No CDN

Images are served straight from S3 with a presigned URL per visitor
(`getUrl`, valid for an hour), not through CloudFront. The Amplify Gen 2 docs
say CloudFront caching for Storage isn't supported yet, so a CDN would mean
running a distribution outside Amplify's model. Presigned URLs differ per
visitor, so shared caches don't help, but the browser still caches each one,
and the `immutable` header means it won't revalidate while the URL lasts.
