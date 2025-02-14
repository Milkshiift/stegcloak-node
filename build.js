await Bun.build({
    minify: true,
    sourcemap: "none",
    format: "esm",
    target: "node",
    entrypoints: ['./src/stegcloak.js'],
    outdir: "dist",
    packages: "bundle",
});
