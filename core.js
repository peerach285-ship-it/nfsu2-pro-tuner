/* NFSU2 PRO TUNER - shared profile engine. No remote services or license checks. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NFSU2Tuner = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '0.1.0';
  const DEFAULT = Object.freeze({
    schemaVersion: 1, id: 'default', name: 'My Tune', scope: 'all', vehicleIds: [],
    performance: { horsepower: 1000, torque: 1000, ecu: 100, turbo: 100 },
    gearing: { finalDrive: 3.5, gears: [3.0, 2.1, 1.55, 1.2, 0.95, 0.78] },
    suspension: { rideHeight: 0, springRate: 50, damping: 50, camberFront: -2, camberRear: -1.5, toeFront: 0, toeRear: 0 },
    handling: { steering: 50, traction: 50, brakeBias: 60 },
    notes: '', updatedAt: null
  });
  const clone = x => JSON.parse(JSON.stringify(x));
  function number(v, fallback, min, max) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }
  function normalize(input) {
    const p = Object.assign(clone(DEFAULT), input || {});
    p.performance = Object.assign({}, clone(DEFAULT.performance), input?.performance || {});
    p.gearing = Object.assign({}, clone(DEFAULT.gearing), input?.gearing || {});
    p.suspension = Object.assign({}, clone(DEFAULT.suspension), input?.suspension || {});
    p.handling = Object.assign({}, clone(DEFAULT.handling), input?.handling || {});
    p.performance.horsepower = number(p.performance.horsepower, 1000, 0, 1000000000);
    p.performance.torque = number(p.performance.torque, 1000, 0, 1000000000);
    p.performance.ecu = number(p.performance.ecu, 100, 0, 1000000000);
    p.performance.turbo = number(p.performance.turbo, 100, 0, 1000000000);
    p.gearing.finalDrive = number(p.gearing.finalDrive, 3.5, 0.01, 1000);
    p.gearing.gears = Array.from({length:6}, (_,i)=>number(p.gearing.gears?.[i], DEFAULT.gearing.gears[i], 0.01, 1000));
    for (const k of ['rideHeight','springRate','damping','camberFront','camberRear','toeFront','toeRear']) p.suspension[k] = number(p.suspension[k], DEFAULT.suspension[k], -1000000, 1000000);
    for (const k of ['steering','traction','brakeBias']) p.handling[k] = number(p.handling[k], DEFAULT.handling[k], 0, 1000000);
    p.scope = p.scope === 'selected' ? 'selected' : 'all';
    p.vehicleIds = Array.isArray(p.vehicleIds) ? [...new Set(p.vehicleIds.map(String))] : [];
    p.updatedAt = new Date().toISOString();
    return p;
  }
  function createProfile(name) { const p=clone(DEFAULT); p.id='tune-'+Date.now().toString(36); p.name=String(name||'New Tune'); return normalize(p); }
  function exportProfile(profile) { return JSON.stringify({ app:'NFSU2 PRO TUNER', version:VERSION, profile:normalize(profile) }, null, 2); }
  function importProfile(text) {
    const data=JSON.parse(text);
    const p=data.profile || data;
    if (!p || typeof p !== 'object') throw new Error('Invalid tune profile');
    return normalize(p);
  }
  return { VERSION, DEFAULT:clone(DEFAULT), normalize, createProfile, exportProfile, importProfile };
});
