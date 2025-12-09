local QBCore = exports['qb-core']:GetCoreObject()

local ServerCache = {
    theme = {},
    settings = {},
    models = {},
    zones = {},
    outfits = {},
    tattoos = {},
    shopSettings = {},
    shopConfigs = {},
    restrictions = {},
} 

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
        ServerCache.restrictions = json.decode(restrictionsFile) or {}
    else
        ServerCache.restrictions = {}
    end

    local tattoosFile = LoadResourceFile('tj_appearance', 'shared/data/tattoos.json')
    if tattoosFile then
        ServerCache.tattoos = json.decode(tattoosFile) or {}
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
end)

-- Save cache to database on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
end)

-- Admin permission check
local function IsAdmin(source)
    -- Check for ACE permission
    local isAdmin = IsPlayerAceAllowed(source, 'command')
    return isAdmin
end

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

lib.callback.register('tj_appearance:admin:saveTattoos', function(source, tattoos)
    if not IsAdmin(source) then return false end

    ServerCache.tattoos = tattoos or {}
    SaveResourceFile(GetCurrentResourceName(), 'shared/data/tattoos.json', json.encode(ServerCache.tattoos), -1)

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
    local newZone = table.deepcopy(zone)
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

    local newOutfit = table.deepcopy(outfit)
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
    local key = string.format('%s_%s', restriction.job or 'none', restriction.gang or 'none')
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
