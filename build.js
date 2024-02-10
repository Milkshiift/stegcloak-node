const { context } = require('esbuild')

const NodeCommonOpts = {
  minify: true,
  bundle: true,
  sourcemap: false,
  logLevel: 'info',
  format: 'cjs',
  platform: 'node',
  target: ['esnext'],
  entryPoints: ['stegcloak.js'],
  outdir: 'dist'
};

(async () => {
  const ctx = await context(NodeCommonOpts)
  await ctx.rebuild()
  await ctx.dispose()
})()
