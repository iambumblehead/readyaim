// Filename: readyaim_render.js  
// Timestamp: 2017.10.20-01:07:44 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const readyaim_reticle = require('./readyaim_reticle'),
      readyaim_events = require('./readyaim_events'),
      readyaim_three = require('./readyaim_three'),
      readyaim_mesh = require('./readyaim_mesh'),
      readyaim_fuse = require('./readyaim_fuse');

module.exports = (o => {
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
    state.fuse = readyaim_fuse.over(state.fuse, meshData.fuse.duration, meshData.fuse.visible);

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

    return state;
  };

  return o;
})();
