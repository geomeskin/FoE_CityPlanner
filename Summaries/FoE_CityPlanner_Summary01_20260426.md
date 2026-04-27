What we built: city_grid_boundary.html — a self-contained HTML canvas visualizer of your FoE city (snapshot: city_MapPMTHS_20260426.json).

What it shows:

Full unlocked grid boundary (158 unlock chunks)
308 road segments (1×1 cobblestone and 2×2 car streets)
216 buildings in category colors with word-wrap labels
20 Great Buildings in blue with level numbers
Hover tooltips on everything (name, size, coordinates, road status)
Orange dot on each of the 66 buildings that require road access
Stats bar: road-required count, road-free count, GB count, road segments
Key data facts (for the optimizer):

66 buildings need road connection (requiredLevel = 1 in CityEntities)
130 buildings need no road (decorations, expedition items, event passives, etc.)
20 Great Buildings — no road needed, treated as fixed anchors
Road tiles are their own objects in CityMapData (S_ prefix), not part of the 216 buildings
Building sizes: top-level width/length for standard buildings; components.<AgeName>.placement.size.{x,y} for W_MultiAge_ / W_AllAge_ event buildings
JSON file is 512KB — use PowerShell ConvertFrom-Json to extract, don't read directly
The optimizer vision (discussed, not yet built):

User defines priorities (minimize roads, cluster by type, etc.)
Phase 1: Constraint model (fixed vs. movable, boundary, road-connectivity rule)
Phase 2: Road minimizer (Steiner tree heuristic connecting road-requiring buildings to Town Hall)
Phase 3: Simulated annealing layout optimizer with user-defined weights
Phase 4: Side-by-side current vs. proposed view