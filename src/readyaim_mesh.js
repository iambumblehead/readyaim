// Filename: readyaim_mesh.js  
// Timestamp: 2017.10.14-13:28:38 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const THREE = require('three'),
      castas = require('castas'),
      
      readyaim_reticle = require('./readyaim_reticle'),
      readyaim_fuse = require('./readyaim_fuse');      

module.exports = (o => {

  const EVT_ONGAZEOUT = 'onGazeOut',
        EVT_ONGAZEOVER = 'onGazeOver',
        EVT_ONGAZELONG = 'onGazeLong',
        EVT_ONGAZECLICK = 'onGazeClick';

  o.onfn = fn =>
    typeof fn === 'function' ? fn : () => {};

  o.onevtfn = evtfn => (mesh, targetdata) =>
    o.onfn(evtfn)(mesh, targetdata);

  o.getoptsfuse = (opts) => {
    let finopt = {};
    
    finopt.duration = castas.num(opts.duration, 1.5);
    finopt.color = castas.num(opts.color, 0xffffff);
    finopt.visible = castas.bool(opts.visible, false);
    finopt.clickCancel = castas.bool(opts.clickCancel, false);

    return finopt;
  };

  o.getoptsreticle = (opts) => {
    let finopt = {};

    finopt.hoverColor = opts.hoverColor &&
      new THREE.Color(opts.hoverColor);
    
    return finopt;
  };  
  
  o.gettargetdata = (mesh, opts) => {
    let targetdata = {
      fuse: {},
      reticle: {}
    };

    // pull getopts...
    targetdata.uuid = mesh.uuid;
    targetdata.gazeable = true;

    targetdata.fuse = o.getoptsfuse(opts.fuse || {});
    targetdata.reticle = o.getoptsfuse(opts.reticle || {});

    targetdata.ongazeover = o.onevtfn(opts[EVT_ONGAZEOVER]);
    targetdata.ongazeout = o.onevtfn(opts[EVT_ONGAZEOUT]);
    targetdata.ongazelong = o.onevtfn(opts[EVT_ONGAZELONG]);
    targetdata.ongazeclick = o.onevtfn(opts[EVT_ONGAZECLICK]);

    return targetdata;
  };

  o.isgazeable = targetdata =>
    Boolean(targetdata && targetdata.gazeable);

  return o;
  
})({});
