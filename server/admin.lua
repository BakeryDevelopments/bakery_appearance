-- Helper function for deep copying tables
local function deepcopy(orig)
    local orig_type = type(orig)
    local copy
    if orig_type == 'table' then
        copy = {}
        for orig_key, orig_value in next, orig, nil do
            copy[deepcopy(orig_key)] = deepcopy(orig_value)
        end
        setmetatable(copy, deepcopy(getmetatable(orig)))
    else
        copy = orig
    end
    return copy
end

-- Make ServerCache global so it can be accessed from main.lua
ServerCache = {
    theme = {},
    settings = {},
    models = {},
    zones = {},
    outfits = {},
    tattoos = {},
    shopSettings = {},
    shopConfigs = {},
    restrictions = {},
    appearanceSettings = {},
} 

local TattooZones = {
    { label = "Torso", zone = "ZONE_TORSO", index = 0 },
    { label = "Head", zone = "ZONE_HEAD", index = 1 },
    { label = "Left Arm", zone = "ZONE_LEFT_ARM", index = 2 },
    { label = "Right Arm", zone = "ZONE_RIGHT_ARM", index = 3 },
    { label = "Left Leg", zone = "ZONE_LEFT_LEG", index = 4 },
    { label = "Right Leg", zone = "ZONE_RIGHT_LEG", index = 5 },
    { label = "Unknown", zone = "ZONE_UNKNOWN", index = 6 },
    { label = "None", zone = "ZONE_NONE", index = 7 },
}

local function getZoneInfo(zoneValue)
    for _, z in ipairs(TattooZones) do
        if z.zone == zoneValue then
            return z
        end
    end
    return TattooZones[1] -- default to torso
end

-- Load all restrictions into cache on startup


