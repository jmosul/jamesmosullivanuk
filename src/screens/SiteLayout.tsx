import { Link, Outlet, useLocation } from 'react-router'
import { MONOGRAMS } from '../components/ornaments'
import { paths } from '../routes'
import { SITE_NAME } from '../site'
import { ThemeSwitcher, useTheme } from '../theme'

const SURNAME = SITE_NAME.slice(SITE_NAME.lastIndexOf(' ') + 1)

/** The header every page shares. On the homepage it floats over the stage. */
export function SiteLayout() {
  const { pathname } = useLocation()
  const home = pathname === paths.home

  return (
    <>
      <header className={home ? 'site-header site-header--overlay' : 'site-header'}>
        <Link to={paths.home} className="wordmark" aria-label={`${SITE_NAME}, home`}>
          <Monogram />
          <span>{SURNAME}</span>
        </Link>
        <div className="header-actions">
          {/* The homepage's persona toggles choose the theme there. */}
          {!home && <ThemeSwitcher />}
          {pathname !== paths.signIn && (
            <Link to={paths.signIn} className="button">
              <KeyIcon />
              Sign in
            </Link>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}

function Monogram() {
  const { theme, override } = useTheme()
  const Drawing = MONOGRAMS[override ?? theme]

  return (
    <span className="monogram">
      <Drawing />
      <span className="monogram-initial">{SITE_NAME.charAt(0)}</span>
    </span>
  )
}

function KeyIcon() {
  return (
    <svg className="icon key-icon" viewBox="0 0 24 18" width="22" height="16" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6 4a5 5 0 1 0 0 10a5 5 0 1 0 0-10z M6 7.3a1.7 1.7 0 1 1 0 3.4a1.7 1.7 0 1 1 0-3.4z"
      />
      <path d="M10.4 7.9 H23 L24 9 L23 10.1 H10.4 Z M17 10 H19.4 V13.4 H17 Z M20.6 10 H22.6 V12.4 H20.6 Z" />
    </svg>
  )
}
