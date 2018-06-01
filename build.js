// Filename: build.js  
// Timestamp: 2017.10.14-13:33:55 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

require('scroungejs').build({
  iscompress : false,
  isconcat : true,
  inputpath : './src/',
  outputpath : './docs/dist/',
  basepagein : './docs/index.tpl.html',
  basepage : './docs/index.html',
  iswatch : false,

  // publicpath : '/dist',
  publicpath : '/readyaim/dist',
  // publicpath : process.env.NODE_ENV === 'production'
  //   ? '/readyaim/dist'
  //   : '/dist',
  treearr : [
    'readyaim.js',
    'readyaim_demo.js'
  ]
  // babelpluginarr : [
  //   'transform-object-rest-spread'
  // ]
}, err => {
  console.log(err || 'done');
});
