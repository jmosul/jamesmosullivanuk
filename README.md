# James O’Sullivan

A React 19 and TypeScript site built with Vite.

```sh
nvm install
npm ci
npm run dev
```

Run `npm run lint` for Oxlint, `npm test` for Vitest, and `npm run build` for TypeScript checks and the production bundle. Run `npm run preview` to serve the production build locally.

## Host the home page with AWS Amplify

Amplify Hosting serves the static Vite build from `dist/`. On the default
Amazon Linux 2023 build image, `amplify.yml` ensures `libatomic` is installed
and selects the Node.js version pinned in `.nvmrc`. The build needs no AWS
credentials or environment variables.

The `aws-amplify` JavaScript client is installed for future integrations. Static
hosting requires no client initialization or `amplify_outputs.json`.

1. Once these changes are on `main`, open the [AWS Amplify console](https://console.aws.amazon.com/amplify/home)
   in your chosen AWS Region. From **All apps**, select **New app** → **Host web app**.
2. Choose **GitHub** and **Continue**. If prompted, authorize and install the
   Amplify GitHub App. Choose **Only select repositories**, select
   `jmosul/jamesmosullivanuk`, and select **Install & Authorize**. If the app
   is already installed, make sure it has access to this repository.
3. On **Add repository branch**, choose `jmosul/jamesmosullivanuk` and `main`,
   then select **Next**. The Vite app and build specification are at the
   repository root.
4. On **Configure build settings**, leave the default Amazon Linux 2023 image
   and confirm Amplify picks up the repository's `amplify.yml` with
   `npm run build` and output directory `dist`. Select **Next**.
5. On **Review**, select **Save and deploy**. When the deployment completes,
   open the branch's Amplify URL and check that the home page loads at `/`.

[AWS guide to connecting a GitHub repository](https://docs.aws.amazon.com/amplify/latest/userguide/setting-up-GitHub-access.html)
