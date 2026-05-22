const STORAGE_KEY = 'shc-bookmarks';

export function getBookmarks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(id) {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(id);
  if (idx >= 0) bookmarks.splice(idx, 1);
  else bookmarks.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

export function isBookmarked(id) {
  return getBookmarks().includes(id);
}

export function generateShareLink(ids) {
  const base = window.location.origin + '/events';
  const params = new URLSearchParams();
  ids.forEach(id => params.append('bookmark', id));
  return `${base}?${params.toString()}`;
}
