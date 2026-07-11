// Deterministic index into a fixed-length list, keyed by a stable id (not a
// name — renaming a product/category must not flip its assigned image or color).
export function hashToIndex(id: number, length: number): number {
  return Math.abs(id) % length;
}
