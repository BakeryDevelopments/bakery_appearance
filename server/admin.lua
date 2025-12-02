local QBCore = exports['qb-core']:GetCoreObject()

-- Cache for restrictions data
local RestrictionsCache = {}
local ThemeCache = nil
local ShapeCache = nil

-- Load all restrictions into cache on startup
local function LoadRestrictionsCache()
    print('[tj_appearance] Loading restrictions into cache...')
    local result = MySQL.query.await('SELECT * FROM appearance_restrictions ORDER BY job, gang, gender')
    
    RestrictionsCache = {}
    for _, row in ipairs(result or {}) do
        local key = string.format('%s_%s', row.job or 'none', row.gang or 'none')
        if not RestrictionsCache[key] then
            RestrictionsCache[key] = { male = {}, female = {} }
        end
        
        local gender = row.gender
        if not RestrictionsCache[key][gender] then
            RestrictionsCache[key][gender] = {}
        end
        
        table.insert(RestrictionsCache[key][gender], {
            id = tostring(row.id),
            job = row.job,
            gang = row.gang,
            gender = row.gender,
            type = row.type,
            part = row.part,
            category = row.category,
            itemId = row.item_id,
            texturesAll = row.textures_all == 1,
            textures = row.textures and json.decode(row.textures) or nil
        })
    end
    
    print('[tj_appearance] Loaded ' .. #(result or {}) .. ' restrictions into cache')
end

-- Load theme into cache
local function LoadThemeCache()
    local result = MySQL.query.await('SELECT * FROM appearance_theme LIMIT 1')
    if result and result[1] then
        ThemeCache = {
            primaryColor = result[1].primary_color,
            inactiveColor = result[1].inactive_color
        }
    else
        ThemeCache = {
            primaryColor = '#3b82f6',
            inactiveColor = '#8b5cf6'
        }
    end
    print('[tj_appearance] Theme cache loaded')
end

-- Load shape into cache
local function LoadShapeCache()
    local result = MySQL.query.await('SELECT * FROM appearance_shape LIMIT 1')
    if result and result[1] then
        ShapeCache = { type = result[1].shape_type }
    else
        ShapeCache = { type = 'hexagon' }
    end
    print('[tj_appearance] Shape cache loaded')
end

-- Initialize all caches on resource start
CreateThread(function()
    LoadThemeCache()
    LoadShapeCache()
    LoadRestrictionsCache()
end)

-- Save cache to database on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    print('[tj_appearance] Resource stopping, cache is already persisted in DB')
end)

-- Admin permission check
local function IsAdmin(source)
    -- Check for ACE permission
    local isAdmin = IsPlayerAceAllowed(source, 'command')
    print('[tj_appearance] IsAdmin check for ' .. GetPlayerName(source) .. ': ' .. tostring(isAdmin))
    return isAdmin
end

-- Load theme configuration
lib.callback.register('tj_appearance:admin:getTheme', function(source)
    if not IsAdmin(source) then return nil end
    return ThemeCache
end)

-- Save theme configuration
lib.callback.register('tj_appearance:admin:saveTheme', function(source, theme)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await([[
        INSERT INTO appearance_theme (id, primary_color, inactive_color)
        VALUES (1, ?, ?)
        ON DUPLICATE KEY UPDATE
            primary_color = VALUES(primary_color),
            inactive_color = VALUES(inactive_color)
    ]], {
        theme.primaryColor,
        theme.inactiveColor
    })
    
    -- Update cache
    ThemeCache = theme
    
    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateTheme', -1, theme)
    return true
end)

-- Load shape configuration
lib.callback.register('tj_appearance:admin:getShape', function(source)
    if not IsAdmin(source) then return nil end
    return ShapeCache
end)

-- Save shape configuration
lib.callback.register('tj_appearance:admin:saveShape', function(source, shape)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await([[
        INSERT INTO appearance_shape (id, shape_type)
        VALUES (1, ?)
        ON DUPLICATE KEY UPDATE shape_type = VALUES(shape_type)
    ]], { shape.type })
    
    -- Update cache
    ShapeCache = shape
    
    -- Broadcast to all clients
    TriggerClientEvent('tj_appearance:client:updateShape', -1, shape)
    return true
end)

-- Get all restrictions
lib.callback.register('tj_appearance:admin:getRestrictions', function(source)
    if not IsAdmin(source) then return {} end
    
    local all = {}
    for _, jobGangData in pairs(RestrictionsCache) do
        for _, genderData in pairs(jobGangData) do
            for _, restriction in ipairs(genderData) do
                table.insert(all, restriction)
            end
        end
    end
    
    return all
end)

-- Advanced JSON blacklist sets (per job/gang/gender)
lib.callback.register('tj_appearance:admin:listBlacklistSets', function(source)
    if not IsAdmin(source) then return {} end
    local result = MySQL.query.await('SELECT id, job, gang, gender FROM appearance_blacklists ORDER BY job, gang, gender')
    local sets = {}
    for _, row in ipairs(result or {}) do
        table.insert(sets, {
            id = tostring(row.id),
            job = row.job,
            gang = row.gang,
            gender = row.gender,
        })
    end
    return sets
end)

lib.callback.register('tj_appearance:admin:getBlacklistData', function(source, info)
    if not IsAdmin(source) then return nil end
    local result = MySQL.query.await([[SELECT data FROM appearance_blacklists WHERE job <=> ? AND gang <=> ? AND gender = ? LIMIT 1]], {
        info.job, info.gang, info.gender
    })
    if result and result[1] then
        local ok, decoded = pcall(json.decode, result[1].data)
        if ok then return decoded end
    end
    return { models = {}, drawables = {}, props = {} }
end)

