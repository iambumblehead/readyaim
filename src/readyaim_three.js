// Filename: readyaim_three.js
// Timestamp: 2017.11.11-23:07:56 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

module.exports = (o => {
  o.iscamera = (THREE, camera) =>
    camera instanceof THREE.Camera;

  o.setmeshcolor = (mesh, color) =>
    mesh.material.color.setHex(color);

  o.getimgtexture = (THREE, imgsrc, loader) => (
    loader = new THREE.TextureLoader(),
    loader.load(imgsrc));

  o.getfilterimgtexture = (THREE, imgsrc, texture) => (
    texture = o.getimgtexture(THREE, imgsrc),
    texture.minFilter = THREE.NearestFilter,
    texture.magFilter = THREE.LinearFilter,
    texture);

  o.getimgsprite = (THREE, cfg) => new THREE.Sprite(
    new THREE.SpriteMaterial({
      color : cfg.color || 0xffffff,
      map : o.getimgtexture(THREE, cfg.imgsrc)
    }));

  o.getscaleimgsprite = (THREE, cfg, sprite) => (
    sprite = o.getimgsprite(THREE, cfg),
    sprite.scale.set(cfg.scale[0], cfg.scale[1], 1),
    sprite);

  return o;
})({});
