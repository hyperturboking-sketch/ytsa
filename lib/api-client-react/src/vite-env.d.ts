// Minimal shim so tsc can compile import.meta.env usage in this lib.
// The real types are provided by vite/client at build time.
interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}
