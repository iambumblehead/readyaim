// Filename: build.js  
// Timestamp: 2017.10.14-13:33:55 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

require('scroungejs').build({
  iscompressed   : false,
  isconcatenated : true,
  inputpath      : './src/',
  outputpath     : './docs/dist/',
  basepagein     : './docs/index.tpl.html',
  basepage       : './docs/index.html',
  publicpath     : '/dist',
  treearr : [
    'readyaim.js',
    'readyaim_demo.js'
  ],
  babelpluginarr : [
    'transform-object-rest-spread'
  ]
}, (err) => {
  console.log(err || 'done');
});
