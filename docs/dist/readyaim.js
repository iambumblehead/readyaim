// Filename: evdelegator.js
// Timestamp: 2017.11.03-13:35:11 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

export default (o => {
  // delegator:
  //
  //   activestate :
  //     [[depth, 'elemid', {state}],
  //      [depth, 'elemid', {state}]]
  //
  //   statearr : [ ...statearr ]
  //
  o.create = () => ({
    listenersarr : [],
    activestate : null,
    statearr : []
  });

  o.setmouseoverstate = (delegator, activestate) => (
    delegator.mouseoverstate = activestate,
    delegator);

  o.getmouseoverstate = delegator =>
    delegator.mouseoverstate;

  o.rmmouseoverstate = delegator => (
    delegator.mouseoverstate = null,
    delegator);

  o.setactivestate = (delegator, activestate) => (
    delegator.activestate = activestate,
    delegator);

  o.getactivestate = delegator =>
    delegator.activestate;

  o.rmactivestate = delegator => (
    delegator.activestate = null,
    delegator);

  o.getactivestatemeta = delegator =>
    o.getstatemeta(o.getactivestate(delegator));

  // state:
  //
  //   [[depth, 'elemid', {state}],
  //    [depth, 'elemid', {state}]]
  //
  o.createstate = (depth, elemid, meta) => (
    [ depth, elemid, meta ]);

  o.isstatesame = (statea, stateb) =>
    o.getstateid(statea) === o.getstateid(stateb);

  o.createelemstate = (elem, meta) => (
    o.createstate(o.getelemdepth(elem), elem.id, meta));

  o.getstatemeta = delegatorstate =>
    delegatorstate && delegatorstate[2];

  o.getstateid = delegatorstate =>
    delegatorstate && delegatorstate[1];

  o.getstateelem = delegatorstate =>
    delegatorstate && document.getElementById(delegatorstate[1]);

  o.haselemid = (elem, elemid, elemidelem) =>
    Boolean(elem && (elemidelem = document.getElementById(elemid)) &&
            (elem.isEqualNode(elemidelem) || elemidelem.contains(elem)));

  o.getelemstate = (delegator, elem) =>
    delegator.statearr.find(([ , id ]) => (
      o.haselemid(elem, id)));

  o.getelemdepth = (elem, depth = 0) => (
    elem.parentNode
      ? o.getelemdepth(elem.parentNode, ++depth)
      : depth);

  // sorting arranges elements 'deeper' in the document to appear first
  //
  // for elements w/ parent/child relationship --yield child first
  o.delegatordepthsort = ([ elemadepth ], [ elembdepth ]) =>
    elemadepth > elembdepth ? 1 : -1;

  o.addstate = (delegator, state) => (
    delegator.statearr = delegator.statearr
      .filter(stateelem => !o.isstatesame(stateelem, state)),
    delegator.statearr.push(state),
    delegator.statearr = delegator.statearr.sort(o.delegatordepthsort),
    delegator);

  o.addelemstate = (delegator, elem, state) => {
    if (!elem || !elem.id) {
      console.error('parent element exist w/ valid id');
    } else {
      delegator = o.addstate(delegator, o.createelemstate(elem, state));
    }

    return delegator;
  };

  o.rmelemstate = (delegator, elem) => {
    delegator.statearr = delegator.statearr
      .filter(stateelem => o.getstateid(stateelem) !== elem.id);

    // completely removes *all* listeners associtated w/ delegator
    delegator.listenersarr.map(([ listeners, lsnfn ]) => {
      o.lsnrmarr(elem, listeners, lsnfn);
    });

    return delegator;
  };

  //
  // convenience data
  //
  o.lsnarr = (elem, evarr, fn) =>
    evarr.map(e => elem.addEventListener(e, fn));

  o.lsnrmarr = (elem, evarr, fn) =>
    evarr.map(e => elem.removeEventListener(e, fn));

  o.lsnpubarr = (delegator, cfg, elem, evarr, fn) => {
    const lsnfn = e => fn(cfg, e, fn);

    delegator.listenersarr.push([ evarr, lsnfn ]);

    o.lsnarr(elem, evarr, lsnfn);

    return delegator;
  };

  return o;
})({});

