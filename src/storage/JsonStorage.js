// JSON-file storage. One file per key under data/.
// Recovers gracefully: missing file -> fallback; corrupt file -> backup + fallback.

import fs from 'node:fs/promises';
import path from 'node:path';
import { Storage } from './Storage.js';
import { PATHS } from '../config.js';

export class JsonStorage extends Storage {
  constructor(dir = PATHS.data) {
    super();
    this.dir = dir;
  }

  _file(key) {
    return path.join(this.dir, `${key}.json`);
  }

  async read(key, fallback = null) {
    const file = this._file(key);
    try {
      const raw = await fs.readFile(file, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      if (err.code === 'ENOENT') return fallback; // no file yet — expected on first run
      // Corrupt JSON: preserve the bad file so nothing is silently lost, then recover.
      try {
        await fs.rename(file, `${file}.corrupt-${Date.now()}`);
        console.warn(`[storage] ${key}.json was corrupt; backed it up and started fresh.`);
      } catch { /* ignore */ }
      return fallback;
    }
  }

  async write(key, value) {
    await fs.mkdir(this.dir, { recursive: true });
    const file = this._file(key);
    const tmp = `${file}.tmp`;
    // Write to temp then rename = atomic-ish; never leaves a half-written file.
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf8');
    await fs.rename(tmp, file);
    return value;
  }
}
