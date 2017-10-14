// Filename: raedyaim.js  
// Timestamp: 2017.10.14-13:28:12 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const THREE = require('three'),
      castas = require('castas'),

      evtdelegator = require('./evtdelegator'),
      readyaim_reticle = require('./readyaim_reticle'),
      readyaim_three = require('./readyaim_three'),
      readyaim_mesh = require('./readyaim_mesh'),
      readyaim_fuse = require('./readyaim_fuse');

module.exports = (o => {

  o = (camera, opts={}) =>
    o.init(camera, opts);
  
  o.vibrate = opts =>
    navigator.vibrate && navigator.vibrate(opts);

  o.gettargetdata = (state, mesh) =>
    state.targets[mesh.uuid];

  o.rmtargetdata = (state, mesh) =>
    state.targets[mesh.uuid] = null;

  o.ontargetgazeover = (state, mesh) =>
    o.gettargetdata(state, mesh).ongazeover(mesh);
  
  o.ontargetgazeout = (state, mesh) =>
    o.gettargetdata(state, mesh).ongazeout(mesh);

  o.ontargetgazelong = (state, mesh) =>
    o.gettargetdata(state, mesh).ongazelong(mesh);

  o.ontargetgazeclick = (state, mesh) =>
    o.gettargetdata(state, mesh).ongazeclick(mesh);

  o.istargetgazeable = (state, mesh) => readyaim_mesh.isgazeable(
    o.gettargetdata(state, mesh));
  
  o.isreticletarget = (state, mesh, reticle) => Boolean(
    o.istargetgazeable(state, mesh) &&
      (mesh.visible || !reticle.ignoreInvisible));

  o.proximity = (state, reticle) => {
    let camera = state.camera;

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
  };

  var detectHit = (state, reticle) => {
    state.raycaster.setFromCamera(state.vector, state.camera);

    var intersects = state.raycaster.intersectObjects(state.collisionList);
    var intersectsCount = intersects.length;
    //Detect
    if (intersectsCount) {
      var newMesh,
          targetData,
          intersect;

      //Check if what we are hitting can be used
      intersect = intersects.find(({ object }) => (
        o.isreticletarget(state, object, reticle)
      ));

      newMesh = intersect && intersect.object;

      //There is no valid object
      if (!newMesh) return;

      //Is it a new object?
      if (state.INTERSECTED != newMesh) {
        //If old INTERSECTED i.e. not null reset and gazeout 
        if (state.INTERSECTED) {
          gazeOut(state, state.INTERSECTED, state.reticle);
        };

        //Updated INTERSECTED with new object
        state.INTERSECTED = newMesh;
        //Is the object gazeable?
        //if (INTERSECTED.gazeable) {
        //Yes
        gazeOver(state, state.INTERSECTED, state.reticle, state.fuse);
        //}
      } else {
        //Ok it looks like we are in love
        gazeLong(state, state.INTERSECTED, state.reticle, state.fuse);
      }
    } else {
      //Is the object gazeable?
      //if (INTERSECTED.gazeable) {
      if (state.INTERSECTED) {
        //GAZE OUT
        gazeOut(state, state.INTERSECTED, state.reticle);
      }
      //}
      state.INTERSECTED = null;
    }

    return state;
  };

  var gazeOut = (state, mesh, reticle) => {
    mesh.userData.hitTime = 0;

    state.fuse = readyaim_fuse.out(state.fuse, state.fuse);
    reticle.hit = false;
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    o.ontargetgazeout(state, mesh);
  };

  var gazeOver = (state, mesh, reticle, fuse) => {
    var meshData = o.gettargetdata(state, mesh);

    // at reticle.update
    reticle.colorTo = meshData.reticle.hoverColor || reticle.globalColorTo;
    state.fuse = readyaim_fuse.over(state.fuse, meshData.fuse.duration, meshData.fuse.visible);
    
    if (meshData.fuseColor) {
      readyaim_three.setmeshcolor(fuse.mesh, meshData.fuse.color);
    }

    mesh.userData.hitTime = state.clock.getElapsedTime();

    o.vibrate(reticle.vibrateHover);

    o.ontargetgazeover(state, mesh);
  };

  var gazeLong = (state, mesh, reticle, fuse) => {
    var distance;
    var elapsed = state.clock.getElapsedTime();
    var gazeTime = elapsed - mesh.userData.hitTime;
    //There has to be a better  way...
    //Keep updating distance while user is focused on target
    if (reticle.active) {
      if (!state.lockDistance) {
        reticle.worldPosition.setFromMatrixPosition(mesh.matrixWorld);
        distance = state.camera.position.distanceTo(reticle.worldPosition);
        distance -= mesh.geometry.boundingSphere.radius;
      }

      reticle.hit = true;

      if (!state.lockDistance) {
        state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state, distance);
        //          reticle.setDepthAndScale(distance);
      }
    }

    //Fuse

    //if (gazeTime >= fuse.duration && !fuse.active && !fuse.timeDone) {
    if (readyaim_fuse.isdurationengaged(fuse, gazeTime)) {
      //Vibrate
      fuse = readyaim_fuse.engage(fuse);
      o.vibrate(fuse.vibratePattern);
      o.ontargetgazelong(state, mesh);
      //Reset the clock
      mesh.userData.hitTime = elapsed;
    } else {
      state.fuse = readyaim_fuse.updateactive(state.fuse, state.fuse, gazeTime);
    }
  };

  var gazeClick = (state, mesh, fuse) => {
    var meshData = o.gettargetdata(state, mesh);
    var clickCancel = meshData.fuse.clickCancel != null
        ? meshData.fuse.clickCancel
        : fuse.clickCancel;

    if (clickCancel) {
      //Reset the clock
      mesh.userData.hitTime = state.clock.getElapsedTime();
      //Force gaze to end...this might be to assumptions
      state.fuse = readyaim_fuse.updateactive(fuse, fuse, fuse.duration);
      //fuse.update(fuse.duration);
    }

    //Does object have an action assigned to it?
    o.ontargetgazeclick(state, mesh);
  };

  o.addmesh = (state, mesh, options = {}) => {
    let targetdata = readyaim_mesh.gettargetdata(mesh, options);
    state.targets[targetdata.uuid] = targetdata;
    state.collisionList.push(mesh);
    return state;
  };  
  
  o.remove = (state, mesh) => {
    state.targets[mesh.uuid] = null;
    state.collisionList = state.collisionList.filter(cmesh => cmesh !== mesh);

    return state;
  };

  o.update = (state) => {
    var delta = state.clock.getDelta(); //
    detectHit(state, state.reticle);

    //Proximity
    if (state.proximity) {
      o.proximity(state, state.reticle);
    }
    //Animation
    state.reticle = readyaim_reticle.update(state.reticle, delta);

    return state;
  };

  o.init = (camera, options = {}) => {
    if (!readyaim_three.iscamera(camera)) {
      console.error("[!!!] readyaim: invalid camera");
      return null;
    }

    let state = {};

    state.camera = camera; //required
    state.proximity = castas.bool(options.proximity, false);
    state.lockDistance = castas.bool(options.lockDistance, false);
    state.isClickEnabled = castas.bool(options.isClickEnabled, true);
    state.collisionList = [];
    state.targets = {};
    state.INTERSECTED = null;

    //Raycaster Setup
    state.raycaster = new THREE.Raycaster();
    state.vector = new THREE.Vector2(0, 0);
    //Update Raycaster 
    if (options.near && options.near >= 0) {
      state.raycaster.near = options.near;
    }
    if (options.far && options.far >= 0) {
      state.raycaster.far = options.far;
    }

    //Create Parent Object for reticle and fuse
    state.parentContainer = new THREE.Object3D();
    state.camera.add(state.parentContainer);

    //Proximity Setup
    if (state.proximity) {
      state.frustum = new THREE.Frustum();
      state.cameraViewProjectionMatrix = new THREE.Matrix4();
    }

    //Enable Click / Tap Events
    if (state.isClickEnabled) {
      document.body.addEventListener('touchend', e => {
        if (state.reticle.hit && state.INTERSECTED) {
          e.preventDefault();
          gazeClick(state, state.INTERSECTED, state.fuse);
        }
      });
      document.body.addEventListener('click', e => {
        if (state.reticle.hit && state.INTERSECTED) {
          e.preventDefault();
          gazeClick(state, state.INTERSECTED, state.fuse);
        }
      });
    }

    //Clock Setup
    state.clock = new THREE.Clock(true);

    state.reticle = readyaim_reticle.getopts(options.reticle, state);
    state.reticle.mesh = readyaim_reticle.getreticlemesh(state.reticle);    
    state.parentContainer.add(state.reticle.mesh);
    state.reticle = readyaim_reticle.setDepthAndScale(state.reticle, state);

    // make getopts reusable
    state.fuse = readyaim_fuse.getopts(options.fuse);
    state.fuse.mesh = readyaim_fuse.getfusemesh(state.fuse);
    state.fuse = readyaim_fuse.update(state.fuse, 0);
    state.parentContainer.add(state.fuse.mesh);
    

    return state;
  };

  o.attach = (cfg, elem, fnobj) => {
    let slugfn = x => {},
        oneventfn = fnobj.oneventfn || slugfn;
        //oninertiafn = fnobj.oninertiafn || slugfn,
        //onmovefn = fnobj.onmovefn || slugfn;

    /*
    rafcfg = touchboom_touchmouse(rafcfg, touchboom_ctrl, elem);
    rafcfg = touchboom_key(rafcfg, touchboom_ctrl, elem);
    rafcfg = touchboom_ctrl(rafcfg, elem,
                         oneventfn,
                         oninertiafn,
                         onmovefn);
    */
    let body = document.body,
        evdel = evtdelegator;

    if (!elem || !elem.id) {
      console.error('parent element exist w/ valid id');
      return cfg;
    }

    if (!o.delegator) {
      o.delegator = evdel.create();
      
      evtdelegator.lsnpub({}, body, [
        //'touchcancel'
        'touchend',
        'click'
      ], (cfg, e) => {
        let delegatorstate = evdel.getactivestate(o.delegator);
        console.log('click', delegatorstate);
        
        if (delegatorstate) {
          //if (state.reticle.hit && state.INTERSECTED) {
          //  e.preventDefault();
          //  gazeClick(state, state.INTERSECTED, state.fuse);
          //}
        }
      });
    }
    /*
    cfg = touchboom_ctrl.onmoveend(cfg, 'touchmouse', (cfg, type, e) => {
      evdel.rmactivestate(o.delegator);
    });
    */
    o.delegator = evdel.addelemstate(o.delegator, elem, cfg);

    return cfg;
  };  
  
  return o;
  
})({});