export default (o => {
  o.bool = (val, defval) => {
    if (String(val) === 'true')
      defval = true;
    else if (String(val) === 'false')
      defval = false;

    return Boolean(defval);    
  };

  o.arr = (val, defval) => {
    if (Array.isArray(val))
      defval = val;
    else if (typeof val === 'string')
      defval = val.split(',');

    return defval;    
  };

  o.num = (val, defval) => {
    if (typeof val === 'number')
      defval = val;
    else if (!Number.isNaN(Number.parseFloat(val)) && Number.isFinite(+val))
      defval = +val;

    return defval;
  };

  o.str = (val, defval) => {
    if (/string|number|boolean/.test(typeof val))
      defval = String(val);
    
    return defval;
  };

  o.ts = (val, defval) => {
    if (!Number.isNaN(Number.parseFloat(val)) && Number.isFinite(+val)) val = +val;
    if (val instanceof Date || (
        /string|number/.test(typeof val)))
      defval = (new Date(val)).getTime();

    return defval;
  };

  o.date = (val, defval) => {
    if (val instanceof Date )
      defval = val;
    else if (typeof val === 'number')
      defval = new Date( val );
    else if (typeof val === 'string') {
      if (!Number.isNaN(Number.parseFloat(val)) && Number.isFinite(+val))
        defval = new Date( +val );
      else if (!Number.isNaN(val = Date.parse(val)))
        defval = new Date(val);
    }

    return defval;
  };
  
  o.boolean = o.bool;
  o.number = o.num;
  o.string = o.str;

  Object.keys(o).forEach(fnname => (
    o['t'+fnname] = (val, defval) => 
      o[fnname](val || null, defval)
  ));

  return o;
})({});

// Filename: readyaim_three.js
// Timestamp: 2017.11.11-23:07:56 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

export default (o => {
  o.iscamera = (THREE, camera) =>
    camera instanceof THREE.Camera;

  o.setmeshcolor = (mesh, color) =>
    mesh.material.color.setHex(color);

  o.getimgtexture = (THREE, imgsrc, loader) => (
    loader = new THREE.TextureLoader(),
    loader.load(imgsrc));

  o.getfilterimgtexture = (THREE, imgsrc, texture) => (
    texture = o.getimgtexture(THREE, imgsrc),
    texture.minFilter = THREE.NearestFilter,
    texture.magFilter = THREE.LinearFilter,
    texture);

  o.getimgsprite = (THREE, cfg) => new THREE.Sprite(
    new THREE.SpriteMaterial({
      color : cfg.color || 0xffffff,
      map : o.getimgtexture(THREE, cfg.imgsrc)
    }));

  o.getscaleimgsprite = (THREE, cfg, sprite) => (
    sprite = o.getimgsprite(THREE, cfg),
    sprite.scale.set(cfg.scale[0], cfg.scale[1], 1),
    sprite);

  return o;
})({});

// Filename: readyaim_reticle.js
// Timestamp: 2017.11.11-23:07:38 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// one reticle per camera, crosshair or dot

import castas from './castas_121_castas.js'

import readyaim_three from './readyaim_007_src_readyaim_three.js'