lib.callback.register('tj_appearance:admin:saveBlacklistData', function(source, payload)
    if not IsAdmin(source) then return false end
    local dataJson = json.encode(payload.data or { models = {}, drawables = {}, props = {} })
    MySQL.query.await([[INSERT INTO appearance_blacklists (job, gang, gender, data)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE data = VALUES(data)]], {
        payload.job, payload.gang, payload.gender, dataJson
    })
    return true
end)

lib.callback.register('tj_appearance:admin:deleteBlacklistData', function(source, payload)
    if not IsAdmin(source) then return false end
    MySQL.query.await('DELETE FROM appearance_blacklists WHERE job <=> ? AND gang <=> ? AND gender = ?', {
        payload.job, payload.gang, payload.gender
    })
    return true
end)

-- Get restrictions for specific player
lib.callback.register('tj_appearance:getPlayerRestrictions', function(source)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return {} end
    
    local job = Player.PlayerData.job.name
    local gang = Player.PlayerData.gang and Player.PlayerData.gang.name or nil
    
    local out = {
        male = { models = {}, drawables = {}, props = {} },
        female = { models = {}, drawables = {}, props = {} }
    }
    
    -- Iterate through ALL restrictions and lock items where player is NOT in the job/gang
    for key, jobGangData in pairs(RestrictionsCache) do
        for gender, restrictions in pairs(jobGangData) do
            for _, restriction in ipairs(restrictions) do
                -- Check if this restriction applies to a different job/gang than the player's
                local isPlayerInGroup = false
                
                if restriction.job and restriction.job == job then
                    isPlayerInGroup = true
                end
                
                if restriction.gang and gang and restriction.gang == gang then
                    isPlayerInGroup = true
                end
                
                -- Only blacklist if player is NOT in the restricted group
                if not isPlayerInGroup then
                    if restriction.type == 'model' then
                        -- Model blacklist
                        table.insert(out[gender].models, restriction.itemId)
                    else
                        -- Clothing/prop blacklist
                        local category = restriction.category
                        local part = restriction.part -- 'drawable' or 'prop'
                        local targetList = (part == 'prop') and out[gender].props or out[gender].drawables
                        
                        if restriction.texturesAll then
                            -- Blacklist all textures for this item - add to values array
                            if not targetList[category] then
                                targetList[category] = { values = {} }
                            end
                            if not targetList[category].values then
                                targetList[category].values = {}
                            end
                            table.insert(targetList[category].values, restriction.itemId)
                        elseif restriction.textures and #restriction.textures > 0 then
                            -- Blacklist specific textures only if textures array is not empty
                            if not targetList[category] then
                                targetList[category] = { textures = {} }
                            end
                            if not targetList[category].textures then
                                targetList[category].textures = {}
                            end
                            targetList[category].textures[tostring(restriction.itemId)] = restriction.textures
                        end
                    end
                end
            end
        end
    end

    return { legacy = out }
end)

-- Add restriction
lib.callback.register('tj_appearance:admin:addRestriction', function(source, restriction)
    if not IsAdmin(source) then return false end
    
    local textures_json = nil
    if restriction.textures and type(restriction.textures) == 'table' then
        textures_json = json.encode(restriction.textures)
    end
    
    local result = MySQL.insert.await([[
        INSERT INTO appearance_restrictions (job, gang, gender, type, part, category, item_id, textures_all, textures)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]], {
        restriction.job,
        restriction.gang,
        restriction.gender,
        restriction.type,
        restriction.part or 'drawable',
        restriction.category,
        restriction.itemId,
        (restriction.texturesAll and 1 or 0),
        textures_json
    })
    
    if result and result > 0 then
        -- Update cache
        local key = string.format('%s_%s', restriction.job or 'none', restriction.gang or 'none')
        if not RestrictionsCache[key] then
            RestrictionsCache[key] = { male = {}, female = {} }
        end
        if not RestrictionsCache[key][restriction.gender] then
            RestrictionsCache[key][restriction.gender] = {}
        end
        
        table.insert(RestrictionsCache[key][restriction.gender], {
            id = tostring(result),
            job = restriction.job,
            gang = restriction.gang,
            gender = restriction.gender,
            type = restriction.type,
            part = restriction.part,
            category = restriction.category,
            itemId = restriction.itemId,
            texturesAll = restriction.texturesAll,
            textures = restriction.textures
        })
        
        return true
    end
    
    return false
end)

-- Delete restriction
lib.callback.register('tj_appearance:admin:deleteRestriction', function(source, id)
    if not IsAdmin(source) then return false end
    
    MySQL.query.await('DELETE FROM appearance_restrictions WHERE id = ?', { tonumber(id) })
    
    -- Update cache - reload entire cache for simplicity
    LoadRestrictionsCache()
    
    return true
end)

-- Command to open admin menu
RegisterCommand('appearanceadmin', function(source)
    print('[tj_appearance] appearanceadmin command called by source: ' .. source)
    
    if not IsAdmin(source) then
        print('[tj_appearance] Access denied for ' .. GetPlayerName(source))
        TriggerClientEvent('QBCore:Notify', source, 'You do not have permission', 'error')
        return
    end
    
    print('[tj_appearance] Opening admin menu for ' .. GetPlayerName(source))
    TriggerClientEvent('tj_appearance:client:openAdminMenu', source)
end, false)
