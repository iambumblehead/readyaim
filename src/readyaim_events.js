// Filename: readyaim_events.js
// Timestamp: 2017.11.11-23:06:23 (last modified)
// Author(s): bumblehead <chris@bumblehead.com>

export default (o => {
  o.GAZEOVER = 'gazeover';
  o.GAZEOUT = 'gazeout';
  o.GAZELONG = 'gazelong';
  o.GAZECLICK = 'gazeclick';

  o.publish = (state, ...args) => (
    typeof state.oneventfn === 'function'
      && state.oneventfn(state, ...args),
    state);

  return o;
})({});
