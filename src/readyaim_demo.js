// Filename: readyaim_demo.js  
// Timestamp: 2017.10.14-13:27:39 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  


const THREE = require('three'),
      touchboom = require('touchboom'),
      text2d = require('three-text2d/lib/'),
      readyaim = require('./readyaim');

function getrootelem () {
  return document.body;
}

function getwindowwh () {
  return [
    Math.floor(window.innerWidth),
    Math.floor(window.innerHeight)
  ];
}

function getwindowhalfwh () {
  return getwindowwh().map(wh => wh / 2);
}

function degreetoradian (d) {
  return d * (Math.PI/180);
}

function pixeltodegree (p, pw) {
  return p * pw;
}

function pixelweightarea (wh) {
  return 180 / Math.max(wh[0], wh[1]);
}

function pixelweight (elem) {
  return pixelweightarea(
    elem === window
      ? [elem.innerWidth, elem.innerHeight]
      : [elem.clientWidth, elem.clientHeight]);
}

function getcanvaselem (cfg) {
  var canvaselem = document.createElement('canvas');
  
  canvaselem.style.width = cfg.wh[0] + 'px';
  canvaselem.style.height = cfg.wh[1] + 'px';
  canvaselem.width = cfg.wh[0];
  canvaselem.height = cfg.wh[1];

  if (cfg.bg) {
    canvaselem.style.backgroundColor = cfg.bg;
  }

  if (cfg.className) {
    canvaselem.className = cfg.className;
  }  

  return canvaselem;
}

function appendchild (parent, child) {
  parent.appendChild(child);
  
  return child;
}

function getglrenderer (canvaselem) {
  return new THREE.WebGLRenderer({
    canvas    : canvaselem,
    alpha     : true,
    antialias : true
  });
}

function getskymesh (cfg) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(400, 30, 30),
    new THREE.MeshBasicMaterial({
      //map : texture,
      side: THREE.BackSide,
      wireframe: false,
      transparent: false,
      color: cfg.bgskycolor
    }));
}

function getTextSprite (cfg, text) {
  return new text2d.SpriteText2D(String(text), {
    align: text2d.textAlign.center,
    font: '40px Arial',
    fillStyle: cfg.bgtextcolor,
    antialias: false
  });
}

function getNumRandomSprite (cfg) {
  return getTextSprite(cfg, Math.floor(Math.random() * 10));
}

function getscene (cfg, canvaselem) {
  var wharr = [canvaselem.offsetWidth, canvaselem.offsetHeight],
      glscene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(60, wharr[0] / wharr[1], 1, 10000),
      skymesh = getskymesh(cfg),
      glrenderer = getglrenderer(canvaselem),
      headgroup = new THREE.Object3D(),
      bodygroup = new THREE.Group(),
      scenegroup = new THREE.Group();

  headgroup.add(camera);
  bodygroup.add(headgroup);
  scenegroup.add(bodygroup);
  scenegroup.rotation.y = -THREE.Math.degToRad(90);

  glscene.add(scenegroup);
    
  camera.position.set( 0, 0, -24 );
  camera.lookAt( glscene.position );

  glscene.rotation.y += -Math.PI / 2;

  return {
    wharr,
    skymesh,
    headgroup,
    bodygroup,
    glrenderer,
    camera,
    glscene
  };
}

function getfloormesh () {
  var geometry = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
  var floor = new THREE.Mesh( geometry, material );
  
  floor.material.side = THREE.DoubleSide;
  floor.rotation.x = 90 * (Math.PI / 180); // degree to radian;

  return floor;
}

function getpanelmesh (cfg) {
  return new THREE.Mesh(
    new THREE.CubeGeometry(10, 200, 100),
    new THREE.MeshPhongMaterial({
      color: cfg.color,
      emissive: cfg.color
    })
    //new THREE.MeshBasicMaterial({
    //  color: cfg.color
    //})
  );
}


