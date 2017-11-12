// Filename: readyaim_fuse.js
// Timestamp: 2017.11.11-23:06:51 (last modified)
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
      opt.thetaSegments, // outer perimeter segments
      opt.phiSegments,
      opt.thetaStart,
      Math.PI / 2);

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

    finopt.duration = castas.num(opts.duration, opts.Globalduration);
    finopt.timeDone = false;

    return finopt;
  };

  //   ( x, y ) ._
  //           /| ^
  //          / | |
  //         /  | |
  //        /   |
  //    h  /    | y
  //      /     |
  //     /      | |
  //    /.      | |
  //   /  θ  +--| |
  //  /____\_|__|_v
  //  |         |
  //   <-- x -->
  //
  o.getvertex = (hypotenuse, radangle) => ({
    x : hypotenuse * Math.cos(radangle),
    y : hypotenuse * Math.sin(radangle)
  });

  //
  // for speed, consider a different approach...
  // adding more faces (resolution), then
  // painting faces within range
  //
  o.updateringgeometry = (opts, percent, ringgeometry) => {
    let thetaEnd = percent * Math.PI * 2,
        thetaStart = Number(opts.thetaStart),
        thetaSegments = Number(opts.thetaSegments),
        hypotenuse = Number(opts.innerRadius),
        radiusstep = (opts.outerRadius - hypotenuse) / opts.phiSegments;

    ringgeometry.vertices.map((vertex, i) => {
      let segmenttheta = i % (thetaSegments + 1),
          segmentpercent = segmenttheta / thetaSegments;

      if (i && segmenttheta === 0)
        hypotenuse += radiusstep; // longer, each time around

      vertex = Object.assign(vertex, o.getvertex(hypotenuse, (
        thetaStart + thetaEnd * segmentpercent // segment angle
      )));
    });

    ringgeometry.verticesNeedUpdate = true;

    return ringgeometry;
  };

  o.update = (fuseopts, percent = 0) => {
    fuseopts.mesh.geometry = o.updateringgeometry(
      fuseopts, percent, fuseopts.mesh.geometry);

    // active if lt 100%
    fuseopts.active = percent < 1;

    return fuseopts;
  };

  // only update if active and !timeDone
  // consider moving timeDone to controlling script
  o.updateactive = (opts, fuseopts, elapsed) =>
    (fuseopts.active && !opts.timeDone)
      ? o.update(fuseopts, elapsed / fuseopts.duration)
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
