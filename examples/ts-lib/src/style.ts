/**
 * style entry, only for require style
 */
function importAllLess(r: any) {
  r.keys().forEach(r);
}

importAllLess(
  // dev use ts and prod use js
  (require as any).context('.', true, /.*?\/style\/index\.(t|j)s$/),
);
