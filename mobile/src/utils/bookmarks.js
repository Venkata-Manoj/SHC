import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'shc-bookmarks';

export async function getBookmarks() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(id) {
  const bookmarks = await getBookmarks();
  const idx = bookmarks.indexOf(id);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(id);
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  return bookmarks;
}

export async function isBookmarked(id) {
  const bookmarks = await getBookmarks();
  return bookmarks.includes(id);
}
