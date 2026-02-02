--Waiting for CacheAPI to be available...
while not CacheAPI.getAppearanceSettings().useRadialMenu == nil do
    Wait(100)
end

local radialMenuEnabled = CacheAPI.getAppearanceSettings().useRadialMenu

local radialscript = nil

local icons = {
    clothing = 'fa-solid fa-shirt',
    barber = 'fa-solid fa-scissors',
    tattoo = 'fa-solid fa-spray-can',
    surgeon = 'fa-solid fa-mask-face',
}

local function detect_radialscript()
    if GetResourceState('ox_lib') == 'started' then
        radialscript = 'ox_lib'
    elseif GetResourceState('qb-radialmenu') == 'started' then
        radialscript = 'qb-radialmenu'
    end
end

detect_radialscript()

function addtoradial(zone)
    if radialscript == 'ox_lib' then
        lib.addRadialItem({
            id = 'appearance_' .. zone.type,
            label = getZoneLabel(zone.type),
            icon = icons[zone.type] or 'question',
            onSelect = function()
                OpenAppearanceMenu({ type = zone.type, shouldcharge = true })
            end,
        })
    elseif radialscript == 'qb-radialmenu' then
        exports['qb-radialmenu']:AddOption('appearance_' .. zone.type, {
            title = getZoneLabel(zone.type),
            icon = icons[zone.type] or 'question',
            event = 'bakery_appearance:client:openAppearanceMenuByType',
            args = { zoneType = zone.type },
        })
    end
end

function removefromradial(zone)
    if radialscript == 'ox_lib' then
        lib.removeRadialItem('appearance_' .. zone.type)
    elseif radialscript == 'qb-radialmenu' then
        exports['qb-radialmenu']:RemoveOption('appearance_' .. zone.type)
    end
end

-- Determine if radial menu should be used
function shouldUseRadialMenu()
    return radialMenuEnabled and radialscript ~= nil
end

-- Open radial menu for appearance zones
