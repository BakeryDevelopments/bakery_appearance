local handleNuiMessage = require('modules.nui')

local activeZones = {}
local activePeds = {}
local activeMarkers = {}

-- Check if ox_target is available
local hasTarget = GetResourceState('ox_target') == 'started'

local function shouldUseTarget()
    local settings = CacheAPI.getAppearanceSettings() or {}
    return hasTarget and (settings.useTarget ~= false)
end

local function getBlipDefaults(zoneType)
    local settings = CacheAPI.getAppearanceSettings() or {}
    if settings.blips and settings.blips[zoneType] then
        return settings.blips[zoneType]
    end
    if Config.Blips and Config.Blips[zoneType] then
        return Config.Blips[zoneType]
    end
    return {}
end

-- Create a ped at zone location
local function createZonePed(zone)
    if not zone.coords then return end

    local coords = zone.coords
    local modelHash = zone.pedModel or (zone.type == 'clothing' and 's_f_y_shop_low' or 's_m_m_hairdress_01')

    -- Load model
    lib.requestModel(modelHash, 10000)

    -- Create ped

    local ped = CreatePed(4, modelHash, coords.x, coords.y, coords.z - 1.0, coords.w or 0.0, false, true)
    SetEntityAsMissionEntity(ped, true, true)
    SetPedFleeAttributes(ped, 0, false)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetEntityInvincible(ped, true)
    FreezeEntityPosition(ped, true)

    activePeds[zone.id] = ped

    -- Setup interaction
    if shouldUseTarget() then
        -- Use ox_target
        exports.ox_target:addLocalEntity(ped, {
            {
                name = 'bakery_appearance_zone_' .. zone.id,
                icon = 'fa-solid fa-shirt',
                label = getZoneLabel(zone),
                onSelect = function()
                    OpenAppearanceMenu(zone)
                end,
                canInteract = function()
                    return hasAccess(zone)
                end
            }
        })
    else
        -- Use marker and key press
        activeMarkers[zone.id] = {
            coords = vector3(coords.x, coords.y, coords.z),
            zone = zone
        }
    end

    return ped
end

-- Create polyzone interaction
local function createPolyZone(zone)
    if not zone.polyzone or #zone.polyzone < 3 then return end

    -- Convert polyzone points to ox_lib format
    local points = {}
    for _, point in ipairs(zone.polyzone) do
        table.insert(points, vec3(point.x, point.y, zone.coords and zone.coords.z or 0.0))
    end

    local canuseradial = shouldUseRadialMenu()
    -- Create polyzone using ox_lib
    local poly = lib.zones.poly({
        name = 'bakery_appearance_zone_' .. zone.id,
        points = points,
        thickness = 10.0,
        debug = Config.Debug,
        onEnter = function()
            if not hasAccess(zone) then return end

            local prompt = canuseradial and getZoneLabel(zone) or '[E] ' .. getZoneLabel(zone)

            if canuseradial then
                addtoradial(zone)
            end

            lib.showTextUI(prompt)
        end,
        onExit = function()
            lib.hideTextUI()

            if canuseradial then
                removefromradial(zone)
            end
        end,
        inside = function()
            if not canuseradial and IsControlJustPressed(0, 38) then -- E key (only if not using radial menu)
                if hasAccess(zone) then
                    lib.hideTextUI()
                    OpenAppearanceMenu(zone)
                end
            end
        end
    })

    activeZones[zone.id] = poly

    Wait(100) -- Small delay to ensure proper setup
end

-- Thread for marker rendering when not using target
CreateThread(function()
    while true do
        local sleep = 1000

        if not shouldUseTarget() then
            local playerCoords = GetEntityCoords(cache.ped)

            for zoneId, marker in pairs(activeMarkers) do
                local distance = #(playerCoords - marker.coords)

                if distance < 10.0 then
                    sleep = 0

                    -- Draw marker
                    DrawMarker(
                        1, -- Cylinder marker
                        marker.coords.x, marker.coords.y, marker.coords.z - 1.0,
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        1.0, 1.0, 1.0,
                        0, 150, 255, 100,
                        false, true, 2, false, nil, nil, false
                    )

                    if distance < 2.0 then
                        local settings = CacheAPI.getAppearanceSettings()
                        local prompt = settings.useRadialMenu and getZoneLabel(marker.zone) or
                        '[E] ' .. getZoneLabel(marker.zone)
                        lib.showTextUI(prompt)

                        if not settings.useRadialMenu and IsControlJustPressed(0, 38) then -- E key (only if not using radial menu)
                            lib.hideTextUI()
                            openAppearanceMenu(marker.zone)
                        end
                    elseif distance >= 2.0 and distance < 3.0 then
                        lib.hideTextUI()
                    end
                end
            end
        end

        Wait(sleep)
    end
end)

-- Initialize all zones
local function initializeZones()
    local zones = CacheAPI.getZones()

    DebugPrint(string.format('[bakery_appearance] Initializing %d zones', #zones))

    for _, zone in ipairs(zones) do
        if zone.enablePed then
            -- Create ped interaction
            createZonePed(zone)
        elseif zone.polyzone and #zone.polyzone > 0 then
            -- Create polyzone interaction
            DebugPrint(string.format('[bakery_appearance] Creating polyzone for zone ID: %s', zone.id))
            createPolyZone(zone)
        elseif zone.coords then
            -- Create point marker interaction (fallback)
            activeMarkers[zone.id] = {
                coords = vector3(zone.coords.x, zone.coords.y, zone.coords.z),
                zone = zone
            }
        end

        -- Create blip if enabled
        if zone.showBlip and zone.coords then
            local blip = AddBlipForCoord(zone.coords.x, zone.coords.y, zone.coords.z)
            local defaults = getBlipDefaults(zone.type)
            local blipSprite = zone.blipSprite or defaults.sprite or 1
            local blipColor = zone.blipColor or defaults.color or 1
            local blipScale = zone.blipScale or defaults.scale or 0.7
            local blipName = zone.blipName or defaults.name or 'Appearance'

            SetBlipSprite(blip, blipSprite)
            SetBlipColour(blip, blipColor)
            SetBlipScale(blip, blipScale)
            SetBlipAsShortRange(blip, true)
            BeginTextCommandSetBlipName("STRING")
            AddTextComponentString(blipName)
            EndTextCommandSetBlipName(blip)

            if not activeZones[zone.id] then
                activeZones[zone.id] = {}
            end
            if type(activeZones[zone.id]) == 'table' then
                activeZones[zone.id].blip = blip
            end
        end
    end
end

-- Cleanup all zones
local function cleanupZones()
    -- Remove polyzones
    for zoneId, zone in pairs(activeZones) do
        if zone.remove then
            zone:remove()
        elseif type(zone) == 'table' and zone.blip then
            RemoveBlip(zone.blip)
        end
    end

    -- Remove peds
    for _, ped in pairs(activePeds) do
        if DoesEntityExist(ped) then
            DeleteEntity(ped)
        end
    end

    -- Clear tables
    activeZones = {}
    activePeds = {}
    activeMarkers = {}
end

-- Update zones when config changes
RegisterNetEvent('bakery_appearance:client:updateZones', function(zones)
    cleanupZones()
    Wait(500)
    initializeZones()
end)

-- Initialize on resource start
CreateThread(function()
    Wait(1000) -- Wait for cache to load
    initializeZones()
end)

-- Cleanup on resource stop
AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    cleanupZones()
end)

return {
    initialize = initializeZones,
    cleanup = cleanupZones
}