local function LoadCache()
    -- Load models
    local modelsFile = LoadResourceFile('tj_appearance', 'shared/data/models.json')
    if modelsFile then
        ServerCache.models = json.decode(modelsFile) or {}
    else
        ServerCache.models = {}
    end

    local restrictionsFile = LoadResourceFile('tj_appearance', 'shared/data/restrictions.json')
    if restrictionsFile then
        local loadedRestrictions = json.decode(restrictionsFile) or {}
        
        -- Check if it's a flat array (old format) and convert to nested structure
        if loadedRestrictions[1] and not loadedRestrictions[1].male then
            -- It's a flat array, convert to nested structure
            local nested = {}
            for _, restriction in ipairs(loadedRestrictions) do
                -- Use just the group name, don't combine job and gang
                local key = restriction.group or 'none'
                if not nested[key] then
                    nested[key] = { male = {}, female = {} }
                end
                if not nested[key][restriction.gender] then
                    nested[key][restriction.gender] = {}
                end
                table.insert(nested[key][restriction.gender], restriction)
            end
            ServerCache.restrictions = nested
        else
            -- Already in nested format
            ServerCache.restrictions = loadedRestrictions
        end
    else
        ServerCache.restrictions = {}
    end

    local tattoosFile = LoadResourceFile('tj_appearance', 'shared/data/tattoos.json')
    if tattoosFile then
        local loadedTattoos = json.decode(tattoosFile) or {}

        -- Convert simple DLC array (strings or objects) to nested zone structure for UI compatibility
        -- Simple format: [{ dlc: "name", tattoos: ["tat1", { label, hashMale, hashFemale, zone? }] }]
        if loadedTattoos[1] and loadedTattoos[1].dlc and not loadedTattoos[1].label then
            local zonesByKey = {}

            for dlcIndex, dlcData in ipairs(loadedTattoos) do
                for _, tattooValue in ipairs(dlcData.tattoos or {}) do
                    local label = tattooValue
                    local hashMale = tattooValue
                    local hashFemale = tattooValue
                    local zoneValue = dlcData.zone

                    if type(tattooValue) == 'table' then
                        label = tattooValue.label or tattooValue.name or tattooValue.hashMale or tattooValue.hashFemale or ''
                        hashMale = tattooValue.hashMale or tattooValue.hash or tattooValue.name or label
                        hashFemale = tattooValue.hashFemale or tattooValue.hash or tattooValue.name or label
                        zoneValue = tattooValue.zone or tattooValue.zoneIndex and TattooZones[(tattooValue.zoneIndex or 0) + 1] and TattooZones[(tattooValue.zoneIndex or 0) + 1].zone or zoneValue
                    end

                    local zoneInfo = getZoneInfo(zoneValue)
                    local zoneKey = zoneInfo.zone

                    if not zonesByKey[zoneKey] then
                        zonesByKey[zoneKey] = {
                            label = zoneInfo.label,
                            zone = zoneInfo.zone,
                            zoneIndex = zoneInfo.index,
                            dlcs = {},
                            _dlcLookup = {}
                        }
                    end

                    local zoneEntry = zonesByKey[zoneKey]
                    local dlcEntry = zoneEntry._dlcLookup[dlcData.dlc]

                    if not dlcEntry then
                        dlcEntry = {
                            label = dlcData.dlc,
                            dlcIndex = #zoneEntry.dlcs,
                            tattoos = {}
                        }
                        zoneEntry._dlcLookup[dlcData.dlc] = dlcEntry
                        table.insert(zoneEntry.dlcs, dlcEntry)
                    end

                    table.insert(dlcEntry.tattoos, {
                        label = label,
                        hash = hashMale,
                        hashMale = hashMale,
                        hashFemale = hashFemale,
                        opacity = 1.0,
                        dlc = dlcData.dlc,
                        zone = zoneInfo.index or 0,
                        price = tattooValue.price or tattooValue.price
                    })
                end
            end

            local nested = {}
            for _, zoneEntry in pairs(zonesByKey) do
                zoneEntry._dlcLookup = nil
                table.insert(nested, zoneEntry)
            end

            table.sort(nested, function(a, b) return (a.zoneIndex or 0) < (b.zoneIndex or 0) end)

            ServerCache.tattoos = nested
        else
            -- Already in nested format or empty
            ServerCache.tattoos = loadedTattoos
        end
    else
        ServerCache.tattoos = {}
    end

    -- Load settings (theme + locked models)
    local themeFile = LoadResourceFile('tj_appearance', 'shared/data/theme.json')
    if themeFile then
        ServerCache.theme = json.decode(themeFile) or {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6',
            shape = 'hexagon',
        }
    else
        ServerCache.theme = {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6',
            shape = 'hexagon',
        }
    end

    local lockedmodels = LoadResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json')
    ServerCache.settings.lockedModels = lockedmodels and json.decode(lockedmodels) or { lockedModels = {} }
end

-- Load appearance settings (useTarget, blip defaults, ped toggles)
local function LoadAppearanceSettingsCache()
    local settingsFile = LoadResourceFile(GetCurrentResourceName(), 'shared/data/appearance_settings.json')
    local defaults = {
        useTarget = Config.UseTarget ~= false,
        enablePedsForShops = Config.EnablePedsForShops ~= false,
        blips = Config.Blips or {}
    }

    if settingsFile then
        local decoded = json.decode(settingsFile) or {}
        ServerCache.appearanceSettings = defaults

        if type(decoded) == 'table' then
            ServerCache.appearanceSettings.useTarget = decoded.useTarget ~= nil and decoded.useTarget or defaults.useTarget
            ServerCache.appearanceSettings.enablePedsForShops = decoded.enablePedsForShops ~= nil and decoded.enablePedsForShops or defaults.enablePedsForShops
            ServerCache.appearanceSettings.blips = decoded.blips or defaults.blips
        end
    else
        ServerCache.appearanceSettings = defaults
    end
end

-- Load shop settings into cache
local function LoadShopSettingsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/shop_settings.json')
    ServerCache.shopSettings = jsonData and json.decode(jsonData) or {
        enablePedsForShops = true,
        enablePedsForClothingRooms = true,
        enablePedsForPlayerOutfitRooms = true
    }
end

-- Load shop configs into cache
local function LoadShopConfigsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/shop_configs.json')
    ServerCache.shopConfigs = jsonData and json.decode(jsonData) or {}
end

-- Load zones into cache
local function LoadZonesCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/zones.json')
    ServerCache.zones = jsonData and json.decode(jsonData) or {}
end

