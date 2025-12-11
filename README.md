tj_appearance
=============

Modern FiveM appearance/clothing menu inspired by `bl_appearance`, rebuilt with React/Vite/Mantine UI. Supports ESX, QBCore, and QBOX frameworks with ox_lib/ox_target integration, persistent outfits, tattoos, and admin tooling.

Screenshots
-----------
Add your own images in `docs/images` and update the paths below (examples shown):

![Appearance Menu](docs/images/appearance-menu.png)
![Outfit Manager](docs/images/outfit-manager.png)

Features
--------
- Framework-aware (ESX, QBCore, QBOX) with ox_lib callbacks and ox_target peds/markers.
- Full character customization: heritage, face, hair, clothing, props, makeup, tattoos.
- Persistent storage for appearances and personal/job/gang outfits (with share codes).
- Pricing per menu type (clothing/barber/tattoo/surgeon) and optional tattoo-per-piece charging.
- Admin menu + `/appearance` command to open for self or a target; optional `/reloadskin` command.
- Exportable helpers to apply models, components, props, head data, and full appearances.
- Configurable blips, target peds, shop zones, restrictions/blacklists, and locked models.

Requirements
------------
- FiveM build supporting `fx_version 'cerulean'`, `lua54 'yes'`.
- Dependencies: `ox_lib`, `oxmysql` (server), `ox_target` if `Config.UseTarget` is true.
- Framework: ESX, QBCore, or QBOX (framework adapters live in `client/framework` and `server/framework`).
- Node 18+ and pnpm (or npm/yarn) if you plan to build the web UI.
- MySQL/MariaDB for persistence (schema provided).

Installation
------------
1) Download/clone into `resources/[tj]/tj_appearance`.
2) Import the SQL: run `server/database_schema.sql` on your database.
3) Configure `shared/config.lua` (prices, camera, tabs, blips, target/marker usage, disable sections, reload command).
4) Configure data files in `shared/data/` as needed:
	- `appearance_settings.json`: target usage, ped toggles, blip defaults.
	- `shop_settings.json` / `shop_configs.json`: ped/target settings per shop.
	- `zones.json`: shop locations.
	- `outfits.json`: job/gang outfits; `restrictions.json` and `locked_models.json` for blacklists.
	- `theme.json` and `locale/*.json` for UI look and translations.
5) Build the web UI (required for production use):
	```powershell
	cd web
	pnpm install   # or npm install / yarn
	pnpm run build
	```
6) Point fxmanifest to the built UI: uncomment `ui_page 'web/build/index.html'` and comment/remove the dev line `ui_page 'http://localhost:5173/'`.
7) Ensure dependencies start before this resource, then add to `server.cfg`:
	```
	ensure oxmysql
	ensure ox_lib
	ensure ox_target   # if using target
	ensure tj_appearance
	```

Usage
-----
- Shops/targets: Walk into configured zones (`shared/data/zones.json`), or use ox_target on configured peds when `Config.UseTarget` is true.
- Command (admin): `/appearance [id|me]` opens the menu for yourself or a target player (admin check is framework-driven).
- Reload command: `/reloadskin` (name and cooldown in `Config.ReloadSkin`).
- Pricing: set per menu type in `Config.Prices`; tattoo charges can be per piece via `Config.Tattoo.ChargeEachTattoo`.
- Saving: player appearances save automatically through the UI; outfits can be saved, renamed, shared by code, imported, or deleted.

Exports
-------
Server
- `GetPlayerAppearance(identifier)` → table|nil
  - `identifier`: citizenid.
  - Returns `{ citizenid, model, skin = <appearance table>, active = 1 }` or nil.

Client
- `SetPedHeadOverlay(ped, overlayData)`
- `SetPedHeadBlend(ped, headBlend)`
- `SetPedDrawable(ped, drawdata)` and `SetPedDrawables(ped, drawablesTable)`
- `SetPedProp(ped, propData)` and `SetPedProps(ped, propTable)`
- `SetPedModel(ped, modelNameOrHash)`
- `SetPedFaceFeature(ped, feature)` / `SetPedFaceFeatures(ped, features)`
- `SetPedAppearance(ped, appearanceTable)` (full apply; alias `setPedAppearance`)

Example (client):
```lua
local ped = PlayerPedId()

exports.tj_appearance:SetPedModel(ped, 'mp_m_freemode_01')
exports.tj_appearance:SetPedAppearance(ped, {
  drawables = { [3] = { index = 3, value = 0, texture = 0 } },
  props = { [0] = { index = 0, value = -1, texture = 0 } },
  headBlend = { shapeFirst = 0, shapeSecond = 0, shapeThird = 0, skinFirst = 0, skinSecond = 0, skinThird = 0, shapeMix = 0.0, skinMix = 0.0, thirdMix = 0.0 },
  hairColour = { primary = 0, highlight = 0 },
})
```

Database
--------
- Schema lives in `server/database_schema.sql`.
- Server database helpers are in `server/database.lua`; framework money/identity adapters in `server/framework`.

Development (UI)
----------------
- Dev server: `cd web; pnpm install; pnpm run dev` then keep `ui_page 'http://localhost:5173/'` in `fxmanifest.lua` while developing.
- Production: run `pnpm run build` and switch `ui_page` back to the built file as noted above.
- Tech stack: Vite + React + TypeScript + Mantine. Entry at `web/src/main.tsx`.

Troubleshooting
---------------
- Nulls in JSON textures typically mean Lua sparse arrays (numeric keys with gaps); convert keys to strings if you need map-style tables.
- Ensure `oxmysql` is started and credentials are set; failed saves will notify in-game.
- If target peds do not appear, set `Config.UseTarget = false` to fall back to markers or review `shared/data/shop_settings.json`.

Credits
-------
- Original React/Vite/Mantine boilerplate: https://github.com/PFScripts/fivem_react_vite_mantine_boilerplate
- bl_appearance - https://github.com/Byte-Labs-Studio/bl_appearance
- Resource by TechJess#0 and contributors.

License
-------
See `LICENSE`.
