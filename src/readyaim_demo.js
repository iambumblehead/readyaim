// Filename: readyaim_demo.js
// Timestamp: 2017.11.11-23:10:02 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

const THREE = require('three'),
      touchboom = require('touchboom'),
      readyaim = require('./readyaim');

function setup (fn, cfg) {
  const loader = new THREE.FontLoader();
  loader.load(cfg.fontpath, font => {
    cfg.font = font;

    fn(cfg);
  });
}

function getrootelem () {
  return document.body;
}

function getwindowwh () {
  return [
    Math.floor(window.innerWidth),
    Math.floor(window.innerHeight)
  ];
}

// function getwindowhalfwh () {
//   return getwindowwh().map(wh => wh / 2);
// }

function degreetoradian (d) {
  return d * (Math.PI / 180);
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
      ? [ elem.innerWidth, elem.innerHeight ]
      : [ elem.clientWidth, elem.clientHeight ]);
}

function getcanvaselem (cfg) {
  let canvaselem = document.createElement('canvas'),
      [ w, h ] = cfg.wh;

  canvaselem.style.width = `${w}px`;
  canvaselem.style.height = `${h}px`;
  canvaselem.width = w;
  canvaselem.height = h;

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
    canvas : canvaselem,
    alpha : true,
    antialias : true
  });
}

function getskymesh (cfg) {
  return new THREE.Mesh(
    (new THREE.SphereGeometry(600, 30, 30))
      .applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1)),
    new THREE.MeshBasicMaterial({
      map : readyaim.three.getfilterimgtexture(cfg.bgskyimg),
      transparent : false,
      side : THREE.FrontSide,
      overdraw : true
      // wireframe : true,
      // color : cfg.bgskycolor
    }));
}

// function getTextSprite (cfg, text) {
//  return new text2d.SpriteText2D(String(text), {
//  //return new text2d.MeshText2D(String(text), {
//    align : text2d.textAlign.center,
//    font : '40px Arial',
//    fillStyle : cfg.bgtextcolor,
//    antialias : false
//  });
// }

// function getTextSprite (text, font) {
//   return new THREE.Mesh(
//     new THREE.TextGeometry(String(text), {
//       size : 40,
//       height : 1,
//       weight : 'normal',
//       font,
//       style : 'normal',
//       bevelThickness : 2,
//       bevelSize : 1,
//       bevelSegments : 3,
//       bevelEnabled : true,
//       curveSegments : 12,
//       steps : 1
//     }),
//     new THREE.MeshBasicMaterial({
//       color : 0xffffff
//     })
//   );
// }

// function getNumRandomSprite ( cfg ) {
//   return getTextSprite(cfg, Math.floor(Math.random() * 10));
// }

function getscene (cfg, canvaselem) {
  let wharr = [ canvaselem.offsetWidth, canvaselem.offsetHeight ],
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
  glscene.add(skymesh);

  camera.position.set(0, 0, -24);
  camera.lookAt(glscene.position);

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
  let geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1),
      material = new THREE.MeshBasicMaterial({ color : 0x000000 }),
      floor = new THREE.Mesh(geometry, material);

  floor.material.side = THREE.DoubleSide;
  floor.rotation.x = 90 * (Math.PI / 180); // degree to radian;

  return floor;
}

function getpanelmesh (cfg) {
  return new THREE.Mesh(
    new THREE.CubeGeometry(10, 300, 100),
    new THREE.MeshPhongMaterial({
      color : cfg.color,
      emissive : cfg.color
    })
  );
}

// function alongVertex (cfg, font, canvasscene, textSprite) {
//   (new THREE.Mesh(
//     new THREE.SphereGeometry(380, 20, 20))).geometry.vertices
//     .filter(({ x, y }) => (
//       (x > 350 || x < -350) &&
//         y < 60 && y > -60
//     ))
//     .map(({ x, y, z }) => {
//       let sprite = getTextSprite('3', font);
//
//       textSprite.position.set(x, y, z);
//       textSprite.lookAt(canvasscene.glscene.position);
//
//       canvasscene.glscene.add(sprite);
//     });
// }

// function countadd (value, font, scene) {
//   let textSprite = getTextSprite(value, font);
//   textSprite.geometry.computeBoundingBox();
//
//   const geom = textSprite.geometry,
//         width = geom.boundingBox.max.x - geom.boundingBox.min.x;
//
//   // textSprite.position.set(-300, 0, 0);
//   // textSprite.position.set(-300, 0, -sphere.radius);
//   textSprite.position.set(-300, -width / 2, width / 2);
//   textSprite.lookAt(scene.position);
//
//   scene.add(textSprite);
//
//   return textSprite;
// }

