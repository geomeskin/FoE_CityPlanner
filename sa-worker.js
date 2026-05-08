// Runs one SA pass. Receives all data via postMessage, returns best layout + score.
self.onmessage = function (e) {
  const { buildings, unlockedAreas, fixedSetArr, maxIter, T0, T_MIN } = e.data;
  const fixedSet = new Set(fixedSetArr);

  function buildingKey(b) { return `${b.x},${b.y}`; }

  // Build unlocked cell set and bounds
  const unlocked = new Set();
  for (const a of unlockedAreas) {
    const ax = a.x ?? 0, ay = a.y ?? 0;
    for (let dy = 0; dy < (a.length || 0); dy++)
      for (let dx = 0; dx < (a.width || 0); dx++)
        unlocked.add(`${ax + dx},${ay + dy}`);
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const k of unlocked) {
    const [x, y] = k.split(',').map(Number);
    if (x < minX) minX = x; if (y < minY) minY = y;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y;
  }

  function isOnsite(b) {
    for (let dy = 0; dy < b.l; dy++)
      for (let dx = 0; dx < b.w; dx++)
        if (unlocked.has(`${b.x + dx},${b.y + dy}`)) return true;
    return false;
  }

  const fixed   = buildings.filter(b => fixedSet.has(buildingKey(b)) || b.type === 'main_building' || !isOnsite(b));
  const movable = buildings.filter(b => !fixedSet.has(buildingKey(b)) && b.type !== 'main_building' && isOnsite(b));

  console.log(`[SA worker] unlocked cells: ${unlocked.size}, fixed: ${fixed.length}, movable: ${movable.length}`);
  const townHall = fixed.find(b => b.type === 'main_building');
  const thCx = townHall ? townHall.x + townHall.w / 2 : 0;
  const thCy = townHall ? townHall.y + townHall.l / 2 : 0;

  function bScore(b) {
    const dist = Math.abs(b.x + b.w / 2 - thCx) + Math.abs(b.y + b.l / 2 - thCy);
    return b.road ? dist * 2 : dist;
  }

  function addOcc(occ, b)    { for (let dy = 0; dy < b.l; dy++) for (let dx = 0; dx < b.w; dx++) occ.add(`${b.x + dx},${b.y + dy}`); }
  function removeOcc(occ, b) { for (let dy = 0; dy < b.l; dy++) for (let dx = 0; dx < b.w; dx++) occ.delete(`${b.x + dx},${b.y + dy}`); }

  function fits(b, x, y, occ) {
    for (let dy = 0; dy < b.l; dy++)
      for (let dx = 0; dx < b.w; dx++) {
        const k = `${x + dx},${y + dy}`;
        if (!unlocked.has(k) || occ.has(k)) return false;
      }
    return true;
  }

  function randomPlace() {
    const shuffled = [...movable].sort(() => Math.random() - 0.5);
    const occ = new Set();
    for (const b of fixed) addOcc(occ, b);
    const placed = [];
    for (const b of shuffled) {
      let found = false;
      outer: for (let y = minY; y <= maxY - b.l + 1; y++)
        for (let x = minX; x <= maxX - b.w + 1; x++)
          if (fits(b, x, y, occ)) { const pb = { ...b, x, y }; addOcc(occ, pb); placed.push(pb); found = true; break outer; }
      if (!found) placed.push({ ...b });
    }
    return placed;
  }

  const cooling = Math.pow(T_MIN / T0, 1 / maxIter);
  let current  = randomPlace();
  const occ    = new Set();
  for (const b of fixed)   addOcc(occ, b);
  for (const b of current) addOcc(occ, b);

  let curScore = current.reduce((s, b) => s + bScore(b), 0);
  let T = T0;

  for (let iter = 0; iter < maxIter; iter++) {
    const i = Math.floor(Math.random() * current.length);
    const j = Math.floor(Math.random() * current.length);
    if (i === j) { T *= cooling; continue; }

    const a = current[i], b = current[j];
    removeOcc(occ, a); removeOcc(occ, b);

    if (fits(a, b.x, b.y, occ) && fits(b, a.x, a.y, occ)) {
      const na = { ...a, x: b.x, y: b.y }, nb = { ...b, x: a.x, y: a.y };
      const delta = bScore(na) + bScore(nb) - bScore(a) - bScore(b);
      if (delta < 0 || Math.random() < Math.exp(-delta / T)) {
        current[i] = na; current[j] = nb;
        addOcc(occ, na); addOcc(occ, nb);
        curScore += delta;
      } else {
        addOcc(occ, a); addOcc(occ, b);
      }
    } else {
      addOcc(occ, a); addOcc(occ, b);
    }
    T *= cooling;
  }

  self.postMessage({ layout: [...fixed, ...current], score: curScore });
};
