local peddata = require('modules.ped')

function Tofloat(num)
    -- Safely convert input to float; handle nil and non-number values
    if num == nil then
        return 0.0
    end
    local n = tonumber(num)
    if n == nil then
        return 0.0
    end
    return n + 0.0
end

function TableContains(tbl, value)
    for _, v in ipairs(tbl) do
        if v == value then
            return true
        end
    end
    return false
end

-- Format zone label with menu type and price
function getZoneLabel(zoneType)
    local menuType = zoneType or 'clothing'
    local typeNames = {
        clothing = 'Clothing Store',
        barber = 'Barber Shop',
        tattoo = 'Tattoo Parlor',
        surgeon = 'Surgeon',
        outfits = 'Outfits'
    }

    local typeName = typeNames[menuType] or 'Appearance'
    local price = (Config.Prices and Config.Prices[menuType]) or 0

    if price > 0 then
        return string.format('Open %s ($%d)', typeName, price)
    else
        return string.format('Open %s', typeName)
    end
end

-- Helper function to check if player has job/gang access
function hasAccess(zone)
    if not zone.job and not zone.gang then
        return true -- No restrictions
    end

    local playerData = Framework and Framework.GetPlayerData() or nil
    if not playerData then return false end

    if zone.job and playerData.job and playerData.job.name == zone.job then
        return true
    end

    if zone.gang and playerData.gang and playerData.gang.name == zone.gang then
        return true
    end

    return false
end

function countTable(t)
    local count = 0
    for _ in pairs(t) do count = count + 1 end
    return count
end

RegisterNuiCallback('toggleItem', function(info, cb)
    print('[toggleItem] Received:', json.encode(info))
    
    local itemsToApply = {}
    
    -- Check if hookData is empty - if so, it's a prop toggle
    local isEmptyHookData = not info.hookData or (type(info.hookData) == 'table' and #info.hookData == 0)
    
    if isEmptyHookData then
        -- It's a prop (like hats, masks, glasses)
        print('[toggleItem] Detected as prop toggle')
        
        if info.toggle then
            -- Toggling ON: Remove the prop (set to -1)
            if info.data then
                itemsToApply = {
                    {
                        id = info.data.id,
                        index = info.data.index,
                        value = -1,
                        texture = 0
                    }
                }
                print('[toggleItem] Toggling ON (removing prop):', json.encode(itemsToApply))
            end
        else
            -- Toggling OFF: Restore the prop with its current value
            if info.data then
                itemsToApply = { info.data }
                print('[toggleItem] Toggling OFF (restoring prop):', json.encode(itemsToApply))
            end
        end
    else
        -- It's a drawable (like shirts, jackets, pants)
        print('[toggleItem] Detected as drawable toggle')
        
        if info.toggle then
            -- Toggling ON: Remove clothes (apply variant 15 = naked/empty)
            if info.hook and info.hook.drawables then
                itemsToApply = info.hook.drawables
                print('[toggleItem] Toggling ON (removing clothes), applying hook.drawables:', json.encode(itemsToApply))
            end
        else
            -- Toggling OFF: Restore clothes (apply current appearance values)
            itemsToApply = info.hookData or {}
            print('[toggleItem] Toggling OFF (restoring clothes), applying hookData:', json.encode(itemsToApply))
        end
    end
    
    -- Apply each item
    for _, item in ipairs(itemsToApply) do
        -- Get the index/component number
        local componentIndex = item.component or item.index
        
        if componentIndex ~= nil and item.id then
            -- Check peddata to determine if it's a component or prop
            local isComponent = peddata.Components[item.id] ~= nil
            local isProp = peddata.Props[item.id] ~= nil

            print(string.format('[toggleItem] Processing item id=%s at index=%d: isComponent=%s, isProp=%s', 
                item.id, componentIndex, tostring(isComponent), tostring(isProp)))
            
            if isComponent then
                -- It's a drawable (component)
                local value = item.variant or item.value or 0
                local texture = item.texture or 0
                print(string.format('[toggleItem] Setting drawable: component=%d, value=%d, texture=%d (id=%s)', 
                    componentIndex, value, texture, item.id))
                SetPedComponentVariation(cache.ped, componentIndex, value, texture, 0)
            elseif isProp then
                -- It's a prop
                if item.value == -1 then
                    print(string.format('[toggleItem] Clearing prop: index=%d (id=%s)', componentIndex, item.id))
                    ClearPedProp(cache.ped, componentIndex)
                else
                    print(string.format('[toggleItem] Setting prop: index=%d, value=%d, texture=%d (id=%s)', 
                        componentIndex, item.value, item.texture or 0, item.id))
                    SetPedPropIndex(cache.ped, componentIndex, item.value, item.texture or 0, false)
                end
            else
                print(string.format('[toggleItem] Warning: Unknown item type for id=%s', item.id))
            end
        end
    end
    
    cb(info.toggle)
end)