-- Load outfits into cache
local function LoadOutfitsCache()
    local jsonData = LoadResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json')
    ServerCache.outfits = jsonData and json.decode(jsonData) or {}
end

-- Initialize all caches on resource start
CreateThread(function()
    LoadCache()
    LoadShopSettingsCache()
    LoadShopConfigsCache()
    LoadZonesCache()
    LoadOutfitsCache()
    LoadAppearanceSettingsCache()
end)

-- Save cache to database on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
end)

-- Admin permission check
function IsAdmin(source)
    -- Check for ACE permission
    local isAdmin = IsPlayerAceAllowed(source, 'command')
    return isAdmin
end

lib.callback.register('tj_appearance:admin:isAdmin', function(source)
    return IsAdmin(source)
end)

-- Save theme configuration (includes shape)
lib.callback.register('tj_appearance:admin:saveTheme', function(source, theme)
    if not IsAdmin(source) then return false end

    ServerCache.theme = theme
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/theme.json', json.encode(theme), -1)

    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateTheme', -1, theme)
    return true
end)

-- Save settings
lib.callback.register('tj_appearance:admin:saveSettings', function(source, settings)
    if not IsAdmin(source) then return false end

    ServerCache.settings.lockedModels = settings
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json', json.encode(settings), -1)
    TriggerClientEvent('tj_appearance:client:updateLockedModels', -1, settings)

    return true
end)

-- Save appearance settings (useTarget, blip defaults, ped toggle)
lib.callback.register('tj_appearance:admin:saveAppearanceSettings', function(source, settings)
    if not IsAdmin(source) then return false end

    if type(settings) ~= 'table' then return false end

    -- Merge with defaults to avoid nils
    local merged = {
        useTarget = settings.useTarget ~= nil and settings.useTarget or (Config.UseTarget ~= false),
        enablePedsForShops = settings.enablePedsForShops ~= nil and settings.enablePedsForShops or (Config.EnablePedsForShops ~= false),
        chargePerTattoo = settings.chargePerTattoo ~= nil and settings.chargePerTattoo or false,
        blips = settings.blips or Config.Blips or {},
        prices = settings.prices or { clothing = 0, barber = 0, tattoo = 0, surgeon = 0 },
        initialClothes = settings.initialClothes or {
            male = {
                model = 'mp_m_freemode_01',
                components = {},
                props = {},
                hair = { color = 0, highlight = 0, style = 0, texture = 0 }
            },
            female = {
                model = 'mp_f_freemode_01',
                components = {},
                props = {},
                hair = { color = 0, highlight = 0, style = 0, texture = 0 }
            }
        }
    }

    ServerCache.appearanceSettings = merged
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/appearance_settings.json', json.encode(merged), -1)

    -- Broadcast to all clients so menus/zones can reflect changes
    TriggerClientEvent('tj_appearance:client:updateAppearanceSettings', -1, merged)

    return true
end)

