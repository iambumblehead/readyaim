readyaim
=========
**(c)[Bumblehead][0]**, [MIT-license](#license)

[![readyaim](https://github.com/iambumblehead/readyaim/raw/master/docs/img/readyaim.png)][10]

readyaim provides an aiming mechanism with THREE.js.

Try it out by [visiting this page][10]. Try dragging and aiming.

readyaim reconstructs parts of the [reticulum][1] library and if you arrived here searching for vr 'reticle' support, you probably want to use [reticulum][1]. This library reconstructs much of the [reticulum][1] library and makes a few changes.

reticulum works well with one long-lived canvas that fills the document. It stores stateful data on 'this' and adds listers to the full document when its constructor is called. 

readyaim will operate on multiple, specific canvas element(s).

```javascript
//
// target element must have id, used to manage delegation
// one set of listeners are attached body and delegated
// to touchboom functions assocated w/ element
//
rootelem.id = 'id-is-required';

//
// add a crosshair image (if wanted)
canvasscene.glscene.add(
  readyaim.three.getscaleimgsprite({
    imgsrc : './img/square-crosshair-empty.png',
    color : 0xffffff,
    scale : [ 4, 4 ]
  }));

//
// 'global' state is defined and mutated on a state object (aimstate)
//
aimstate = readyaim(camera, {
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

//
// mesh objects are added to the aim state with an option configuration object and properties that override those defined in the global state
mesharr.map(mesh => (
  canvasscene.aimstate = readyaim.addmesh(canvasscene.aimstate, mesh, {
    reticle : { // Override global reticle
      hoverColor : 0xffffff
    },
    fuse : { // Override global fuse
      visible : true,
      duration : fuseduration,
      color : 0xffffff
    }
  })));

//
// finally the state is attached to the canvas with optional event functions
//
//  * oneventfn, called when an event occurs
//    readyaim.events
//
//  * ongazefn, called each 'frame' of active gaze
//
  readyaim.attach(canvasscene.aimstate, rootelem, {
    oneventfn : (cfg, etype, mesh) => {
      if (etype === readyaim.events.GAZELONG) {
        mesh.material.emissive.setHex(0x0000cc);
        console.log('[...] called: long');
      }
      if (etype === readyaim.events.GAZEOUT) {
        mesh.material.emissive.setHex(0xcc0000);
        console.log('[...] called: out');
      }
      if (etype === readyaim.events.GAZEOVER) {
        mesh.material.emissive.setHex(0xffcc00);
        console.log('[...] called: over');
      }
      if (etype === readyaim.events.GAZECLICK) {
        mesh.material.emissive.setHex(0x0000cc);
        console.log('[...] called: click');
      }
    },
    ongazefn : (cfg, intersectts, mesh) => {
      console.log('[...] ongaze');
    }
  });
```


[0]: http://www.bumblehead.com "bumblehead"
[1]: https://github.com/skezo/Reticulum "reticulum"
[10]: https://iambumblehead.github.io/readyaim/

![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png)

(The MIT License)

Copyright (c) [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
