# Bakery Appearance - Advanced Customization Menu

An advanced appearance and clothing customization menu for FiveM.

## Preview

![FiveM_b3570_GTAProcess_hFS4yBXrwm](https://github.com/user-attachments/assets/4868955e-1afe-4072-bd8e-83e0d8e97226)
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/0ea55141-bdb2-47d6-8dd2-ef40fbe1fc88" />




## Website & Community

- **Website**: [Your Website Here]
- **Discord**: [Your Discord Here]

## CREDITS

**The Team Behind Bakery Appearance:**
- TechJess#0 - Lead Developer
- Contributors & Community

**The OC's - Original Creators**
- The Byte Labs Team - Discord: Byte Labs
 - Master Mind - Discord: mastermind8816
 - Complex - Discord: complexza
 - DevX - Discord: devx
 - DeeRock - Discord: deerockuk

---

## Documentation

🚀 **Introducing Bakery Appearance: The Ultimate FiveM Customization Script!** 🚀

We're thrilled to present Bakery Appearance, a modern and powerful appearance customization system designed for FiveM. Built with React/Vite/Mantine, this resource delivers a sleek, intuitive interface with seamless framework integration and extensive customization options.

Whether you're running a large-scale roleplay server or a small community, Bakery Appearance will elevate the customization experience for every player.

## Key Features

- 🎨 **Full Character Customization**: Heritage, face, hair, clothing, props, makeup, and tattoos all in one place.
- 👔 **Advanced Clothing System**: Toggle clothing on or off with intuitive controls for maximum flexibility.
- 📸 **Intelligent Camera System**: Focus on specific body parts (head, torso, legs, feet) with full rotation capabilities.
- 🎭 **Tattoo System**: Layer and customize tattoos with the ability to import directly from files.
- 💼 **Exceptional Outfit System**: Create, edit, and share outfits with the ability to apply them via items or assign job-specific uniforms.
- 🛍️ **Powerful Admin Menu**: Use `/appearanceadmin` to:
  - Customize menu shape, colors, and themes for all players
  - Edit default prices, blips, and starter clothes
  - Restrict ped models and clothing (visible but not purchasable)
  - Add and manage clothing shops in-game
  - Set job and gang outfits with ease
  - Import tattoos directly from files
- 🎯 **Flexible Restriction System**: Enforce dress codes by restricting individual clothing or styles per job or gang.
- 🖌️ **Modern UI**: A clean, sleek interface built with React and Mantine for a premium user experience.
- 📦 **Framework Support**: Built for ESX, QBCore, and QBOX with clean, maintainable framework adapters.
- 💾 **Persistent Storage**: Automatic saving of appearances and outfits with MySQL/MariaDB support.
- 📡 **Developer Exports**: Comprehensive exports to empower other developers to integrate and expand upon this resource.

## Requirements

- FiveM build supporting `fx_version 'cerulean'` and `lua54 'yes'`
- **Dependencies**: `ox_lib`, `oxmysql` (server), `ox_target` (optional)
- **Framework**: ESX, QBCore, or QBOX
- **Database**: MySQL/MariaDB for persistent storage
- **Node**: Node 18+ with pnpm (or npm/yarn) for UI development

## Installation

1. Download the latest release and place `bakery_appearance` in `resources/[bakery]/`
2. Import the database schema: run `server/database_schema.sql`
3. Configure `shared/config.lua` (prices, camera, tabs, blips, target/marker usage, reload command)
4. Add to your `server.cfg`:
   ```
   ensure oxmysql
   ensure ox_lib
   ensure ox_target   # optional
   ensure bakery_appearance
   ```

> **Note**: The latest release includes pre-built UI assets and default data files. Edit `shared/data/` only if you want to manually customize shops, zones, restrictions, themes, or locales. Most customization is available in-game via `/appearanceadmin`.

## Usage

### Player Commands
- **Shops/Targets**: Walk into configured zones or use ox_target on peds when enabled
- **Appearance Menu**: Open customization menu at shops or via items
- **Outfits**: Save, rename, share by code, import, or delete outfits in-game
- **Reload Skin**: `/reloadskin` - quickly reload your appearance

### Admin Commands
- **Admin Menu**: `/appearanceadmin` - open the full admin customization panel
- **Force Appearance**: `/appearance [id|me]` - open the menu for yourself or a target player

### Admin Menu Features
The `/appearanceadmin` menu provides complete in-game control over:
- Menu appearance (colors, themes, layout)
- Pricing and billing options
- Starter clothes and default configurations
- Clothing shops (add, edit, remove)
- Ped model restrictions
- Clothing and item restrictions per job/gang
- Tattoo management and imports
- Job and gang outfit assignments
- Blip settings and markers

## Exports

### Server
```lua
exports.bakery_appearance:GetPlayerAppearance(identifier) -- Returns appearance data or nil
```

### Client
```lua
exports.bakery_appearance:SetPedModel(ped, modelNameOrHash)
exports.bakery_appearance:SetPedAppearance(ped, appearanceTable)
exports.bakery_appearance:SetPedHeadBlend(ped, headBlend)
exports.bakery_appearance:SetPedHeadOverlay(ped, overlayData)
exports.bakery_appearance:SetPedDrawable(ped, drawdata)
exports.bakery_appearance:SetPedDrawables(ped, drawablesTable)
exports.bakery_appearance:SetPedProp(ped, propData)
exports.bakery_appearance:SetPedProps(ped, propTable)
exports.bakery_appearance:SetPedFaceFeature(ped, feature)
exports.bakery_appearance:SetPedFaceFeatures(ped, features)
```

### Example Usage
```lua
local ped = PlayerPedId()

exports.bakery_appearance:SetPedModel(ped, 'mp_m_freemode_01')
exports.bakery_appearance:SetPedAppearance(ped, {
  drawables = { [3] = { index = 3, value = 0, texture = 0 } },
  props = { [0] = { index = 0, value = -1, texture = 0 } },
  headBlend = { shapeFirst = 0, shapeSecond = 0, shapeThird = 0, skinFirst = 0, skinSecond = 0, skinThird = 0, shapeMix = 0.0, skinMix = 0.0, thirdMix = 0.0 },
  hairColour = { primary = 0, highlight = 0 },
})
```

## Development

### UI Development
```bash
cd web
pnpm install
pnpm run dev
```

Keep `ui_page 'http://localhost:5173/'` in `fxmanifest.lua` while developing.

### Production Build
```bash
pnpm run build
```

Switch `ui_page` to `'web/build/index.html'` in `fxmanifest.lua`.

**Tech Stack**: Vite + React + TypeScript + Mantine

## Troubleshooting

- **JSON null values**: Usually indicate sparse numeric keys; convert to strings if needed
- **Failed saves**: Ensure `oxmysql` is running with correct database credentials
- **Missing target peds**: Set `Config.UseTarget = false` or review shop configuration files

## Database

- Schema: `server/database_schema.sql`
- Helpers: `server/database.lua`
- Framework adapters: `server/framework/`

## License

See `LICENSE` file - Built with inspiration from bl_appearance by Byte Labs.

## TODO

_Coming soon_
