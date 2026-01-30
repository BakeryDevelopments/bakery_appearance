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
    local itemsToApply = {}

    -- Check if hookData is empty - if so, it's a prop toggle
    local isEmptyHookData = not info.hookData or (type(info.hookData) == 'table' and #info.hookData == 0)

    if isEmptyHookData then
        -- It's a prop (like hats, masks, glasses)

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
            end
        else
            -- Toggling OFF: Restore the prop with its current value
            if info.data then
                itemsToApply = { info.data }
            end
        end
    else
        -- It's a drawable (like shirts, jackets, pants)

        if info.toggle then
            -- Toggling ON: Remove clothes (apply variant 15 = naked/empty)
            if info.hook and info.hook.drawables then
                itemsToApply = info.hook.drawables
            end
        else
            -- Toggling OFF: Restore clothes (apply current appearance values)
            itemsToApply = info.hookData or {}
        end
    end

    -- Apply each item
    for _, item in ipairs(itemsToApply) do
        -- Get the index/component number
        local componentIndex = item.component or item.index

        if componentIndex ~= nil and item.id then
            -- Check peddata to determine if it's a component or prop
            local isComponent = peddata.Components[item.component] == item.id or
                peddata.Components[item.index] == item.id
            local isProp = peddata.Props[item.index] == item.id

            if isComponent then
                -- It's a drawable (component)
                local value = item.variant or item.value or 0
                local texture = item.texture or 0
                SetPedComponentVariation(cache.ped, componentIndex, value, texture, 0)
            elseif isProp then
                -- It's a prop
                if item.value == -1 then
                    ClearPedProp(cache.ped, componentIndex)
                else
                    SetPedPropIndex(cache.ped, componentIndex, item.value, item.texture or 0, false)
                end
            else
                DebugPrint(string.format('[toggleItem] Warning: Unknown item type for id=%s', item.id))
            end
        end
    end

    cb(info.toggle)
end)


function DebugPrint(data)
    if Config.Debug then
        print(data)
    end
end

RegisterNuiCallback('teleportToZone', function(info, cb)
    local hasPermission = lib.callback.await('bakery_appearance:admin:isAdmin', false)

    if not hasPermission then
        cb({ success = false, message = 'You do not have permission to use this feature.' })
        return
    end

    SetEntityCoords(cache.ped, info.x, info.y, info.z + 1.0, false, false, false, true)
end)


function InitialCreation()
    local gender = Framework.GetPlayerData().gender

    local isMale = gender == 'Male'

    SetupClothing(isMale)

    
    while IsScreenFadedIn() do
        Wait(100)
    end

    TriggerServerEvent('bakery_appearance:server:SetRoutingBucket')
    OpenAppearanceMenu({ type = 'all' ,shouldcharge = false })
end

function GetPedModalHash(ped)
    return GetEntityModel(ped)
end

exports('InitialCreation', InitialCreation)
