// Application store: wraps Storage with domain helpers for content + settings.
// Single source of truth for the server and CLI.

import { JsonStorage } from './storage/JsonStorage.js';
import { DEFAULT_SETTINGS } from './config.js';

const storage = new JsonStorage();

export async function getSettings() {
  const s = await storage.read('settings', null);
  // Merge so new default keys appear even for old files.
  return {
    ...DEFAULT_SETTINGS,
    ...(s || {}),
    brand: { ...DEFAULT_SETTINGS.brand, ...(s?.brand || {}) },
    distribution: { ...DEFAULT_SETTINGS.distribution, ...(s?.distribution || {}) },
    posting: { ...DEFAULT_SETTINGS.posting, ...(s?.posting || {}) },
  };
}

export async function saveSettings(next) {
  const merged = { ...(await getSettings()), ...next };
  return storage.write('settings', merged);
}

export async function getItems() {
  const data = await storage.read('content', { items: [] });
  return Array.isArray(data?.items) ? data.items : [];
}

export async function saveItems(items) {
  await storage.write('content', { items });
  return items;
}

export async function upsertItem(item) {
  const items = await getItems();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = { ...items[idx], ...item };
  else items.push(item);
  await saveItems(items);
  return item;
}

export async function getItem(id) {
  return (await getItems()).find((i) => i.id === id) || null;
}

export async function deleteItem(id) {
  const items = (await getItems()).filter((i) => i.id !== id);
  await saveItems(items);
}
