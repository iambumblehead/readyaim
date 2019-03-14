// Filename: readyaim_reticle.js
// Timestamp: 2017.11.11-23:07:38 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// one reticle per camera, crosshair or dot

const castas = require('castas'),

      readyaim_three = require('./readyaim_three');

module.exports = (o => {
  o.getreticlesprite = (THREE, cfg, scene, camera) => {
    let sprite = readyaim_three.getimgsprite(THREE, cfg);

    sprite.position.set(0, 0, -10);

    camera.add(sprite);

    return scene;
  };

  o.clampBottom = (x, a) =>
    x < a ? a : x;

  // settings... global cfg
  // Sets the depth and scale of the reticle - reduces eyestrain and depth issues
  o.setDepthAndScale = function (opts, canvasscene, depth) {
    let crosshair = opts.mesh.parent,
        z = Math.abs(depth || opts.restPoint), // Default to user far setting
        cameraZ = canvasscene.camera.position.z,
        // Force reticle to appear the same size - scale
        // http://answers.unity3d.com/questions/419342/make-gameobject-size-always-be-the-same.html
        scale = Math.abs(cameraZ - z) - Math.abs(cameraZ);

    // Set Depth
    crosshair.position.x = 0;
    crosshair.position.y = 0;
    crosshair.position.z = o.clampBottom(z, canvasscene.camera.near + 0.1) * -1;

    // Set Scale
    crosshair.scale.set(scale, scale, scale);

    return opts;
  };

  o.getreticlegeometry = (THREE, opts) => {
    const geometry = o.getringgeometry(THREE, {
      innerRadius : opts.innerRadius,
      outerRadius : opts.outerRadius
    });

    let position = o.getringgeometry(THREE, {
      innerRadius : opts.innerRadiusTo,
      outerRadius : opts.outerRadiusTo
    }).attributes.position.clone();

    // Add Morph Targets for scale animation
    for (let j = 0, jl = position.count; j < jl; j++)
      position.setXYZ(j, position.getX(j), position.getY(j), position.getZ(j));

    geometry.morphAttributes.position = [ position ];
    return geometry;
  };

  o.getreticlemesh = (THREE, opts) =>
    new THREE.Mesh(o.getreticlegeometry(THREE, opts), new THREE.MeshBasicMaterial({
      color : opts.color,
      morphTargets : true,
      fog : false,
      visible : opts.visible
    }));

  o.getringgeometry = (THREE, opt) =>
    new THREE.RingBufferGeometry(
      opt.innerRadius,
      opt.outerRadius,
      opt.thetaSegments || 32,
      opt.phiSegments || 3,
      opt.thetaStart0,
      Math.PI * 2); // 90 degree

  o.getopts = (THREE, opts = {}, canvasscene) => {
    let finopt = {};

    finopt.active = true;
    finopt.visible = castas.bool(opts.visible, true);
    finopt.restPoint = castas.bool(opts.restPoint, canvasscene.camera.far - 10.0);
    finopt.globalColor = opts.color || 0xcc0000;
    finopt.innerRadius = castas.num(opts.innerRadius, 0.0004);
    finopt.outerRadius = castas.num(opts.outerRadius, 0.003);
    finopt.worldPosition = new THREE.Vector3();
    finopt.ignoreInvisible = castas.bool(opts.ignoreInvisible, true);

    // Hover
    finopt.innerRadiusTo = castas.num(opts.hoverInnerRadiusTo, 0.02);
    finopt.outerRadiusTo = castas.num(opts.hoverOuterRadiusTo, 0.024);
    finopt.globalColorTo = opts.hoverGlobalColorTo || finopt.globalColor;
    finopt.vibrateHover = castas.num(opts.hoverVibrate, 50);
    finopt.hit = false;

    // Click
    finopt.vibrateClick = castas.num(opts.clickvibrate, 50);

    // Animation options
    finopt.speed = castas.num(opts.hoverSpeed, 5);
    finopt.moveSpeed = 0;

    // Colors
    finopt.globalColor = new THREE.Color(finopt.globalColor);
    finopt.color = finopt.globalColor.clone();
    finopt.globalColorTo = new THREE.Color(finopt.globalColorTo);
    finopt.colorTo = finopt.globalColorTo.clone();

    return finopt;
  };

  o.update = (opts, delta) => {
    let accel = delta * opts.speed;

    if (opts.hit) {
      opts.moveSpeed += accel;
      opts.moveSpeed = Math.min(opts.moveSpeed, 1);
    } else {
      opts.moveSpeed -= accel;
      opts.moveSpeed = Math.max(opts.moveSpeed, 0);
    }

    opts.mesh.morphTargetInfluences[0] = opts.moveSpeed;
    opts.color = opts.globalColor.clone();
    opts.mesh.material.color = opts.color.lerp(opts.colorTo, opts.moveSpeed);

    return opts;
  };

  o.updateactive = (opts, delta) => opts.active
    ? o.update(opts, delta)
    : opts;

  return o;
})({});
