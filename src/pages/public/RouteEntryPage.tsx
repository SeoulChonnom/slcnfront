import { Navigate, useLocation } from 'react-router-dom';
import { resolvePublicEntryPath } from '../../app/router/public-entry-resolver';

function getMatchMedia() {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return undefined;
  }

  return window.matchMedia.bind(window);
}

export function RouteEntryPage() {
  const location = useLocation();
  const resolvedPath = resolvePublicEntryPath(location.pathname, {
    search: location.search,
    hash: location.hash,
    matchMedia: getMatchMedia(),
  });

  return <Navigate replace to={resolvedPath} />;
}
