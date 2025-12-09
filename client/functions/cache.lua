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
    locale = {}
}

-- Load settings (locked models) from JSON
local function loadSettings()
    local themeFile = LoadResourceFile('tj_appearance', 'shared/data/theme.json')
    Cache.theme = themeFile and json.decode(themeFile) or {
        primaryColor = '#3b82f6',
        inactiveColor = '#8b5cf6',
        shape = 'hexagon',
    }

    -- Just load the flat array of restrictions
    local restrictionsFile = LoadResourceFile('tj_appearance', 'shared/data/restrictions.json')
    Cache.blacklist.restrictions = restrictionsFile and json.decode(restrictionsFile) or {}

    local settingsFile = LoadResourceFile('tj_appearance', 'shared/data/locked_models.json')
    Cache.blacklist.lockedModels = settingsFile and json.decode(settingsFile) or {}

    return Cache
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
    Cache.tattoos = tattoosFile and json.decode(tattoosFile) or {}
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
    
    -- Send theme and locale with a small delay to ensure NUI handlers are ready
    SetTimeout(200, function()
        handleNuiMessage({ action = 'setThemeConfig', data = Cache.theme }, false)
        handleNuiMessage({ action = 'setLocale', data = Cache.locale }, false)
    end)
    
    print('[tj_appearance] Cache initialized and sent to NUI')
end


RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
    Cache.theme = theme
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('tj_appearance:client:updateTattoos', function(tattoos)
    Cache.tattoos = tattoos or {}
    handleNuiMessage({ action = 'setTattoos', data = Cache.tattoos }, true)
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