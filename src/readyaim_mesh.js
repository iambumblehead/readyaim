// Filename: readyaim_mesh.js
// Timestamp: 2017.11.11-23:07:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import castas from 'castas'

export default (o => {
  o.getoptsfuse = (THREE, opts) => ({
    duration : castas.num(opts.duration, 1.5),
    color : new THREE.Color(opts.color || 0xffffff),
    visible : castas.bool(opts.visible, true),
    clickCancel : castas.bool(opts.clickCancel, false)
  });

  o.getoptsreticle = (THREE, opts) => ({
    hoverColor : opts.hoverColor &&
      new THREE.Color(opts.hoverColor)
  });

  o.createtargetdata = (THREE, mesh, opts) => ({
    uuid : mesh.uuid,
    gazeable : true,
    fuse : o.getoptsfuse(THREE, opts.fuse || {}),
    reticle : o.getoptsreticle(THREE, opts.reticle || {})
  });

  o.isgazeable = targetdata =>
    Boolean(targetdata && targetdata.gazeable);

  return o;
})({});
