import { Link, Outlet, useLocation } from 'react-router'
import { paths } from '../routes'
import { ThemeSwitcher } from '../theme'

/** The header every page shares, with the theme switcher. */
export function SiteLayout() {
  const { pathname } = useLocation()

  return (
    <>
      <header className="site-header">
        <Link to={paths.home} className="wordmark">
          O’Sullivan
        </Link>
        <div className="header-actions">
          <ThemeSwitcher />
          {pathname !== paths.signIn && (
            <Link to={paths.signIn} className="button">
              Sign in
            </Link>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}