lib.callback.register('tj_appearance:admin:saveTattoos', function(source, tattoos)
    if not IsAdmin(source) then return false end

    -- Tattoos come from admin menu in simple DLC format
    -- Save the simple format (now supporting label/hashMale/hashFemale) to file
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/tattoos.json', json.encode(tattoos or {}), -1)
    
    -- Convert to nested format for UI
    local zonesByKey = {}

    for dlcIndex, dlcData in ipairs(tattoos or {}) do
        for _, tattooValue in ipairs(dlcData.tattoos or {}) do
            local label = tattooValue
            local hashMale = tattooValue
            local hashFemale = tattooValue
            local zoneValue = dlcData.zone
            local zoneIndex = nil

            if type(tattooValue) == 'table' then
                label = tattooValue.label or tattooValue.name or tattooValue.hashMale or tattooValue.hashFemale or ''
                hashMale = tattooValue.hashMale or tattooValue.hash or tattooValue.name or label
                hashFemale = tattooValue.hashFemale or tattooValue.hash or tattooValue.name or label
                zoneValue = tattooValue.zone or zoneValue
                zoneIndex = tattooValue.zoneIndex
            end

            if zoneIndex ~= nil and not zoneValue and TattooZones[(zoneIndex or 0) + 1] then
                zoneValue = TattooZones[(zoneIndex or 0) + 1].zone
            end

            local zoneInfo = getZoneInfo(zoneValue)
            local zoneKey = zoneInfo.zone

            if not zonesByKey[zoneKey] then
                zonesByKey[zoneKey] = {
                    label = zoneInfo.label,
                    zone = zoneInfo.zone,
                    zoneIndex = zoneInfo.index,
                    dlcs = {},
                    _dlcLookup = {}
                }
            end

            local zoneEntry = zonesByKey[zoneKey]
            local dlcEntry = zoneEntry._dlcLookup[dlcData.dlc]

            if not dlcEntry then
                dlcEntry = {
                    label = dlcData.dlc,
                    dlcIndex = #zoneEntry.dlcs,
                    tattoos = {}
                }
                zoneEntry._dlcLookup[dlcData.dlc] = dlcEntry
                table.insert(zoneEntry.dlcs, dlcEntry)
            end

            table.insert(dlcEntry.tattoos, {
                label = label,
                hash = hashMale,
                hashMale = hashMale,
                hashFemale = hashFemale,
                opacity = 1.0,
                dlc = dlcData.dlc,
                zone = zoneInfo.index or 0,
                price = tattooValue.price or tattooValue.price
            })
        end
    end

    local nested = {}
    for _, zoneEntry in pairs(zonesByKey) do
        zoneEntry._dlcLookup = nil
        table.insert(nested, zoneEntry)
    end

    table.sort(nested, function(a, b) return (a.zoneIndex or 0) < (b.zoneIndex or 0) end)

    ServerCache.tattoos = nested
    TriggerClientEvent('tj_appearance:client:updateTattoos', -1, ServerCache.tattoos)
    return true
end)

-- Append locked models without removing existing ones
lib.callback.register('tj_appearance:admin:addLockedModels', function(source, payload)
    if not IsAdmin(source) then return false end
    local modelsToAdd = (payload and payload.models) or {}
    if type(modelsToAdd) ~= 'table' or #modelsToAdd == 0 then return false end

    -- Ensure cache initialized
    if not ServerCache.settings.lockedModels then
        ServerCache.settings.lockedModels = {}
    end
    local current = ServerCache.settings.lockedModels or {}

    -- Merge unique
    local seen = {}
    for _, m in ipairs(current) do seen[m] = true end
    local changed = false
    for _, m in ipairs(modelsToAdd) do
        if m ~= 'mp_m_freemode_01' and m ~= 'mp_f_freemode_01' and not seen[m] then
            table.insert(current, m)
            seen[m] = true
            changed = true
        end
    end

    if not changed then return ServerCache.settings.lockedModels end

    -- Persist to JSON
    ServerCache.settings.lockedModels = current
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/locked_models.json', json.encode(current), -1)

    return ServerCache.settings.lockedModels
end)

-- Save shop settings and configs
lib.callback.register('tj_appearance:admin:saveShopSettings', function(source, data)
    if not IsAdmin(source) then return false end

    local settings = data.settings
    local configs = data.configs

    -- Save shop settings
    ShopSettingsCache = settings
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/shop_settings.json', json.encode(settings), -1)

    -- Save shop configs
    ShopConfigsCache = configs
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/shop_configs.json', json.encode(configs), -1)

    return true
end)

-- Add zone
lib.callback.register('tj_appearance:admin:addZone', function(source, zone)
    if not IsAdmin(source) then return false end

    -- Generate an ID for the new zone
    local newZone = deepcopy(zone)
    newZone.id = #ServerCache.zones + 1

    table.insert(ServerCache.zones, newZone)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ServerCache.zones), -1)

    TriggerClientEvent('tj_appearance:client:updateZones', -1, ServerCache.zones)
    return true
end)

-- Update zone
lib.callback.register('tj_appearance:admin:updateZone', function(source, zone)
    if not IsAdmin(source) then return false end

    for i, z in ipairs(ServerCache.zones) do
        if z.id == zone.id then
            ServerCache.zones[i] = zone
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ServerCache.zones), -1)
            TriggerClientEvent('tj_appearance:client:updateZones', -1, ServerCache.zones)
            return true
        end
    end

    return false
