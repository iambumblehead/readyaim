// Filename: build.js  
// Timestamp: 2017.10.14-13:33:55 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import fs from 'node:fs/promises'
import path from 'node:path'
import esbuild from 'esbuild'

const esbuildOpts = {
  entryPoints: [
    './src/readyaim.js',
    './src/readyaim_demo.js',
    './src/readyaim_demo.css'
  ],
  loader: {
    '.avif': 'file',
    '.png': 'file',
    '.gif': 'file',
    '.svg': 'file'
  },
  // external: ['*.png', '/images/*'],
  format: 'esm',
  // sourcemap: 'linked',
  platform: 'browser',
  metafile: true,
  outdir: './docs/dist/',
  minify: true,
  bundle: true,
  color: true,
  write: true
}

// make esbuild response a little nicer for printing to console
const esbuildResSanitize = (res, outputs = res.metafile.outputs) => Object
  .keys(outputs)
  .reduce((outputs, k) => (
    outputs[k].inputs = Object.keys(outputs[k].inputs).length,
    outputs
  ), outputs)

const bumble_srvHTMLElemIncludesReplace = (html, ts) => html
  .replace(/:appversion/m, ts || process.env.npm_package_version)
  .replace(/<!-- <script root="readyaim_demo.js" \/> -->/gmi, (
    '<script src="$" type=":type"></script>'
      .replace(/\$/, `/readyaim/dist/readyaim_demo.js?ts=${ts}`)
      .replace(/:type/, 'module')))
  .replace(/<!-- <link root="readyaim_demo.css" \/> -->/gmi, (
    '<link href="$" rel="stylesheet" type="text/css">'
      .replace(/\$/, `/readyaim/dist/readyaim_demo.css?ts=${ts}`)))

await (async () => {
  await esbuild.build(esbuildOpts)
    .then(res => console.log(esbuildResSanitize(res)))

  const indexhtml = bumble_srvHTMLElemIncludesReplace(
    await fs.readFile('./docs/index.tpl.html', 'utf8'),
    process.env.npm_package_version)

  const indexdirpath = path.join('./docs/')
  const indexhtmlpath = path.join(indexdirpath, 'index.html')

  await fs.mkdir(indexdirpath, {recursive: true})
  await fs.writeFile(indexhtmlpath, indexhtml)
})()
