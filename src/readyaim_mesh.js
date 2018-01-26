// Filename: readyaim_mesh.js
// Timestamp: 2017.11.11-23:07:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const THREE = require('three'),
      castas = require('castas');

module.exports = (o => {
  o.getoptsfuse = opts => ({
    duration : castas.num(opts.duration, 1.5),
    color : new THREE.Color(opts.color || 0xffffff),
    visible : castas.bool(opts.visible, true),
    clickCancel : castas.bool(opts.clickCancel, false)
  });

  o.getoptsreticle = opts => ({
    hoverColor : opts.hoverColor &&
      new THREE.Color(opts.hoverColor)
  });

  o.createtargetdata = (mesh, opts) => ({
    uuid : mesh.uuid,
    gazeable : true,
    fuse : o.getoptsfuse(opts.fuse || {}),
    reticle : o.getoptsreticle(opts.reticle || {})
  });

  o.isgazeable = targetdata =>
    Boolean(targetdata && targetdata.gazeable);

  return o;
})({});