end)

-- Delete zone
lib.callback.register('tj_appearance:admin:deleteZone', function(source, id)
    if not IsAdmin(source) then return false end

    for i, zone in ipairs(ServerCache.zones) do
        if zone.id == id then
            table.remove(ServerCache.zones, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/zones.json', json.encode(ServerCache.zones), -1)
            TriggerClientEvent('tj_appearance:client:updateZones', -1, ServerCache.zones)
            return true
        end
    end

    return false
end)

-- Add outfit
lib.callback.register('tj_appearance:admin:addOutfit', function(source, outfit)
    if not IsAdmin(source) then return false end

    local newOutfit = {
        job = outfit.job,
        gang = outfit.gang,
        gender = outfit.gender,
        outfitName = outfit.outfitName,
        outfitData = outfit.outfitData
    }
    newOutfit.id = #ServerCache.outfits + 1

    table.insert(ServerCache.outfits, newOutfit)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json', json.encode(ServerCache.outfits), -1)
    TriggerClientEvent('tj_appearance:client:updateOutfits', -1, ServerCache.outfits)

    return { id = newOutfit.id }
end)

-- Delete outfit
lib.callback.register('tj_appearance:admin:deleteOutfit', function(source, id)
    if not IsAdmin(source) then return false end

    for i, outfit in ipairs(ServerCache.outfits) do
        if outfit.id == id then
            table.remove(ServerCache.outfits, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/outfits.json', json.encode(ServerCache.outfits), -1)
            TriggerClientEvent('tj_appearance:client:updateOutfits', -1, ServerCache.outfits)
            return true
        end
    end

    return false
end)

-- Add model
lib.callback.register('tj_appearance:admin:addModel', function(source, modelName)
    if not IsAdmin(source) then return false end

    -- Prevent adding freemode models (they should always exist)
    if modelName == 'mp_m_freemode_01' or modelName == 'mp_f_freemode_01' then
        return false
    end

    -- Check if model already exists
    for _, model in ipairs(ServerCache.models) do
        if model == modelName then
            return false
        end
    end

    -- Update cache and save
    table.insert(ServerCache.models, modelName)
    table.sort(ServerCache.models)
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ServerCache.models), -1)
    TriggerClientEvent('tj_appearance:client:updateModels', -1, ServerCache.models)

    return true
end)

-- Delete model
lib.callback.register('tj_appearance:admin:deleteModel', function(source, modelName)
    if not IsAdmin(source) then return false end

    -- Prevent deletion of freemode models
    if modelName == 'mp_m_freemode_01' or modelName == 'mp_f_freemode_01' then
        return false
    end

    -- Update cache
    for i, model in ipairs(ServerCache.models) do
        if model == modelName then
            table.remove(ServerCache.models, i)
            SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ServerCache.models), -1)
            TriggerClientEvent('tj_appearance:client:updateModels', -1, ServerCache.models)
            return true
        end
    end

    return false
end)

-- Delete multiple models
lib.callback.register('tj_appearance:admin:deleteModels', function(source, modelNames)
    if not IsAdmin(source) then return false end

    if type(modelNames) ~= 'table' then return false end

    local deletedCount = 0
    for _, modelName in ipairs(modelNames) do
        -- Prevent deletion of freemode models
        if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
            -- Update cache
            for i, model in ipairs(ServerCache.models) do
                if model == modelName then
                    table.remove(ServerCache.models, i)
                    deletedCount = deletedCount + 1
                    break
                end
            end
        end
    end

    if deletedCount > 0 then
        SaveResourceFile(GetCurrentResourceName(), 'shared/data/models.json', json.encode(ServerCache.models), -1)
        TriggerClientEvent('tj_appearance:client:updateModels', -1, ServerCache.models)
    end

    return true
end)
-- Get player info by identifier
lib.callback.register('tj_appearance:admin:getPlayerInfo', function(source, identifier)
    if not IsAdmin(source) then return nil end
    
    -- Search all online players for matching identifier
    for _, playerId in ipairs(GetPlayers()) do
        local identifiers = GetPlayerIdentifiers(playerId)
        for _, id in ipairs(identifiers) do
            if id == identifier then
                local citizenid = Framework.GetCitizenId(playerId)
                local playerName = GetPlayerName(playerId)
                return { citizenid = citizenid, name = playerName }
            end
        end
    end
    
    -- If not online, try to get from database
    -- Extract identifier type and value (e.g., "license:abc123" -> type="license", value="abc123")
    local identifierType, identifierValue = identifier:match("^(%w+):(.+)$")
    if identifierType and identifierValue then
        local query = string.format('SELECT citizenid, JSON_EXTRACT(charinfo, "$.firstname") as firstname, JSON_EXTRACT(charinfo, "$.lastname") as lastname FROM players WHERE %s = ?', identifierType)
        local result = MySQL.query.await(query, {identifier})
        if result and result[1] then
            local firstname = result[1].firstname and result[1].firstname:gsub('"', '') or ''
            local lastname = result[1].lastname and result[1].lastname:gsub('"', '') or ''
            return { citizenid = result[1].citizenid, name = firstname .. ' ' .. lastname }
        end
    end
    
    return nil
end)

