await Bun.build({
    minify: true,
    sourcemap: "none",
    format: "esm",
    target: "node",
    entrypoints: ['stegcloak.js'],
    outdir: "dist",
    packages: "bundle",
});
