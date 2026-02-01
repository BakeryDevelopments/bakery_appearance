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
    appearanceSettings = {
        useTarget = false,
        enablePedsForShops = false,
        chargePerTattoo = false,
        blips = {},
        prices = {
            clothing =  0,
            barber =  0,
            tattoo =  0,
            surgeon =  0
        },
        initialClothes = {
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
    },
    disable = {}
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
    local themeFile = LoadResourceFile('bakery_appearance', 'shared/data/theme.json')
    Cache.theme = themeFile and json.decode(themeFile) or {
        primaryColor = '#3b82f6',
        inactiveColor = '#8b5cf6',
        shape = 'hexagon',
    }

    -- Load restrictions and convert to nested format if needed
    local restrictionsFile = LoadResourceFile('bakery_appearance', 'shared/data/restrictions.json')
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

    local settingsFile = LoadResourceFile('bakery_appearance', 'shared/data/locked_models.json')
    Cache.blacklist.lockedModels = settingsFile and json.decode(settingsFile) or {}

    -- Load disable config from Config
    if Config and Config.Disable then
        Cache.disable = Config.Disable
    end

    return Cache
end

-- Load appearance settings (useTarget, blip defaults, ped toggle, prices, initial clothes)
local function loadAppearanceSettings()
    local settingsFile = LoadResourceFile('bakery_appearance', 'shared/data/appearance_settings.json')
    
    -- Import peddata for component/prop names
    local peddata = require('modules.ped')

    -- Initialize default components with proper names (0-11)
    for i = 0, 11 do
        local name = peddata.Components[i]
        Cache.appearanceSettings.initialClothes.male.components[name] = {
            id = name,
            index = i,
            value = 0,
            texture = 0
        }
        Cache.appearanceSettings.initialClothes.female.components[name] = {
            id = name,
            index = i,
            value = 0,
            texture = 0
        }
    end

    -- Initialize default props with proper names (0-7)
    for i = 0, 7 do
        local name = peddata.Props[i]
        Cache.appearanceSettings.initialClothes.male.props[name] = {
            id = name,
            index = i,
            value = -1,
            texture = -1
        }
        Cache.appearanceSettings.initialClothes.female.props[name] = {
            id = name,
            index = i,
            value = -1,
            texture = -1
        }
    end

    if settingsFile then
        local decoded = json.decode(settingsFile) or {}

        if type(decoded) == 'table' then
            Cache.appearanceSettings.useTarget = decoded.useTarget ~= nil and decoded.useTarget or Cache.appearanceSettings.useTarget
            Cache.appearanceSettings.enablePedsForShops = decoded.enablePedsForShops ~= nil and decoded.enablePedsForShops or Cache.appearanceSettings.enablePedsForShops
            Cache.appearanceSettings.useRadialMenu = decoded.useRadialMenu ~= nil and decoded.useRadialMenu or Cache.appearanceSettings.useRadialMenu
            Cache.appearanceSettings.chargePerTattoo = decoded.chargePerTattoo ~= nil and decoded.chargePerTattoo or Cache.appearanceSettings.chargePerTattoo
            Cache.appearanceSettings.blips = decoded.blips or Cache.appearanceSettings.blips
            Cache.appearanceSettings.prices = decoded.prices or Cache.appearanceSettings.prices
            Cache.appearanceSettings.initialClothes = decoded.initialClothes or Cache.appearanceSettings.initialClothes
        end
    end

    return Cache.appearanceSettings
end

-- Load models from JSON
local function loadModels()
    local modelsFile = LoadResourceFile('bakery_appearance', 'shared/data/models.json')
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
    local zonesFile = LoadResourceFile('bakery_appearance', 'shared/data/zones.json')
    Cache.zones = zonesFile and json.decode(zonesFile) or {}

    return Cache.zones
end

-- Load outfits from JSON
local function loadOutfits()
    local outfitsFile = LoadResourceFile('bakery_appearance', 'shared/data/outfits.json')
    Cache.outfits = outfitsFile and json.decode(outfitsFile) or {}
    return Cache.outfits
end

-- Load tattoos from JSON
local function loadTattoos()
    local tattoosFile = LoadResourceFile('bakery_appearance', 'shared/data/tattoos.json')
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
    local shopSettingsFile = LoadResourceFile('bakery_appearance', 'shared/data/shop_settings.json')
    Cache.shopSettings = shopSettingsFile and json.decode(shopSettingsFile) or {
        enablePedsForShops = true,
        enablePedsForClothingRooms = true,
        enablePedsForPlayerOutfitRooms = true
    }

    return Cache.shopSettings
end

-- Load shop configs from JSON
local function loadShopConfigs()
    local shopConfigsFile = LoadResourceFile('bakery_appearance', 'shared/data/shop_configs.json')
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

    -- Process nested structure: restrictions are grouped by group name (job/gang)
    for groupName, genderRestrictions in pairs(Cache.blacklist.restrictions) do
        -- Check if this group's restrictions should apply to the player
        local isBlocked = false
        
        if groupName == 'none' then
            -- No group restriction = available to everyone, don't block
            isBlocked = false
        elseif playerJob ~= groupName and playerGang ~= groupName then
            -- Player doesn't have this group (as job or gang), so block them
            isBlocked = true
        end
        
        -- Only add to blacklist if player is blocked from this group
        if isBlocked and type(genderRestrictions) == 'table' then
            -- Iterate through male/female restrictions
            for gender, restrictionList in pairs(genderRestrictions) do
                if type(restrictionList) == 'table' and (gender == 'male' or gender == 'female') then
                    for _, restriction in ipairs(restrictionList) do
                        -- Process each restriction
                        if restriction.type == 'model' then
                            local modelName = restriction.itemId
                            -- Don't block freemode models
                            if modelName ~= 'mp_m_freemode_01' and modelName ~= 'mp_f_freemode_01' then
                                table.insert(blocklist[gender].models, modelName)
                            end
                        elseif restriction.type == 'clothing' then
                            -- Handle clothing/prop restrictions
                            local targetList = (restriction.part == 'prop') and blocklist[gender].props or blocklist[gender].drawables

                            if restriction.texturesAll then
                                -- Lock all textures for this item
                                if not targetList[restriction.category] then
                                    targetList[restriction.category] = { textures = {}, values = {} }
                                end

                                table.insert(targetList[restriction.category].values, restriction.itemId)
                                local key = tostring(restriction.itemId)
                                targetList[restriction.category].textures[key] = {}

                                -- Mark all possible textures as locked (0-25 max)
                                for i = 0, 25 do
                                    table.insert(targetList[restriction.category].textures[key], i)
                                end

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
    local localeFile = LoadResourceFile('bakery_appearance', 'shared/locale/'..Config.Locale..'.json')
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
    Wait(1000)

    handleNuiMessage({ action = 'setRestrictions', data = Cache.blacklist.restrictions or {} }, false)
    handleNuiMessage({ action = 'setModels', data = Cache.models }, false)
    handleNuiMessage({ action = 'setLockedModels', data = Cache.blacklist.lockedModels or {} }, false)
    handleNuiMessage({ action = 'setShopSettings', data = Cache.shopSettings }, false)
    handleNuiMessage({ action = 'setShopConfigs', data = Cache.shopConfigs }, false)
    handleNuiMessage({ action = 'setZones', data = Cache.zones }, false)
    handleNuiMessage({ action = 'setOutfits', data = Cache.outfits }, false)
    handleNuiMessage({ action = 'setTattoos', data = Cache.tattoos }, false)
    handleNuiMessage({ action = 'setAppearanceSettings', data = Cache.appearanceSettings }, false)
    handleNuiMessage({ action = 'setDisableConfig', data = Cache.disable }, false)
    handleNuiMessage({ action = 'setThemeConfig', data = Cache.theme }, false)
    handleNuiMessage({ action = 'setLocale', data = Cache.locale }, false)
    
end


RegisterNetEvent('bakery_appearance:client:updateTheme', function(theme)
    Cache.theme = theme
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateTattoos', function(tattoos)
    Cache.tattoos = tattoos or {}
    handleNuiMessage({ action = 'setTattoos', data = Cache.tattoos }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateAppearanceSettings', function(settings)
    Cache.appearanceSettings = settings or Cache.appearanceSettings or {}
    handleNuiMessage({ action = 'setAppearanceSettings', data = Cache.appearanceSettings }, true)
end)

-- Public API to get cache data
CacheAPI = {
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
    getDisableConfig = function() return Cache.disable end,
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