export default (o => {
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

// Filename: readyaim_events.js
// Timestamp: 2017.11.11-23:06:23 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

export default (o => {
  o.GAZEOVER = 'gazeover';
  o.GAZEOUT = 'gazeout';
  o.GAZELONG = 'gazelong';
  o.GAZECLICK = 'gazeclick';

  o.publish = (state, ...args) => (
    typeof state.oneventfn === 'function'
      && state.oneventfn(state, ...args),
    state);

  return o;
})({});

// Filename: readyaim_mesh.js
// Timestamp: 2017.11.11-23:07:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import castas from './castas_121_castas.js'

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

// Filename: readyaim_fuse.js
// Timestamp: 2017.11.11-23:06:51 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// multiple fuse, one for each object
//
// ◎ ◉

import castas from './castas_121_castas.js'

export default (o => {
  o.getringgeometry = (THREE, opt) =>
    new THREE.RingGeometry(
      opt.innerRadius,
      opt.outerRadius,
      opt.thetaSegments, // outer perimeter segments
      opt.phiSegments,
      opt.thetaStart,
      Math.PI / 2);

  o.getringmesh = (THREE, opt) =>
    new THREE.Mesh(o.getringgeometry(THREE, opt), new THREE.MeshBasicMaterial({
      color : opt.color,
      side : THREE.BackSide,
      fog : false
    }));

  o.getfusemesh = (THREE, opt, mesh = o.getringmesh(THREE, opt)) => (
    mesh.visible = opt.visible,
    mesh.position.z = 0.0001, // at front of reticle
    mesh.rotation.y = 180 * (Math.PI / 180), // make clockwise
    mesh);

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

// Filename: readyaim_render.js
// Timestamp: 2017.11.11-23:07:19 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

import readyaim_reticle from './readyaim_007_src_readyaim_reticle.js'
import readyaim_events from './readyaim_007_src_readyaim_events.js'
import readyaim_three from './readyaim_007_src_readyaim_three.js'
import readyaim_mesh from './readyaim_007_src_readyaim_mesh.js'
import readyaim_fuse from './readyaim_007_src_readyaim_fuse.js'

export default (o => {
  o = state =>
    o.update(state);

  o.vibrate = opts =>
    navigator.vibrate && navigator.vibrate(opts);

  o.gettargetdata = (state, mesh) =>
    state.targets[mesh.uuid];

  o.rmtargetdata = (state, mesh) =>
    state.targets[mesh.uuid] = null;

  o.istargetgazeable = (state, mesh) => readyaim_mesh.isgazeable(
    o.gettargetdata(state, mesh));

  o.isreticletarget = (state, mesh, reticle) => Boolean(
    o.istargetgazeable(state, mesh) &&
      (mesh.visible || !reticle.ignoreInvisible));

  o.proximity = (state, reticle) => {
    let { camera } = state;

    // Use frustum to see if any targetable object is visible
    // http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current-camera
    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    state.cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

    state.frustum.setFromMatrix(state.cameraViewProjectionMatrix);

    reticle.mesh.visible = state.collisionList.find(mesh => (
      o.istargetgazeable(state, mesh) &&
        (mesh.visible || !reticle.ignoreInvisible) &&
        state.frustum.intersectsObject(mesh)
    ));

    return state;
  };

  o.gazeOut = (state, mesh, reticle) => {
    mesh.userData.hitTime = 0;

    state.fuse = readyaim_fuse.out(state.fuse);
    reticle.hit = false;
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    state = readyaim_events.publish(state, readyaim_events.GAZEOUT, mesh);
  };

  o.gazeOver = (state, mesh, reticle, fuse) => {
    let meshData = o.gettargetdata(state, mesh);

    // at reticle.update
    reticle.colorTo = meshData.reticle.hoverColor || reticle.globalColorTo;
    state.fuse = readyaim_fuse.over(state.fuse, meshData.fuse.duration, meshData.fuse.visible, meshData.fuse.color);

    if (meshData.fuseColor) {
      readyaim_three.setmeshcolor(fuse.mesh, meshData.fuse.color);
    }

    mesh.userData.hitTime = state.clock.getElapsedTime();

    o.vibrate(reticle.vibrateHover);

    state = readyaim_events.publish(state, readyaim_events.GAZEOVER, mesh);
  };

  o.gazeLong = (state, mesh, reticle, fuse) => {
    let elapsed = state.clock.getElapsedTime(),
        gazeTime = elapsed - mesh.userData.hitTime,
        distance;

    // There has to be a better  way...
    // Keep updating distance while user is focused on target
    if (reticle.active) {
      if (!state.lockDistance) {
        reticle.worldPosition.setFromMatrixPosition(mesh.matrixWorld);
        distance = state.camera.position.distanceTo(reticle.worldPosition);
        distance -= mesh.geometry.boundingSphere.radius;
      }

      reticle.hit = true;

      if (!state.lockDistance) {
        state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state, distance);
      }
    }

    // Fuse
    if (readyaim_fuse.isdurationengaged(fuse, gazeTime)) {
      fuse = readyaim_fuse.engage(fuse);
      o.vibrate(fuse.vibratePattern);

      state = readyaim_events.publish(state, readyaim_events.GAZELONG, mesh);
      // Reset the clock
      mesh.userData.hitTime = elapsed;
    } else {
      state.fuse = readyaim_fuse.updateactive(state.fuse, state.fuse, gazeTime);
    }
  };

  o.gazeClick = (state, mesh, fuse) => {
    let meshData = o.gettargetdata(state, mesh);

    if (meshData.fuse.clickCancel || fuse.clickCancel) {
      // Reset the clock
      mesh.userData.hitTime = state.clock.getElapsedTime();
      // Force gaze to end...this might be to assumptions
      state.fuse = readyaim_fuse.updateactive(fuse, fuse, fuse.duration);
    }

    // Does object have an action assigned to it?
    state = readyaim_events.publish(state, readyaim_events.GAZECLICK, mesh);
  };

  o.getintersecting = (state, reticle) => {
    let {
      raycaster,
      collisionList
    } = state;

    return raycaster.intersectObjects(collisionList).find(({ object }) => (
      o.isreticletarget(state, object, reticle)
    ));
  };

  o.getintersectingobject = (state, reticle) => {
    let intersecting = o.getintersecting(state, reticle);

    return intersecting && intersecting.object;
  };

  o.detectHit = (state, reticle) => {
    state.raycaster.setFromCamera(state.vector, state.camera);

    let targetmesh = o.getintersectingobject(state, reticle);

    if (targetmesh) {
      if (state.INTERSECTED !== targetmesh) {
        if (state.INTERSECTED) {
          o.gazeOut(state, state.INTERSECTED, state.reticle);
        }

        // Updated INTERSECTED with new object
        state.INTERSECTED = targetmesh;
        state.INTERSECTEDTS = Date.now();

        o.gazeOver(state, state.INTERSECTED, state.reticle, state.fuse);
      } else {
        o.gazeLong(state, state.INTERSECTED, state.reticle, state.fuse);
      }
    } else {
      if (state.INTERSECTED) {
        o.gazeOut(state, state.INTERSECTED, state.reticle);
      }

      state.INTERSECTED = null;
    }

    return state;
  };

  o.update = state => {
    const delta = state.clock.getDelta();

    state = o.detectHit(state, state.reticle);
    state = state.proximity ? o.proximity(state, state.reticle) : state;
    state.reticle = readyaim_reticle.update(state.reticle, delta);

    if (state.reticle.hit) {
      state.ongazefn(state, state.INTERSECTEDTS, state.INTERSECTED);
    }

    return state;
  };

  return o;
})();

// Filename: raedyaim.js
// Timestamp: 2017.11.11-23:06:59 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

// const THREE = require('three'),
import evdel from './evdelegate_004_evdelegate.js'
import castas from './castas_121_castas.js'

import readyaim_reticle from './readyaim_007_src_readyaim_reticle.js'
import readyaim_render from './readyaim_007_src_readyaim_render.js'
import readyaim_events from './readyaim_007_src_readyaim_events.js'
import readyaim_three from './readyaim_007_src_readyaim_three.js'
import readyaim_mesh from './readyaim_007_src_readyaim_mesh.js'
import readyaim_fuse from './readyaim_007_src_readyaim_fuse.js'

export default (o => {
  o = (THREE, camera, opts = {}) =>
    o.init(THREE, camera, opts);

  o.three = readyaim_three;
  o.update = readyaim_render.update;
  o.events = readyaim_events;

  o.addmesh = (THREE, state, mesh, opts = {}) => {
    let targetdata = readyaim_mesh.createtargetdata(THREE, mesh, opts);

    state.targets[targetdata.uuid] = targetdata;
    state.collisionList.push(mesh);

    return state;
  };

  o.rmmesh = (state, mesh) => {
    state.targets[mesh.uuid] = null;
    state.collisionList = state.collisionList.filter(cmesh => cmesh !== mesh);

    return state;
  };

  o.init = (THREE, camera, options = {}) => {
    let state = {};

    if (!readyaim_three.iscamera(THREE, camera)) {
      // window.readyaim_camera = camera;
      // window.readyaim_three = THREE;
      console.error('[!!!] readyaim: invalid camera', { camera });
      return null;
    }

    state.camera = camera;
    state.proximity = castas.bool(options.proximity, false);
    state.lockDistance = castas.bool(options.lockDistance, false);
    state.isClickEnabled = castas.bool(options.isClickEnabled, true);
    state.collisionList = [];
    state.targets = {};
    state.INTERSECTED = null;

    state.raycaster = new THREE.Raycaster();
    state.vector = new THREE.Vector2(0, 0);

    if (options.near && options.near >= 0)
      state.raycaster.near = options.near;

    if (options.far && options.far >= 0)
      state.raycaster.far = options.far;

    // reticle and fuse container
    state.parentContainer = new THREE.Object3D();
    state.camera.add(state.parentContainer);

    if (state.proximity) {
      state.frustum = new THREE.Frustum();
      state.cameraViewProjectionMatrix = new THREE.Matrix4();
    }

    state.clock = new THREE.Clock(true);

    state.reticle = readyaim_reticle.getopts(THREE, options.reticle, state);
    state.reticle.mesh = readyaim_reticle.getreticlemesh(THREE, state.reticle);
    state.parentContainer.add(state.reticle.mesh);
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    state.fuse = readyaim_fuse.getopts(THREE, options.fuse);
    state.fuse.mesh = readyaim_fuse.getfusemesh(THREE, state.fuse);
    state.fuse = readyaim_fuse.update(state.fuse, 0);

    state.parentContainer.add(state.fuse.mesh);

    return state;
  };

  // define dispatcher function, and enable touch/click
  o.attach = (state, elem, fnobj) => {
    if (!o.delegator) {
      o.delegator = evdel.create();

      evdel.lsnarr(document.body, [
        'touchend',
        'click'
      ], e => {
        let delegatorstate = evdel.getelemstate(o.delegator, e.target);
        // statemeta = delegatorstate && evdel.getstatemeta(delegatorstate);

        if (delegatorstate) {
          if (state.reticle.hit && state.INTERSECTED) {
            e.preventDefault();

            state = readyaim_events.publish(state, readyaim_events.GAZECLICK, state.INTERSECTED);
          }
        }
      });
    }

    // add state for this element
    o.delegator = evdel.addelemstate(o.delegator, elem, state);

    state.ongazefn = fnobj.ongazefn || (() => {});
    state.oneventfn = fnobj.oneventfn || (() => {});

    return state;
  };

  return o;
})({});
