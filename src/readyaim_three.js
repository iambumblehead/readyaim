// Filename: readyaim_three.js
// Timestamp: 2017.11.11-23:07:56 (last modified)
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

  o.getfilterimgtexture = (imgsrc, texture) => (
    texture = o.getimgtexture(imgsrc),
    texture.minFilter = THREE.NearestFilter,
    texture.magFilter = THREE.LinearFilter,
    texture);

  o.getimgsprite = cfg => new THREE.Sprite(
    new THREE.SpriteMaterial({
      color : cfg.color || 0xffffff,
      map : o.getimgtexture(cfg.imgsrc)
    }));

  o.getscaleimgsprite = (cfg, sprite) => (
    sprite = o.getimgsprite(cfg),
    sprite.scale.set(cfg.scale[0], cfg.scale[1], 1),
    sprite);

  return o;
})({});
