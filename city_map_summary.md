# city_Map.json — Structure Summary

## Top-Level Structure

The file has three root keys:

| Key | Contents |
|---|---|
| `CityMapData` | 544 placed building objects (the active city grid) |
| `UnlockedAreas` | 158 unlocked grid sections (each with `x`, `y`, `width`, `length`) |
| `CityEntities` | 2,693 building definitions/templates (the game's full catalog) |

---

## `CityMapData` — Placed Buildings (544 total)

Each building entry is keyed by a numeric ID and contains:

| Field | Description |
|---|---|
| `id` | Unique placement ID |
| `player_id` | Owner (all `855484907`) |
| `cityentity_id` | Template reference (e.g. `X_BronzeAge_Landmark2`) |
| `type` | Building category (see below) |
| `x`, `y` | Grid coordinates |
| `connected` | Road connection status |
| `level` | Current upgrade level (leveled buildings only) |
| `max_level` | Level cap (great buildings only) |
| `bonus` | Active passive bonus (great buildings only) |
| `bonuses` | Array (usually empty) |
| `state` | Live production state (timers, current product, FP invested) |

### Building Type Breakdown

| Type | Count |
|---|---|
| `street` | 308 |
| `generic_building` | 157 |
| `tower` | 29 |
| `greatbuilding` | 20 |
| `off_grid` | 10 |
| `hub_part` | 5 |
| `production` | 4 |
| `residential` | 2 |
| `hub_main` | 2 |
| `decoration` | 2 |
| `outpost_ship` | 2 |
| `main_building` | 1 |
| `military` | 1 |
| `friends_tavern` | 1 |

### Great Buildings (20 placed)

All are leveled (`level`/`max_level`) with a passive `bonus`.

| Entity ID | Level | Max Level | Bonus Type | Bonus Value |
|---|---|---|---|---|
| `X_BronzeAge_Landmark2` | 88 | 200 | `military_boost` | 69 |
| `X_IronAge_Landmark2` | 87 | 87 (max) | `supplies_boost` | 530% |
| `X_ProgressiveEra_Landmark1` | 117 | 350 | `happiness` | +38,652 |
| `X_FutureEra_Landmark1` | 159 | 300 | `contribution_boost` | 97.9% |
| `X_EarlyMiddleAge_Landmark3` | 80 | 80 (max) | `plunder_repel` | 49.76% |
| `X_LateMiddleAge_Landmark3` | 85 | 160 | `military_boost` | 67.5% |
| `X_BronzeAge_Landmark1` | 89 | 150 | `population` | +3,401 |
| `X_ProgressiveEra_Landmark2` | 83 | 301 | `quest_boost` | +515 |
| `X_HighMiddleAge_Landmark1` | 76 | 76 (max) | `money_boost` | 580% |
| `X_EarlyMiddleAge_Landmark2` | 87 | 87 (max) | `military_boost` | 68.5% |
| `X_OceanicFuture_Landmark3` | 80 | 125 | `double_collection` | 68% |
| `X_AllAge_Expedition` | 85 | 100 | `totem_drop` | 18.72% |
| `X_AllAge_EasterBonus4` | 87 | 250 | `fierce_resistance` | 68.5% |
| `X_SpaceAgeAsteroidBelt_Landmark1` | 78 | 200 | `diplomatic_gifts` | 48.39% |
| `X_SpaceAgeJupiterMoon_Landmark1` | 82 | 110 | `algorithmic_core` | 45.36% |
| `X_ArcticFuture_Landmark3` | 83 | 124 | `helping_hands` | 13.04% |
| `X_ArcticFuture_Landmark2` | 83 | 149 | `critical_hit_chance` | 24.78% |
| `X_VirtualFuture_Landmark1` | 82 | 176 | `advanced_tactics` | 56% |
| `X_OceanicFuture_Landmark2` | 82 | 150 | `first_strike` | 98.32% |
| `X_SpaceAgeMars_Landmark2` | 77 | 125 | `missile_launch` | 69.33% |

### `state` Sub-Fields

| Field | Description |
|---|---|
| `next_state_transition_in` | Seconds until next state change |
| `next_state_transition_at` | Unix timestamp of next state change |
| `current_product` | What's being produced (name, time, resource output) |
| `productionOption` | Alternate production picker selection |
| `invested_forge_points` | FP already invested (great buildings) |
| `forge_points_for_level_up` | FP needed to reach next level |
| `decaysAt` | Expiry timestamp for decaying buildings |
| `socialInteractionId` | Active social interaction (tavern/friends) |
| `socialInteractionStartedAt` | Timestamp when social interaction began |

---

## `CityEntities` — Building Catalog (2,693 templates)

Full game data for every buildable entity. Each entry includes:

| Field | Description |
|---|---|
| `id` / `asset_id` | Entity identifier |
| `name` | Display name |
| `type` | Category (culture, residential, production, etc.) |
| `width` / `length` | Grid footprint in tiles |
| `requirements.cost` | Build cost (money, supplies, population, premium diamonds) |
| `requirements.tech_id` | Research unlock required |
| `requirements.min_era` | Minimum age to build |
| `requirements.street_connection_level` | Road connection requirement |
| `resaleResources` | Sell-back value |
| `provided_happiness` | Happiness provided (culture buildings) |
| `construction_time` | Build time in seconds |
| `entity_levels` | Level-up data array |
| `abilities` | Placement rules (grid, sector constraints) |

---

## `UnlockedAreas` — Grid Expansion (158 sections)

Each entry is a rectangle defining an unlocked portion of the city grid:

```json
{ "x": 4, "y": 28, "width": 4, "length": 4 }
```

---

## Summary

This is a complete **Forge of Empires** city save for a **Space Age Mars** era player (`player_id: 855484907`). It contains:
- The full live city grid with 544 placed tiles, production timers, and great building FP state
- The entire game building catalog (2,693 templates) with costs, sizes, and requirements
- 158 unlocked expansion zones defining the playable grid area