(function start(cfg) {    
  var rootelem = getrootelem(),
      windowwh = getwindowwh(),
      windowhalfwh = getwindowhalfwh(),
      pwwindow = pixelweight(window),
      canvasscene = getscene({
        xcolor : cfg.trackballxcolor,
        ycolor : cfg.trackballycolor,
        zcolor : cfg.trackballzcolor,
        fgcolor : cfg.trackballfgcolor,
        bgcolor : cfg.trackballbgcolor,
        bgskycolor : cfg.bgskycolor
        //bgtexturecolor : cfg.bgtexturecolor
      }, appendchild(rootelem, getcanvaselem({
        wh : windowwh
      })));

  // add cube
  let panelmesharr = cfg.panels.map(panelcfg => {
    let panelmesh = getpanelmesh(panelcfg);

    Object.assign(panelmesh.position, panelcfg.position);
    Object.assign(panelmesh.rotation, panelcfg.rotation);

    return panelmesh;
  });

  panelmesharr.map(panelmesh => canvasscene.glscene.add(panelmesh));

  let floormesh = getfloormesh();
  Object.assign(floormesh.position, {x: 0, y: -300, z: 0});

  canvasscene.glscene.add(floormesh);

  // canvasscene.skymesh.geometry.vertices.map(({x, y, z }) => {
  //   let sprite = getTextSprite(cfg, '—');
  //
  //  sprite.position.set( x, y, z );
  //  
  //  canvasscene.glscene.add(sprite);      
  //});

  //canvasscene.glscene = readyaim({
  canvasscene.aimstate = readyaim(canvasscene.camera, {
    //  crossimgsrc: './img/square-crosshair.png',
    //  crosscolor: 0xffffff
    proximity: false,
    clickevents: true,
    // should use error handling instead of comments :(
    near: null, // near factor of the raycaster (shouldn't be negative and should be smaller than the far property)
    far: null,  // far factor of the raycaster (shouldn't be negative and should be larger than the near property)
    reticle: {
      visible: true,
      restPoint: 1000, //Defines the reticle's resting point when no object has been targeted
      color: 0xffffff,
      innerRadius: 0.0001,
      outerRadius: 0.003,

      hoverColor: 0xffffff,
      hoverInnerRadius: 0.02,
      hoverOuterRadius: 0.024,
      hoverSpeed: 5,
      hoverVibrate: 50 //Set to 0 or [] to disable
    },
    fuse: {
      visible: true,
      duration: 2.5,
      color: 0xffffff,
      innerRadius: 0.045,
      outerRadius: 0.06,
      vibrate: 100, //Set to 0 or [] to disable
      clickCancel: false //If users clicks on targeted object fuse is canceled
    }
  });

  panelmesharr
    .map(panelmesh => (
      canvasscene.aimstate = readyaim.addmesh(canvasscene.aimstate, panelmesh, cfg.fusetime, {
        reticle: {
          hoverColor: 0xffffff // Overrides global reticle hover color        
        },
        fuse: {
          visible: true, // Overrides global fuse visibility
          duration: cfg.fuseTime,
          color: 0xffffff // Overrides global fuse color
        },
        onGazeLong : mesh => {
	  // do something user targetes object for specific time
	  mesh.material.emissive.setHex( 0x0000cc );
          console.log('[...] called: onGazeLong');
        },
        onGazeOver : mesh => {
          // do something when user targets object
	  mesh.material.emissive.setHex( 0xffcc00 );
          console.log('[...] called: onGazeOver');
        },
        onGazeOut : mesh => {
	  // do something when user moves reticle off targeted object
	  mesh.material.emissive.setHex( 0xcc0000 );          
          console.log('[...] called: onGazeOut');
        },
        onGazeClick : mesh => {
	  // have the object react when user clicks / taps on targeted object
	  mesh.material.emissive.setHex( 0x0000cc );          
          console.log('[...] called: onGazeClick');
        }
      })));

  rootelem.id = 'rootid';
  readyaim.attach(cfg, rootelem, {
    oneventfn : function (cfg, etype, mesh) {
      console.log('evt function');
    }
  });

  // canvasscene.glscene = readyaim({
  //  crossimgsrc: './img/square-crosshair.png',
  //  crosscolor: 0xffffff
  // }, canvasscene.glscene, canvasscene.camera);
  
  rootelem.id = 'id-is-required';    
  touchboom.attach(cfg, rootelem, {
    oninertiafn : function (cfg, etype, e) {
      let totalxy = touchboom.coordsgettotal(cfg),
          radxy = totalxy.map(function (px, i) {
            return pixeltodegree(px, pwwindow);
          }).map(degreetoradian);

      canvasscene.headgroup.rotation.x = -radxy[1];
      canvasscene.bodygroup.rotation.y = radxy[0];
    }
  });

  (function animate () {
    canvasscene.glrenderer.render(
      canvasscene.glscene, canvasscene.camera);

    canvasscene.aimstate = readyaim.update(canvasscene.aimstate);
    
    requestAnimationFrame(animate);
  }());
}({
  wh : [window.innerWidth, window.innerHeight],
  bgtextcolor : 'rgb(250, 200, 30)',
  bgskycolor : 'rgb(30, 90, 120)',
  panels: [{
    color: 'rgb(255, 255, 140)',
    position: { x: -300, y: 0, z: 100 },
    rotation: { x: 0, y: 0, z: 0 }
  }, {
    color: 'rgb(255, 100, 100)',
    position: { x: -300, y: 0, z: -100 },
    rotation: { x: 0, y: 0, z: 0 }
  }]
}));
