-- ============================================================================
-- Bakery Appearance - Database Migrations
-- ============================================================================
-- Handles migration of appearance data from other scripts
-- ============================================================================

local Database = require('server.database')

local Migrations = {}

-- ============================================================================
-- IL:LENIUM (bl_appearance) Migration
-- ============================================================================
-- Converts old illenium appearance format to bakery_appearance format

local function ConvertIlleniumAppearance(oldData)
    if not oldData then return nil end
    
    local newAppearance = {
        model = oldData.model or 'mp_m_freemode_01',
        drawables = {},
        props = {},
        headBlend = oldData.headBlend or {},
        headStructure = oldData.faceFeatures or {},
        hairColour = {},
        headOverlay = {},
        tattoos = oldData.tattoos or {}
    }
    
    -- Convert components to drawables format
    -- Old format: components = [{drawable, texture, component_id}, ...]
    -- New format: drawables = {[componentId] = {id, index, value, texture}}
    if oldData.components and type(oldData.components) == 'table' then
        for _, component in ipairs(oldData.components) do
            local compId = tostring(component.component_id or 0)
            newAppearance.drawables[compId] = {
                id = compId,
                index = component.component_id or 0,
                value = component.drawable or 0,
                texture = component.texture or 0
            }
        end
    end
    
    -- Convert props to new format
    -- Old format: props = [{drawable, texture, prop_id}, ...]
    -- New format: props = {[propId] = {id, index, value, texture}}
    if oldData.props and type(oldData.props) == 'table' then
        for _, prop in ipairs(oldData.props) do
            local propId = tostring(prop.prop_id or 0)
            newAppearance.props[propId] = {
                id = propId,
                index = prop.prop_id or 0,
                value = prop.drawable or 0,
                texture = prop.texture or 0
            }
        end
    end
    
    -- Convert hair color
    if oldData.hair then
        newAppearance.hairColour = {
            Colour = oldData.hair.color or 0,
            highlight = oldData.hair.highlight or 0
        }
        -- Keep original hair data if needed
        newAppearance.drawables['2'] = newAppearance.drawables['2'] or {
            id = '2',
            index = 2,
            value = oldData.hair.style or 0,
            texture = oldData.hair.texture or 0
        }
    end
    
    -- Convert head overlays
    -- Old format: headOverlays = {blemishes, ageing, sunDamage, lipstick, ...}
    if oldData.headOverlays and type(oldData.headOverlays) == 'table' then
        local overlayNames = {
            'Blemishes', 'Ageing', 'SunDamage', 'Lipstick', 'Blush', 'BodyBlemishes',
            'ChestHair', 'Eyebrows', 'MakeUp', 'Complexion', 'Beard', 'MoleAndFreckles'
        }
        
        for idx, overlayName in ipairs(overlayNames) do
            local overlayIdx = idx - 1
            local overlayValue = oldData.headOverlays[overlayName]
            
            if overlayValue then
                newAppearance.headOverlay[overlayName] = {
                    index = overlayIdx,
                    overlayValue = overlayValue.style or -1,
                    colourType = overlayValue.colourType or 0,
                    firstColour = overlayValue.firstColour or 0,
                    secondColour = overlayValue.secondColour or 0,
                    overlayOpacity = overlayValue.overlayOpacity or 1.0
                }
            end
        end
    end
    
    -- Convert eye color if present
    if oldData.eyeColor and oldData.eyeColor ~= -1 then
        newAppearance.headOverlay['EyeColour'] = {
            index = 14,
            overlayValue = oldData.eyeColor
        }
    end
    
    return newAppearance
end

-- IL:LENIUM Migration Command
RegisterCommand('migrateappearance', function(source)
    if not Framework.HasPermission(source, 'admin') then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Permission Denied',
            description = 'You do not have permission to use this command',
            type = 'error'
        })
        return
    end

    TriggerEvent('bakery_appearance:server:migrateAppearances', source)
end, false)

-- Migration event handler
AddEventHandler('bakery_appearance:server:migrateAppearances', function(source)
    TriggerClientEvent('ox_lib:notify', source, {
        title = 'Migration',
        description = 'Starting appearance migration...',
        type = 'info'
    })
    
    -- Query il:lenium playerskins table
    local response = MySQL.query.await('SELECT * FROM `playerskins` WHERE active = 1 LIMIT 500')
    
    if not response or #response == 0 then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Migration Failed',
            description = 'No appearances found to migrate',
            type = 'error'
        })
        return
    end

    local converted = 0
    local failed = 0
    
    for _, element in ipairs(response) do
        if element.skin then
            local skinData = json.decode(element.skin)
            if skinData then
                local newAppearance = ConvertIlleniumAppearance(skinData)
                
                if newAppearance then
                    local success = Database.SaveAppearance(element.citizenid, newAppearance)
                    
                    if success then
                        converted = converted + 1
                        print(string.format('^2[Bakery Appearance]^7 Migrated appearance for citizen: %s', element.citizenid))
                    else
                        failed = failed + 1
                        print(string.format('^1[Bakery Appearance]^7 Failed to save appearance for citizen: %s', element.citizenid))
                    end
                else
                    failed = failed + 1
                end
            else
                failed = failed + 1
            end
        else
            failed = failed + 1
        end
        Wait(50) -- Small delay between migrations to prevent server overload
    end

    TriggerClientEvent('ox_lib:notify', source, {
        title = 'Migration Complete',
        description = string.format('%d converted, %d failed', converted, failed),
        type = converted > failed and 'success' or 'error'
    })
    print(string.format('^2[Bakery Appearance]^7 Migration complete: %d converted, %d failed', converted, failed))
end)

return Migrations
