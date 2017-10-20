// Filename: readyaim_fuse.js  
// Timestamp: 2017.10.20-01:01:38 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// multiple fuse, one for each object
//
// ◎ ◉

const THREE = require('three'),
      castas = require('castas');

module.exports = (o => {
  o.getringgeometry = opt =>
    new THREE.RingGeometry(
      opt.innerRadius,
      opt.outerRadius,
      opt.thetaSegments,
      opt.phiSegments,
      opt.thetaStart,
      Math.PI / 2); // 90 degree

  o.getringmesh = opt =>
    new THREE.Mesh(o.getringgeometry(opt), new THREE.MeshBasicMaterial({
      color : opt.color,
      side : THREE.BackSide,
      fog : false
    }));

  o.getfusemesh = (opt, mesh = o.getringmesh(opt)) => (
    mesh.visible = opt.visible,
    mesh.position.z = 0.0001, // at front of reticle
    mesh.rotation.y = 180 * (Math.PI / 180), // make clockwise
    mesh);

  // after or while being called... should have 'duration' set by callee
  o.getopts = (opts = {}) => {
    let finopt = {};

    finopt.visible = castas.bool(opts.visible, true);
    finopt.globalDuration = castas.num(opts.duration, 2.5);
    finopt.vibratePattern = castas.num(opts.vibrate, 100);
    finopt.color = opts.color || 0x00fff6;
    finopt.innerRadius = castas.num(opts.innerRadius, 0.045);
    finopt.outerRadius = castas.num(opts.outerRadius, 0.06);
    finopt.clickCancel = castas.bool(opts.clickCancel, false);

    finopt.phiSegments = 3;
    finopt.thetaSegments = 32;
    finopt.thetaStart = Math.PI / 2;

    finopt.duration = finopt.globalDuration;
    finopt.timeDone = false;

    return finopt;
  };

  o.update = (fuseopts, elapsed = 0) => {
    let gazedTime = elapsed / fuseopts.duration,
        thetaLength = gazedTime * (Math.PI * 2),
        { vertices } = fuseopts.mesh.geometry,
        radius = fuseopts.innerRadius,
        radiusStep = (fuseopts.outerRadius - fuseopts.innerRadius) / fuseopts.phiSegments,
        count = 0;

    for (let i = 0; i <= fuseopts.phiSegments; i++) {
      for (let y = 0; y <= fuseopts.thetaSegments; y++) {
        let vertex = vertices[count],
            segment = fuseopts.thetaStart + y / fuseopts.thetaSegments * thetaLength;

        vertex.x = radius * Math.cos(segment);
        vertex.y = radius * Math.sin(segment);
        count++;
      }
      radius += radiusStep;
    }

    fuseopts.mesh.geometry.verticesNeedUpdate = true;

    // disable fuse if 100%
    if (gazedTime >= 1) {
      fuseopts.active = false;
    }

    return fuseopts;
  };

  // only update if active and !timeDone
  // consider moving timeDone to controlling script
  o.updateactive = (opts, fuseopts, elapsed) =>
    (fuseopts.active && !opts.timeDone)
      ? o.update(fuseopts, elapsed)
      : fuseopts;

  o.hide = fuseopts => (
    fuseopts.mesh.visibile = false,
    fuseopts);

  o.out = fuseopts =>
    o.update(o.hide(Object.assign(fuseopts, {
      active : false,
      timeDone : false
    })), 0);

  o.over = (fuseopts, duration, visible) => {
    fuseopts.duration = duration || fuseopts.globalDuration;
    fuseopts.active = true;
    fuseopts = o.update(fuseopts, 0);
    fuseopts.mesh.visible = visible || fuseopts.visible;

    return fuseopts;
  };

  o.isdurationengaged = (fuseopts, duration) => (
    fuseopts.duration <= duration &&
      fuseopts.active === false &&
      fuseopts.timeDone === false);

  o.engage = fuseopts => (
    fuseopts.timeDone = true,
    fuseopts.mesh.visible = false,
    fuseopts);

  return o;
})({});
