console.log("Building...");

const result = await Bun.build({
    entrypoints: ["./src/stegcloak.ts"],
    outdir: "./dist",
    target: "node",
    format: "esm",
    sourcemap: "external",
    minify: true,
    external: ["lzutf8"],
});

if (!result.success) {
    console.error("Build failed!");
    for (const message of result.logs) {
        console.error(message);
    }
    process.exit(1);
}

console.log("Generating types...");

const tsc = Bun.spawn(["bun", "x", "tsc", "--emitDeclarationOnly", "--outDir", "./dist"]);
await tsc.exited;

if (tsc.exitCode !== 0) {
    console.error("Type generation failed!");
    console.error(await new Response(tsc.stderr).text());
    process.exit(1);
}

console.log("Build complete! 🚀");