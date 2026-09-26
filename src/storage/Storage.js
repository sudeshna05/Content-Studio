// Storage interface. Any backend (JSON, SQLite, Postgres) must implement this.
// Kept deliberately tiny so V2+ can swap it without touching callers.

export class Storage {
  /** Read a whole collection. Returns `fallback` if missing/corrupt. */
  async read(_key, _fallback) {
    throw new Error('Storage.read not implemented');
  }

  /** Write a whole collection (atomic where possible). */
  async write(_key, _value) {
    throw new Error('Storage.write not implemented');
  }
}
