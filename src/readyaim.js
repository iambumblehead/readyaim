// Filename: raedyaim.js
// Timestamp: 2017.11.11-23:06:59 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const THREE = require('three'),
      evdel = require('evdelegate'),
      castas = require('castas'),

      readyaim_reticle = require('./readyaim_reticle'),
      readyaim_render = require('./readyaim_render'),
      readyaim_events = require('./readyaim_events'),
      readyaim_three = require('./readyaim_three'),
      readyaim_mesh = require('./readyaim_mesh'),
      readyaim_fuse = require('./readyaim_fuse');

module.exports = (o => {
  o = (camera, opts = {}) =>
    o.init(camera, opts);

  o.three = readyaim_three;
  o.update = readyaim_render.update;
  o.events = readyaim_events;

  o.addmesh = (state, mesh, opts = {}) => {
    let targetdata = readyaim_mesh.createtargetdata(mesh, opts);

    state.targets[targetdata.uuid] = targetdata;
    state.collisionList.push(mesh);

    return state;
  };

  o.rmmesh = (state, mesh) => {
    state.targets[mesh.uuid] = null;
    state.collisionList = state.collisionList.filter(cmesh => cmesh !== mesh);

    return state;
  };

  o.init = (camera, options = {}) => {
    let state = {};

    if (!readyaim_three.iscamera(camera)) {
      console.error('[!!!] readyaim: invalid camera');
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

    state.reticle = readyaim_reticle.getopts(options.reticle, state);
    state.reticle.mesh = readyaim_reticle.getreticlemesh(state.reticle);
    state.parentContainer.add(state.reticle.mesh);
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    state.fuse = readyaim_fuse.getopts(options.fuse);
    state.fuse.mesh = readyaim_fuse.getfusemesh(state.fuse);
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
