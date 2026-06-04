export function isSupportedUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

export function getSiteKey(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function normalizeUrl(url, options) {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (!options.includeQueryParams) {
      parsedUrl.search = '';
    } else {
      parsedUrl.searchParams.sort();
    }

    if (!options.includeHash) {
      parsedUrl.hash = '';
    }

    if (options.ignoreTrailingSlash && parsedUrl.pathname.length > 1) {
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}
