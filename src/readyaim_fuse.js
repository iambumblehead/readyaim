// Filename: readyaim_fuse.js
// Timestamp: 2017.11.11-23:06:51 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// multiple fuse, one for each object
//
// ◎ ◉

import castas from 'castas'

const fuseState = {
  radiusMin: {value: 4},
  radiusMax: {value: 5},
  thetaRatio: {value: 0.5}
}

// https://discourse.threejs.org/t/ \
//   theta-updating-the-circlegeometry-not-working/50375/4
const fuseGeometryPlaneGet = THREE => {
  return new THREE.PlaneGeometry(10, 10, 10, 72)
}

const fuseMeshBasicMaterialGet = THREE => {
  return new THREE.MeshBasicMaterial({
    color: "aqua",
    onBeforeCompile: shader => {
      shader.uniforms.thetaRatio = fuseState.thetaRatio;
      shader.uniforms.radiusMin = fuseState.radiusMin;
      shader.uniforms.radiusMax = fuseState.radiusMax;
      shader.vertexShader = `
        uniform float thetaRatio;
        uniform float radiusMin;
      uniform float radiusMax;
      ${shader.vertexShader}
    `.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
      float angle = uv.y * PI2 * thetaRatio;
      float radius = radiusMin + (radiusMax - radiusMin) * uv.x;
      transformed.x = cos(angle) * radius;
      transformed.y = sin(angle) * radius;
      
      `);
    }
  })
}

const fuseMeshGet = (THREE, d) => {
  const mesh = new THREE.Mesh(
    fuseGeometryPlaneGet(THREE),
    fuseMeshBasicMaterialGet(THREE, d))

  mesh.position.z = -80
  // mesh.position.z = 0.0001 // at front of reticle
  // mesh.rotation.y = 180 * (Math.PI / 180) // make clockwise

  return mesh
};

export default (o => {
  o.fuseMeshGet = fuseMeshGet

  o.getopts = (THREE, opts = {}) => {
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

  o.update = (fuseopts, percent = 0) => {
    fuseState.thetaRatio.value = percent
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

  o.over = (fuseopts, duration, visible, color) => {
    fuseopts.duration = duration || fuseopts.globalDuration;
    fuseopts.active = true;
    fuseopts = o.update(fuseopts, 0);
    fuseopts.mesh.visible = visible || fuseopts.visible;
    fuseopts.mesh.material.color.set(color);

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
