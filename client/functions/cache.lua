local handleNuiMessage = require('modules.nui')
local Cache = {
    theme = {},
    models = {},
    modelhash = {},
    zones = {},
    outfits = {},
    tattoos = {},
    shopSettings = {},
    shopConfigs = {},
    blacklist = {},
    locale = {},
    appearanceSettings = {}
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
    return TattooZones[1]
end

-- Load settings (locked models) from JSON
local function loadSettings()
    local themeFile = LoadResourceFile('tj_appearance', 'shared/data/theme.json')
    Cache.theme = themeFile and json.decode(themeFile) or {
        primaryColor = '#3b82f6',
        inactiveColor = '#8b5cf6',
        shape = 'hexagon',
    }

    -- Load restrictions and convert to nested format if needed
    local restrictionsFile = LoadResourceFile('tj_appearance', 'shared/data/restrictions.json')
    local loadedRestrictions = restrictionsFile and json.decode(restrictionsFile) or {}
    
    -- Check if it's a flat array and convert to nested structure
    if loadedRestrictions[1] and not loadedRestrictions[1].male then
        -- It's a flat array, convert to nested structure
        local nested = {}
        for _, restriction in ipairs(loadedRestrictions) do
            local key = string.format('%s_%s', restriction.job or restriction.group or 'none', restriction.gang or 'none')
            if not nested[key] then
                nested[key] = { male = {}, female = {} }
            end
            if not nested[key][restriction.gender] then
                nested[key][restriction.gender] = {}
            end
            table.insert(nested[key][restriction.gender], restriction)
        end
        Cache.blacklist.restrictions = nested
    else
        Cache.blacklist.restrictions = loadedRestrictions
    end

    local settingsFile = LoadResourceFile('tj_appearance', 'shared/data/locked_models.json')
    Cache.blacklist.lockedModels = settingsFile and json.decode(settingsFile) or {}

    return Cache
end

-- Load appearance settings (useTarget, blip defaults, ped toggle)
local function loadAppearanceSettings()
    local settingsFile = LoadResourceFile('tj_appearance', 'shared/data/appearance_settings.json')
    local defaults = {
        useTarget = Config.UseTarget ~= false,
        enablePedsForShops = Config.EnablePedsForShops ~= false,
        blips = Config.Blips or {}
    }

    if settingsFile then
        local decoded = json.decode(settingsFile) or {}
        Cache.appearanceSettings = defaults

        if type(decoded) == 'table' then
            Cache.appearanceSettings.useTarget = decoded.useTarget ~= nil and decoded.useTarget or defaults.useTarget
            Cache.appearanceSettings.enablePedsForShops = decoded.enablePedsForShops ~= nil and decoded.enablePedsForShops or defaults.enablePedsForShops
            Cache.appearanceSettings.blips = decoded.blips or defaults.blips
        end
    else
        Cache.appearanceSettings = defaults
    end

    return Cache.appearanceSettings
end

-- Load models from JSON
local function loadModels()
    local modelsFile = LoadResourceFile('tj_appearance', 'shared/data/models.json')
    local rawModels = modelsFile and json.decode(modelsFile) or {}

    table.sort(rawModels)

    -- Preallocate table with freemode models first
    local sortedModels = { 'mp_m_freemode_01', 'mp_f_freemode_01' }
    local insertIndex = #sortedModels + 1

    -- Single loop to add all other models
    for _, model in ipairs(rawModels) do
        if model ~= 'mp_m_freemode_01' and model ~= 'mp_f_freemode_01' then
            sortedModels[insertIndex] = model
            insertIndex = insertIndex + 1
        end
    end

    Cache.models = sortedModels
    return Cache.models
end

-- Load zones from JSON
local function loadZones()
    local zonesFile = LoadResourceFile('tj_appearance', 'shared/data/zones.json')
    Cache.zones = zonesFile and json.decode(zonesFile) or {}

    return Cache.zones
end

-- Load outfits from JSON
local function loadOutfits()
    local outfitsFile = LoadResourceFile('tj_appearance', 'shared/data/outfits.json')
    Cache.outfits = outfitsFile and json.decode(outfitsFile) or {}
    return Cache.outfits
end

-- Load tattoos from JSON
local function loadTattoos()
    local tattoosFile = LoadResourceFile('tj_appearance', 'shared/data/tattoos.json')
    local loadedTattoos = tattoosFile and json.decode(tattoosFile) or {}
    
    -- Convert simple DLC array (strings or objects) to nested zone structure for UI compatibility
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
                    zoneValue = tattooValue.zone or zoneValue
                    if not zoneValue and tattooValue.zoneIndex then
                        local candidate = TattooZones[(tattooValue.zoneIndex or 0) + 1]
                        zoneValue = candidate and candidate.zone or zoneValue
                    end
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

        Cache.tattoos = nested
    else
        -- Already in nested format or empty
        Cache.tattoos = loadedTattoos
    end
    
    return Cache.tattoos
end

-- Load shop settings from JSON
local function loadShopSettings()
    local shopSettingsFile = LoadResourceFile('tj_appearance', 'shared/data/shop_settings.json')
    Cache.shopSettings = shopSettingsFile and json.decode(shopSettingsFile) or {
        enablePedsForShops = true,
        enablePedsForClothingRooms = true,
        enablePedsForPlayerOutfitRooms = true
    }

    return Cache.shopSettings
end

-- Load shop configs from JSON
local function loadShopConfigs()
    local shopConfigsFile = LoadResourceFile('tj_appearance', 'shared/data/shop_configs.json')
    Cache.shopConfigs = shopConfigsFile and json.decode(shopConfigsFile) or {}
    return Cache.shopConfigs
end

local function GetPlayerRestrictions()
    local player = Framework and Framework.GetPlayerData() or nil
    if not player then return nil end

    local playerJob = player.job and player.job.name or nil
    local playerGang = player.gang and player.gang.name or nil

    local blocklist = {
        male = { models = {}, drawables = {}, props = {} },
        female = { models = {}, drawables = {}, props = {} }
    }

    if not Cache.blacklist.restrictions or type(Cache.blacklist.restrictions) ~= 'table' then
        return blocklist
    end

    -- Process each restriction in the flat array
    for _, restriction in ipairs(Cache.blacklist.restrictions) do
        local isBlocked = false

        -- If restriction has a group, check if player has it (as job OR gang)
        if restriction.group and restriction.group ~= '' then
            -- Player needs to have this group (as job or gang) to access the item
            -- If they don't have it, block them
            if playerJob ~= restriction.group and playerGang ~= restriction.group then
                isBlocked = true
            end
        end
        -- No group = available to everyone, so isBlocked stays false

        -- Only add to blacklist if player is blocked from this restriction
        if isBlocked then
            -- Filter by gender if specified
            local gender = restriction.gender
            if gender and (gender == 'male' or gender == 'female') then
                if restriction.type == 'model' then
                    local modelName = restriction.itemId
                    -- Don't block freemode models
                    if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
                        table.insert(blocklist[gender].models, modelName)
                    end
                elseif restriction.type == 'clothing' then
                    -- Handle clothing/prop restrictions
                    local targetList = (restriction.part == 'prop') and blocklist[gender].props or
                    blocklist[gender].drawables

                    if restriction.texturesAll then
                        if not targetList[restriction.category] then
                            targetList[restriction.category] = { values = {} }
                        end
                        table.insert(targetList[restriction.category].values, restriction.itemId)
                    elseif restriction.textures and #restriction.textures > 0 then
                        if not targetList[restriction.category] then
                            targetList[restriction.category] = { textures = {} }
                        end
                        targetList[restriction.category].textures[tostring(restriction.itemId)] = restriction.textures
                    end
                end
            end
        end
    end

    -- Merge model restrictions across genders
    local merged, seen = {}, {}
    for _, m in ipairs(blocklist.male.models) do
        if not seen[m] then
            table.insert(merged, m)
            seen[m] = true
        end
    end
    for _, m in ipairs(blocklist.female.models) do
        if not seen[m] then
            table.insert(merged, m)
            seen[m] = true
        end
    end
    blocklist.male.models = merged
    blocklist.female.models = merged

    -- Add locked models to blacklist
    if Cache.blacklist.lockedModels then
        for _, lockedModel in ipairs(Cache.blacklist.lockedModels) do
            if lockedModel ~= 'mp_m_freemode_01' and lockedModel ~= 'mp_f_freemode_01' then
                local alreadyBlacklisted = false
                for _, m in ipairs(blocklist.male.models) do
                    if m == lockedModel then
                        alreadyBlacklisted = true
                        break
                    end
                end
                if not alreadyBlacklisted then
                    table.insert(blocklist.male.models, lockedModel)
                    table.insert(blocklist.female.models, lockedModel)
                end
            end
        end
    end

    return blocklist
end

local function loadLocale()
    local localeFile = LoadResourceFile('tj_appearance', 'shared/locale/'..Config.Locale..'.json')
    Cache.locale = localeFile and json.decode(localeFile) or {}
    return Cache.locale
end

local function getmodelhashname(hash)
    if hash == `mp_m_freemode_01` then
        return 'mp_m_freemode_01'
    elseif hash == `mp_f_freemode_01` then
        return 'mp_f_freemode_01'
    end

    for _, modelName in pairs(Cache.models) do
        if joaat(modelName) == hash then
            return modelName
        end
    end
    return nil
end



-- Initialize all caches on startup
local function initializeCache()
    loadLocale()
    loadSettings()
    loadModels()
    loadZones()
    loadOutfits()
    loadTattoos()
    loadShopSettings()
    loadShopConfigs()
    loadAppearanceSettings()

    -- Wait a bit for NUI to be ready
    Wait(100)

    handleNuiMessage({ action = 'setRestrictions', data = Cache.blacklist.restrictions or {} }, false)
    handleNuiMessage({ action = 'setModels', data = Cache.models }, false)
    handleNuiMessage({ action = 'setLockedModels', data = Cache.blacklist.lockedModels or {} }, false)
    handleNuiMessage({ action = 'setShopSettings', data = Cache.shopSettings }, false)
    handleNuiMessage({ action = 'setShopConfigs', data = Cache.shopConfigs }, false)
    handleNuiMessage({ action = 'setZones', data = Cache.zones }, false)
    handleNuiMessage({ action = 'setOutfits', data = Cache.outfits }, false)
    handleNuiMessage({ action = 'setTattoos', data = Cache.tattoos }, false)
    handleNuiMessage({ action = 'setAppearanceSettings', data = Cache.appearanceSettings }, false)
    
    -- Send theme and locale with a small delay to ensure NUI handlers are ready
    SetTimeout(200, function()
        handleNuiMessage({ action = 'setThemeConfig', data = Cache.theme }, false)
        handleNuiMessage({ action = 'setLocale', data = Cache.locale }, false)
    end)
    
end


RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
    Cache.theme = theme
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('tj_appearance:client:updateTattoos', function(tattoos)
    Cache.tattoos = tattoos or {}
    handleNuiMessage({ action = 'setTattoos', data = Cache.tattoos }, true)
end)

RegisterNetEvent('tj_appearance:client:updateAppearanceSettings', function(settings)
    Cache.appearanceSettings = settings or Cache.appearanceSettings or {}
    handleNuiMessage({ action = 'setAppearanceSettings', data = Cache.appearanceSettings }, true)
end)

-- Public API to get cache data
local CacheAPI = {
    init = initializeCache,
    getTheme = function() return Cache.theme end,
    getSettings = function() return Cache.settings end,
    getModels = function() return Cache.models end,
    getZones = function() return Cache.zones end,
    getOutfits = function() return Cache.outfits end,
    getTattoos = function() return Cache.tattoos end,
    getShopSettings = function() return Cache.shopSettings end,
    getShopConfigs = function() return Cache.shopConfigs end,
    getLocale = function() return Cache.locale end,
    getBlacklistSettings = function() return Cache.blacklist end,
    getAppearanceSettings = function() return Cache.appearanceSettings end,
    updateCache = function(key, value)
        if key == 'restrictions' then
            Cache.blacklist.restrictions = value
        elseif key == 'theme' then
            Cache.theme = value
        elseif key == 'tattoos' then
            Cache.tattoos = value
        elseif key == 'zones' then
            Cache.zones = value
        elseif key == 'outfits' then
            Cache.outfits = value
        elseif key == 'appearanceSettings' then
            Cache.appearanceSettings = value
        end
    end,
    getRestrictions = function()
        -- Flatten nested restrictions structure for AdminMenu
        local flattened = {}
        local restrictions = Cache.blacklist.restrictions
        if restrictions and type(restrictions) == 'table' then
            for groupKey, genderRestrictions in pairs(restrictions) do
                if type(genderRestrictions) == 'table' then
                    for gender, items in pairs(genderRestrictions) do
                        if type(items) == 'table' then
                            for _, restriction in ipairs(items) do
                                table.insert(flattened, restriction)
                            end
                        end
                    end
                end
            end
        end
        return flattened
    end,
    getPlayerRestrictions = GetPlayerRestrictions,
    getModelHashName = getmodelhashname,

}

return CacheAPI