-- Add restriction
lib.callback.register('tj_appearance:admin:addRestriction', function(source, restriction)
    if not IsAdmin(source) then return false end

    -- Generate ID based on existing restrictions
    local maxId = 0
    for _, genderRestrictions in pairs(ServerCache.restrictions) do
        for _, restrictions in pairs(genderRestrictions) do
            if type(restrictions) == 'table' then
                for _, r in ipairs(restrictions) do
                    if tonumber(r.id) and tonumber(r.id) > maxId then
                        maxId = tonumber(r.id)
                    end
                end
            end
        end
    end
    local newId = tostring(maxId + 1)

    -- Update cache
    local key = restriction.job or restriction.gang or 'none'
    if not ServerCache.restrictions[key] then
        ServerCache.restrictions[key] = { male = {}, female = {} }
    end
    if not ServerCache.restrictions[key][restriction.gender] then
        ServerCache.restrictions[key][restriction.gender] = {}
    end

    table.insert(ServerCache.restrictions[key][restriction.gender], {
        id = newId,
        group = restriction.group,  -- Use unified field
        job = restriction.job,       -- Legacy support
        gang = restriction.gang,     -- Legacy support
        identifier = restriction.identifier,
        citizenid = restriction.citizenid,
        playerName = restriction.playerName,
        gender = restriction.gender,
        type = restriction.type,
        part = restriction.part,
        category = restriction.category,
        itemId = restriction.itemId,
        texturesAll = restriction.texturesAll,
        textures = restriction.textures
    })

    -- Persist to JSON
    SaveResourceFile('tj_appearance', 'shared/data/restrictions.json', json.encode(ServerCache.restrictions), -1)
    TriggerClientEvent('tj_appearance:client:updateRestrictions', -1, ServerCache.restrictions)

    return true
end)

-- Delete restriction
lib.callback.register('tj_appearance:admin:deleteRestriction', function(source, id)
    if not IsAdmin(source) then return false end

    -- Find and remove from cache
    local restrictionId = tonumber(id)
    local found = false
    
    for key, genderRestrictions in pairs(ServerCache.restrictions) do
        for gender, restrictions in pairs(genderRestrictions) do
            if type(restrictions) == 'table' then
                for i, restriction in ipairs(restrictions) do
                    if tonumber(restriction.id) == restrictionId then
                        table.remove(ServerCache.restrictions[key][gender], i)
                        found = true
                        break
                    end
                end
                if found then break end
            end
        end
        if found then break end
    end

    if found then
        -- Persist to JSON
        SaveResourceFile('tj_appearance', 'shared/data/restrictions.json', json.encode(ServerCache.restrictions), -1)
        TriggerClientEvent('tj_appearance:client:updateRestrictions', -1, ServerCache.restrictions)
    end

    return found
end)

-- Command to open admin menu
RegisterCommand('appearanceadmin', function(source)
    if not IsAdmin(source) then
        TriggerClientEvent('QBCore:Notify', source, 'You do not have permission', 'error')
        return
    end

    TriggerClientEvent('tj_appearance:client:openAdminMenu', source)
end, false)
