(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.evdelegate_003_evdelegate = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// Filename: evdelegator.js
// Timestamp: 2017.11.03-13:35:11 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

module.exports = function (o) {
  // delegator:
  //
  //   activestate :
  //     [[depth, 'elemid', {state}],
  //      [depth, 'elemid', {state}]]
  //
  //   statearr : [ ...statearr ]
  //
  o.create = function () {
    return {
      listenersarr: [],
      activestate: null,
      statearr: []
    };
  };

  o.setmouseoverstate = function (delegator, activestate) {
    return delegator.mouseoverstate = activestate, delegator;
  };

  o.getmouseoverstate = function (delegator) {
    return delegator.mouseoverstate;
  };

  o.rmmouseoverstate = function (delegator) {
    return delegator.mouseoverstate = null, delegator;
  };

  o.setactivestate = function (delegator, activestate) {
    return delegator.activestate = activestate, delegator;
  };

  o.getactivestate = function (delegator) {
    return delegator.activestate;
  };

  o.rmactivestate = function (delegator) {
    return delegator.activestate = null, delegator;
  };

  o.getactivestatemeta = function (delegator) {
    return o.getstatemeta(o.getactivestate(delegator));
  };

  // state:
  //
  //   [[depth, 'elemid', {state}],
  //    [depth, 'elemid', {state}]]
  //
  o.createstate = function (depth, elemid, meta) {
    return [depth, elemid, meta];
  };

  o.isstatesame = function (statea, stateb) {
    return o.getstateid(statea) === o.getstateid(stateb);
  };

  o.createelemstate = function (elem, meta) {
    return o.createstate(o.getelemdepth(elem), elem.id, meta);
  };

  o.getstatemeta = function (delegatorstate) {
    return delegatorstate && delegatorstate[2];
  };

  o.getstateid = function (delegatorstate) {
    return delegatorstate && delegatorstate[1];
  };

  o.getstateelem = function (delegatorstate) {
    return delegatorstate && document.getElementById(delegatorstate[1]);
  };

  o.haselemid = function (elem, elemid, elemidelem) {
    return Boolean(elem && (elemidelem = document.getElementById(elemid)) && (elem.isEqualNode(elemidelem) || elemidelem.contains(elem)));
  };

  o.getelemstate = function (delegator, elem) {
    return delegator.statearr.find(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          id = _ref2[1];

      return o.haselemid(elem, id);
    });
  };

  o.getelemdepth = function (elem) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return elem.parentNode ? o.getelemdepth(elem.parentNode, ++depth) : depth;
  };

  // sorting arranges elements 'deeper' in the document to appear first
  //
  // for elements w/ parent/child relationship --yield child first
  o.delegatordepthsort = function (_ref3, _ref4) {
    var _ref6 = _slicedToArray(_ref3, 1),
        elemadepth = _ref6[0];

    var _ref5 = _slicedToArray(_ref4, 1),
        elembdepth = _ref5[0];

    return elemadepth > elembdepth ? 1 : -1;
  };

  o.addstate = function (delegator, state) {
    return delegator.statearr = delegator.statearr.filter(function (stateelem) {
      return !o.isstatesame(stateelem, state);
    }), delegator.statearr.push(state), delegator.statearr = delegator.statearr.sort(o.delegatordepthsort), delegator;
  };

  o.addelemstate = function (delegator, elem, state) {
    if (!elem || !elem.id) {
      console.error('parent element exist w/ valid id');
    } else {
      delegator = o.addstate(delegator, o.createelemstate(elem, state));
    }

    return delegator;
  };

  o.rmelemstate = function (delegator, elem) {
    delegator.statearr = delegator.statearr.filter(function (stateelem) {
      return o.getstateid(stateelem) !== elem.id;
    });

    // completely removes *all* listeners associtated w/ delegator
    delegator.listenersarr.map(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
          listeners = _ref8[0],
          lsnfn = _ref8[1];

      o.lsnrmarr(elem, listeners, lsnfn);
    });

    return delegator;
  };

  //
  // convenience data
  //
  o.lsnarr = function (elem, evarr, fn) {
    return evarr.map(function (e) {
      return elem.addEventListener(e, fn);
    });
  };

  o.lsnrmarr = function (elem, evarr, fn) {
    return evarr.map(function (e) {
      return elem.removeEventListener(e, fn);
    });
  };

  o.lsnpubarr = function (delegator, cfg, elem, evarr, fn) {
    var lsnfn = function lsnfn(e) {
      return fn(cfg, e, fn);
    };

    delegator.listenersarr.push([evarr, lsnfn]);

    o.lsnarr(elem, evarr, lsnfn);

    return delegator;
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.castas_003_castas = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// Filename: castas.js  
// Timestamp: 2017.04.23-14:09:16 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var castas = module.exports = function (o) {

  o.bool = function (val, defval) {
    if (String(val) === 'true') defval = true;else if (String(val) === 'false') defval = false;

    return Boolean(defval);
  };

  o.arr = function (val, defval) {
    if (Array.isArray(val)) defval = val;else if (typeof val === 'string') defval = val.split(',');

    return defval;
  };

  o.num = function (val, defval) {
    if (typeof val === 'number') defval = val;else if (!isNaN(parseFloat(val)) && isFinite(val)) defval = +val;

    return defval;
  };

  o.str = function (val, defval) {
    if (/string|number|boolean/.test(typeof val === 'undefined' ? 'undefined' : _typeof(val))) defval = val;

    return String(defval);
  };

  o.ts = function (val, defval) {
    if (!isNaN(parseFloat(val)) && isFinite(val)) val = +val;
    if (val instanceof Date || /string|number/.test(typeof val === 'undefined' ? 'undefined' : _typeof(val))) defval = new Date(val).getTime();

    return defval;
  };

  o.boolean = o.bool;
  o.number = o.num;
  o.string = o.str;

  Object.keys(o).forEach(function (fnname) {
    return o['t' + fnname] = function (val, defval) {
      return o[fnname](val || null, defval);
    };
  });

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_three = f()}})(function(){var define,module,exports;module={exports:(exports={})};
"use strict";

// Filename: readyaim_three.js
// Timestamp: 2017.11.11-23:07:56 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

module.exports = function (o) {
  o.iscamera = function (THREE, camera) {
    return camera instanceof THREE.Camera;
  };

  o.setmeshcolor = function (mesh, color) {
    return mesh.material.color.setHex(color);
  };

  o.getimgtexture = function (THREE, imgsrc, loader) {
    return loader = new THREE.TextureLoader(), loader.load(imgsrc);
  };

  o.getfilterimgtexture = function (THREE, imgsrc, texture) {
    return texture = o.getimgtexture(THREE, imgsrc), texture.minFilter = THREE.NearestFilter, texture.magFilter = THREE.LinearFilter, texture;
  };

  o.getimgsprite = function (THREE, cfg) {
    return new THREE.Sprite(new THREE.SpriteMaterial({
      color: cfg.color || 0xffffff,
      map: o.getimgtexture(THREE, cfg.imgsrc)
    }));
  };

  o.getscaleimgsprite = function (THREE, cfg, sprite) {
    return sprite = o.getimgsprite(THREE, cfg), sprite.scale.set(cfg.scale[0], cfg.scale[1], 1), sprite;
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_reticle = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: readyaim_reticle.js
// Timestamp: 2017.11.11-23:07:38 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// one reticle per camera, crosshair or dot

var castas = castas_003_castas,
    readyaim_three = readyaim_005_src_readyaim_three;

module.exports = function (o) {
  o.getreticlesprite = function (THREE, cfg, scene, camera) {
    var sprite = readyaim_three.getimgsprite(THREE, cfg);

    sprite.position.set(0, 0, -10);

    camera.add(sprite);

    return scene;
  };

  o.clampBottom = function (x, a) {
    return x < a ? a : x;
  };

  // settings... global cfg
  // Sets the depth and scale of the reticle - reduces eyestrain and depth issues
  o.setDepthAndScale = function (opts, canvasscene, depth) {
    var crosshair = opts.mesh.parent,
        z = Math.abs(depth || opts.restPoint),
        // Default to user far setting
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

  o.getreticlegeometry = function (THREE, opts) {
    var geometry = o.getringgeometry(THREE, {
      innerRadius: opts.innerRadius,
      outerRadius: opts.outerRadius
    });

    var geometryScale = o.getringgeometry(THREE, {
      innerRadius: opts.innerRadiusTo,
      outerRadius: opts.outerRadiusTo
    });

    // Add Morph Targets for scale animation
    geometry.morphTargets.push({
      name: 'target1',
      vertices: geometryScale.vertices
    });

    return geometry;
  };

  o.getreticlemesh = function (THREE, opts) {
    return new THREE.Mesh(o.getreticlegeometry(THREE, opts), new THREE.MeshBasicMaterial({
      color: opts.color,
      morphTargets: true,
      fog: false,
      visible: opts.visible
    }));
  };

  o.getringgeometry = function (THREE, opt) {
    return new THREE.RingGeometry(opt.innerRadius, opt.outerRadius, opt.thetaSegments || 32, opt.phiSegments || 3, opt.thetaStart0, Math.PI * 2);
  }; // 90 degree

  o.getopts = function (THREE) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var canvasscene = arguments[2];

    var finopt = {};

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

  o.update = function (opts, delta) {
    var accel = delta * opts.speed;

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

  o.updateactive = function (opts, delta) {
    return opts.active ? o.update(opts, delta) : opts;
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_events = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: readyaim_events.js
// Timestamp: 2017.11.11-23:06:23 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

module.exports = function (o) {
  o.GAZEOVER = 'gazeover';
  o.GAZEOUT = 'gazeout';
  o.GAZELONG = 'gazelong';
  o.GAZECLICK = 'gazeclick';

  o.publish = function (state) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return typeof state.oneventfn === 'function' && state.oneventfn.apply(state, [state].concat(args)), state;
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_mesh = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: readyaim_mesh.js
// Timestamp: 2017.11.11-23:07:09 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var castas = castas_003_castas;

module.exports = function (o) {
  o.getoptsfuse = function (THREE, opts) {
    return {
      duration: castas.num(opts.duration, 1.5),
      color: new THREE.Color(opts.color || 0xffffff),
      visible: castas.bool(opts.visible, true),
      clickCancel: castas.bool(opts.clickCancel, false)
    };
  };

  o.getoptsreticle = function (THREE, opts) {
    return {
      hoverColor: opts.hoverColor && new THREE.Color(opts.hoverColor)
    };
  };

  o.createtargetdata = function (THREE, mesh, opts) {
    return {
      uuid: mesh.uuid,
      gazeable: true,
      fuse: o.getoptsfuse(THREE, opts.fuse || {}),
      reticle: o.getoptsreticle(THREE, opts.reticle || {})
    };
  };

  o.isgazeable = function (targetdata) {
    return Boolean(targetdata && targetdata.gazeable);
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_fuse = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: readyaim_fuse.js
// Timestamp: 2017.11.11-23:06:51 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>
//
// multiple fuse, one for each object
//
// ◎ ◉

var castas = castas_003_castas;

module.exports = function (o) {
  o.getringgeometry = function (THREE, opt) {
    return new THREE.RingGeometry(opt.innerRadius, opt.outerRadius, opt.thetaSegments, // outer perimeter segments
    opt.phiSegments, opt.thetaStart, Math.PI / 2);
  };

  o.getringmesh = function (THREE, opt) {
    return new THREE.Mesh(o.getringgeometry(THREE, opt), new THREE.MeshBasicMaterial({
      color: opt.color,
      side: THREE.BackSide,
      fog: false
    }));
  };

  o.getfusemesh = function (THREE, opt) {
    var mesh = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : o.getringmesh(THREE, opt);
    return mesh.visible = opt.visible, mesh.position.z = 0.0001, // at front of reticle
    mesh.rotation.y = 180 * (Math.PI / 180), // make clockwise
    mesh;
  };

  o.getopts = function (THREE) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var finopt = {};

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
  o.getvertex = function (hypotenuse, radangle) {
    return {
      x: hypotenuse * Math.cos(radangle),
      y: hypotenuse * Math.sin(radangle)
    };
  };

  //
  // for speed, consider a different approach...
  // adding more faces (resolution), then
  // painting faces within range
  //
  o.updateringgeometry = function (opts, percent, ringgeometry) {
    var thetaEnd = percent * Math.PI * 2,
        thetaStart = Number(opts.thetaStart),
        thetaSegments = Number(opts.thetaSegments),
        hypotenuse = Number(opts.innerRadius),
        radiusstep = (opts.outerRadius - hypotenuse) / opts.phiSegments;

    ringgeometry.vertices.map(function (vertex, i) {
      var segmenttheta = i % (thetaSegments + 1),
          segmentpercent = segmenttheta / thetaSegments;

      if (i && segmenttheta === 0) hypotenuse += radiusstep; // longer, each time around

      vertex = Object.assign(vertex, o.getvertex(hypotenuse, thetaStart + thetaEnd * segmentpercent // segment angle
      ));
    });

    ringgeometry.verticesNeedUpdate = true;

    return ringgeometry;
  };

  o.update = function (fuseopts) {
    var percent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    fuseopts.mesh.geometry = o.updateringgeometry(fuseopts, percent, fuseopts.mesh.geometry);

    // active if lt 100%
    fuseopts.active = percent < 1;

    return fuseopts;
  };

  // only update if active and !timeDone
  // consider moving timeDone to controlling script
  o.updateactive = function (opts, fuseopts, elapsed) {
    return fuseopts.active && !opts.timeDone ? o.update(fuseopts, elapsed / fuseopts.duration) : fuseopts;
  };

  o.hide = function (fuseopts) {
    return fuseopts.mesh.visibile = false, fuseopts;
  };

  o.out = function (fuseopts) {
    return o.update(o.hide(Object.assign(fuseopts, {
      active: false,
      timeDone: false
    })), 0);
  };

  o.over = function (fuseopts, duration, visible, color) {
    fuseopts.duration = duration || fuseopts.globalDuration;
    fuseopts.active = true;
    fuseopts = o.update(fuseopts, 0);
    fuseopts.mesh.visible = visible || fuseopts.visible;
    fuseopts.mesh.material.color.set(color);

    return fuseopts;
  };

  o.isdurationengaged = function (fuseopts, duration) {
    return fuseopts.duration <= duration && fuseopts.active === false && fuseopts.timeDone === false;
  };

  o.engage = function (fuseopts) {
    return fuseopts.timeDone = true, fuseopts.mesh.visible = false, fuseopts;
  };

  return o;
}({});
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim_render = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: readyaim_render.js
// Timestamp: 2017.11.11-23:07:19 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

var readyaim_reticle = readyaim_005_src_readyaim_reticle,
    readyaim_events = readyaim_005_src_readyaim_events,
    readyaim_three = readyaim_005_src_readyaim_three,
    readyaim_mesh = readyaim_005_src_readyaim_mesh,
    readyaim_fuse = readyaim_005_src_readyaim_fuse;

module.exports = function (_o) {
  _o = function o(state) {
    return _o.update(state);
  };

  _o.vibrate = function (opts) {
    return navigator.vibrate && navigator.vibrate(opts);
  };

  _o.gettargetdata = function (state, mesh) {
    return state.targets[mesh.uuid];
  };

  _o.rmtargetdata = function (state, mesh) {
    return state.targets[mesh.uuid] = null;
  };

  _o.istargetgazeable = function (state, mesh) {
    return readyaim_mesh.isgazeable(_o.gettargetdata(state, mesh));
  };

  _o.isreticletarget = function (state, mesh, reticle) {
    return Boolean(_o.istargetgazeable(state, mesh) && (mesh.visible || !reticle.ignoreInvisible));
  };

  _o.proximity = function (state, reticle) {
    var camera = state.camera;

    // Use frustum to see if any targetable object is visible
    // http://stackoverflow.com/questions/17624021/determine-if-a-mesh-is-visible-on-the-viewport-according-to-current-camera

    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    state.cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

    state.frustum.setFromMatrix(state.cameraViewProjectionMatrix);

    reticle.mesh.visible = state.collisionList.find(function (mesh) {
      return _o.istargetgazeable(state, mesh) && (mesh.visible || !reticle.ignoreInvisible) && state.frustum.intersectsObject(mesh);
    });

    return state;
  };

  _o.gazeOut = function (state, mesh, reticle) {
    mesh.userData.hitTime = 0;

    state.fuse = readyaim_fuse.out(state.fuse);
    reticle.hit = false;
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    state = readyaim_events.publish(state, readyaim_events.GAZEOUT, mesh);
  };

  _o.gazeOver = function (state, mesh, reticle, fuse) {
    var meshData = _o.gettargetdata(state, mesh);

    // at reticle.update
    reticle.colorTo = meshData.reticle.hoverColor || reticle.globalColorTo;
    state.fuse = readyaim_fuse.over(state.fuse, meshData.fuse.duration, meshData.fuse.visible, meshData.fuse.color);

    if (meshData.fuseColor) {
      readyaim_three.setmeshcolor(fuse.mesh, meshData.fuse.color);
    }

    mesh.userData.hitTime = state.clock.getElapsedTime();

    _o.vibrate(reticle.vibrateHover);

    state = readyaim_events.publish(state, readyaim_events.GAZEOVER, mesh);
  };

  _o.gazeLong = function (state, mesh, reticle, fuse) {
    var elapsed = state.clock.getElapsedTime(),
        gazeTime = elapsed - mesh.userData.hitTime,
        distance = void 0;

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
      _o.vibrate(fuse.vibratePattern);

      state = readyaim_events.publish(state, readyaim_events.GAZELONG, mesh);
      // Reset the clock
      mesh.userData.hitTime = elapsed;
    } else {
      state.fuse = readyaim_fuse.updateactive(state.fuse, state.fuse, gazeTime);
    }
  };

  _o.gazeClick = function (state, mesh, fuse) {
    var meshData = _o.gettargetdata(state, mesh);

    if (meshData.fuse.clickCancel || fuse.clickCancel) {
      // Reset the clock
      mesh.userData.hitTime = state.clock.getElapsedTime();
      // Force gaze to end...this might be to assumptions
      state.fuse = readyaim_fuse.updateactive(fuse, fuse, fuse.duration);
    }

    // Does object have an action assigned to it?
    state = readyaim_events.publish(state, readyaim_events.GAZECLICK, mesh);
  };

  _o.getintersecting = function (state, reticle) {
    var raycaster = state.raycaster,
        collisionList = state.collisionList;


    return raycaster.intersectObjects(collisionList).find(function (_ref) {
      var object = _ref.object;
      return _o.isreticletarget(state, object, reticle);
    });
  };

  _o.getintersectingobject = function (state, reticle) {
    var intersecting = _o.getintersecting(state, reticle);

    return intersecting && intersecting.object;
  };

  _o.detectHit = function (state, reticle) {
    state.raycaster.setFromCamera(state.vector, state.camera);

    var targetmesh = _o.getintersectingobject(state, reticle);

    if (targetmesh) {
      if (state.INTERSECTED !== targetmesh) {
        if (state.INTERSECTED) {
          _o.gazeOut(state, state.INTERSECTED, state.reticle);
        }

        // Updated INTERSECTED with new object
        state.INTERSECTED = targetmesh;
        state.INTERSECTEDTS = Date.now();

        _o.gazeOver(state, state.INTERSECTED, state.reticle, state.fuse);
      } else {
        _o.gazeLong(state, state.INTERSECTED, state.reticle, state.fuse);
      }
    } else {
      if (state.INTERSECTED) {
        _o.gazeOut(state, state.INTERSECTED, state.reticle);
      }

      state.INTERSECTED = null;
    }

    return state;
  };

  _o.update = function (state) {
    var delta = state.clock.getDelta();

    state = _o.detectHit(state, state.reticle);
    state = state.proximity ? _o.proximity(state, state.reticle) : state;
    state.reticle = readyaim_reticle.update(state.reticle, delta);

    if (state.reticle.hit) {
      state.ongazefn(state, state.INTERSECTEDTS, state.INTERSECTED);
    }

    return state;
  };

  return _o;
}();
return module.exports;});

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.readyaim_005_src_readyaim = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';

// Filename: raedyaim.js
// Timestamp: 2017.11.11-23:06:59 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

// const THREE = require('three'),
var evdel = evdelegate_003_evdelegate,
    castas = castas_003_castas,
    readyaim_reticle = readyaim_005_src_readyaim_reticle,
    readyaim_render = readyaim_005_src_readyaim_render,
    readyaim_events = readyaim_005_src_readyaim_events,
    readyaim_three = readyaim_005_src_readyaim_three,
    readyaim_mesh = readyaim_005_src_readyaim_mesh,
    readyaim_fuse = readyaim_005_src_readyaim_fuse;

module.exports = function (_o) {
  _o = function o(THREE, camera) {
    var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return _o.init(THREE, camera, opts);
  };

  _o.three = readyaim_three;
  _o.update = readyaim_render.update;
  _o.events = readyaim_events;

  _o.addmesh = function (THREE, state, mesh) {
    var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    var targetdata = readyaim_mesh.createtargetdata(THREE, mesh, opts);

    state.targets[targetdata.uuid] = targetdata;
    state.collisionList.push(mesh);

    return state;
  };

  _o.rmmesh = function (state, mesh) {
    state.targets[mesh.uuid] = null;
    state.collisionList = state.collisionList.filter(function (cmesh) {
      return cmesh !== mesh;
    });

    return state;
  };

  _o.init = function (THREE, camera) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var state = {};

    if (!readyaim_three.iscamera(THREE, camera)) {
      window.readyaim_camera = camera;
      window.readyaim_three = THREE;
      console.error('[!!!] readyaim: invalid camera', { camera: camera });
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

    if (options.near && options.near >= 0) state.raycaster.near = options.near;

    if (options.far && options.far >= 0) state.raycaster.far = options.far;

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
  _o.attach = function (state, elem, fnobj) {

    if (!_o.delegator) {
      _o.delegator = evdel.create();

      evdel.lsnarr(document.body, ['touchend', 'click'], function (e) {
        var delegatorstate = evdel.getelemstate(_o.delegator, e.target);
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
    _o.delegator = evdel.addelemstate(_o.delegator, elem, state);

    state.ongazefn = fnobj.ongazefn || function () {};
    state.oneventfn = fnobj.oneventfn || function () {};

    return state;
  };

  return _o;
}({});
return module.exports;});