setup(function start (cfg) {
  let rootelem = getrootelem(),
      windowwh = getwindowwh(),
      pwwindow = pixelweight(window),
      // countnum,
      panelmesharr,
      // countsprite,
      floormesh = getfloormesh(),
      fuseduration = 30,
      canvasscene = getscene({
        xcolor : cfg.trackballxcolor,
        ycolor : cfg.trackballycolor,
        zcolor : cfg.trackballzcolor,
        fgcolor : cfg.trackballfgcolor,
        bgcolor : cfg.trackballbgcolor,
        bgskycolor : cfg.bgskycolor,
        bgskyimg : cfg.bgskyimg
        // bgtexturecolor : cfg.bgtexturecolor
      }, appendchild(rootelem, getcanvaselem({
        wh : windowwh
      })));

  // add cube
  panelmesharr = cfg.panels.map(panelcfg => {
    let panelmesh = getpanelmesh(panelcfg);

    Object.assign(panelmesh.position, panelcfg.position);
    Object.assign(panelmesh.rotation, panelcfg.rotation);

    return panelmesh;
  });

  panelmesharr.map(panelmesh => canvasscene.glscene.add(panelmesh));

  Object.assign(floormesh.position, { x : 0, y : -300, z : 0 });

  canvasscene.glscene.add(
    readyaim.three.getscaleimgsprite({
      imgsrc : './img/square-crosshair-empty.png',
      color : 0xffffff,
      scale : [ 4, 4 ]
    }));

  canvasscene.aimstate = readyaim(canvasscene.camera, {
    proximity : false,
    clickevents : true,

    near : null,
    far : null,

    reticle : {
      visible : true,

      // Defines the reticle's resting point when no object has been targeted
      restPoint : 1000,
      color : 0xffffff,
      innerRadius : 0.0001,
      outerRadius : 0.003,

      hoverColor : 0xffffff,
      hoverInnerRadius : 0.02,
      hoverOuterRadius : 0.024,
      hoverSpeed : 5,
      hoverVibrate : 50
    },
    fuse : {
      visible : true,
      duration : fuseduration,
      color : 0xffffff,
      innerRadius : 0.045,
      outerRadius : 0.06,
      vibrate : 100,

      // does click cancel targeted fuse?
      clickCancel : false
    }
  });

  panelmesharr.map(panelmesh => (
    canvasscene.aimstate = readyaim.addmesh(canvasscene.aimstate, panelmesh, {
      reticle : { // Override global reticle
        hoverColor : 0xffffff
      },
      fuse : { // Override global fuse
        visible : true,
        duration : fuseduration,
        color : 0xffffff
      }
    })));

  rootelem.id = 'id-is-required';
  readyaim.attach(canvasscene.aimstate, rootelem, {
    oneventfn : (cfg, etype, mesh) => {
      if (etype === readyaim.events.GAZELONG) {
        mesh.material.emissive.setHex(0x0000cc);

        // if (countsprite)
        //   canvasscene.glscene.remove(countsprite);

        console.log('[...] called: onGazeLong');
      }

      if (etype === readyaim.events.GAZEOUT) {
        mesh.material.emissive.setHex(0xcc0000);

        // if (countsprite)
        //   canvasscene.glscene.remove(countsprite);

        console.log('[...] called: onGazeOut');
      }

      if (etype === readyaim.events.GAZEOVER) {
        mesh.material.emissive.setHex(0xffcc00);

        // countnum = String(fuseduration);
        // countsprite = countadd(String(countnum), font, canvasscene.glscene);

        console.log('[...] called: onGazeOver');
      }

      if (etype === readyaim.events.GAZECLICK) {
        mesh.material.emissive.setHex(0x0000cc);
        console.log('[...] called: onGazeClick');
      }
    }
    // ongazefn : (cfg, intersectts, mesh) => {
    //   let delta = (Date.now() - intersectts) / 1000,
    //       nextcount = Math.ceil(fuseduration - delta);
    //
    //   if (nextcount !== countnum) {
    //     if (countsprite)
    //       canvasscene.glscene.remove(countsprite);
    //
    //     countnum = nextcount;
    //     countsprite = countadd(String(countnum), font, canvasscene.glscene);
    //   }
    // }
  });

  rootelem.id = 'id-is-required';
  touchboom.attach(cfg, rootelem, {
    oninertiafn : cfg => {
      let totalxy = touchboom.coordsgettotal(cfg),
          [ radx, rady ] = totalxy.map(px =>
            pixeltodegree(px, pwwindow)
          ).map(degreetoradian);

      canvasscene.headgroup.rotation.x = -rady;
      canvasscene.bodygroup.rotation.y = radx;
    }
  });

  (function animate () {
    canvasscene.glrenderer.render(
      canvasscene.glscene, canvasscene.camera);

    canvasscene.aimstate = readyaim.update(canvasscene.aimstate);

    requestAnimationFrame(animate);
  }());
}, {
  fontpath : './font/helvetiker_regular.typeface.json',
  wh : [ window.innerWidth, window.innerHeight ],
  bgtextcolor : 'rgb(250, 200, 30)',
  bgskycolor : 'rgb(30, 90, 120)',
  // bgskyimg : './img/armenia.jpg',
  bgskyimg : './img/retrowave_neon_80_s_background___4k_by_rafael_de_jongh-dbk7ro6.jpg',
  // bgskyimg : './img/wallhaven-477266.jpg',
  panels : [ {
    color : 'rgb(255, 255, 140)',
    position : { x : -300, y : -150, z : 100 },
    rotation : { x : 0, y : 0, z : 0 }
  }, {
    color : 'rgb(255, 100, 100)',
    position : { x : -300, y : -150, z : -100 },
    rotation : { x : 0, y : 0, z : 0 }
  } ]
});
