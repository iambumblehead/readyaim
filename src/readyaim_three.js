// Filename: readyaim_three.js  
// Timestamp: 2017.10.08-04:20:12 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>  

const THREE = require('three');

module.exports = (o => {

  o.iscamera = camera =>
    camera instanceof THREE.Camera;

  o.setmeshcolor = (mesh, color) =>
    mesh.material.color.setHex(color);

  o.getimgtexture = (imgsrc, loader) => (
    loader = new THREE.TextureLoader(),
    loader.load(imgsrc));

  o.getimgsprite = cfg => new THREE.Sprite(
    new THREE.SpriteMaterial({
      color: cfg.crosscolor || 0xffffff,
      map: o.getimgtexture( cfg.crossimgsrc )
    }));

  return o;
  
})({});
