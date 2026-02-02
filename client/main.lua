---@diagnostic disable: undefined-global

local handleNuiMessage = require('modules.nui')
require("modules.huddata")

_CurrentTattoos = _CurrentTattoos or {}
_CurrentMenuType = 'clothing' -- Track current menu type for pricing

-- Initialize cache on resource start
CreateThread(function()
  CacheAPI.init()
end)

-- Function to open appearance menu for a player
-- Open appearance menu for zone
function OpenAppearanceMenu(zone)
    if not hasAccess(zone) then
        lib.notify({
            title = 'Access Denied',
            description = 'You do not have access to this location',
            type = 'error'
        })
        return
    end

    local menuType = zone?.type or 'clothing'
    _CurrentMenuType = menuType  -- Set global menu type for save callback
    _CustomPrice = zone?.price  -- Store custom price if set

    -- Get player's current model to determine gender
    local model = GetPedModalHash(cache.ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    -- Get player-specific restrictions from cache
    local restrictions = CacheAPI.getPlayerRestrictions()
    local blacklist = { models = {}, drawables = {}, props = {} }

    if restrictions then
        local genderData = restrictions[gender]
        if genderData then
            blacklist = genderData
        end
    end

    local models = CacheAPI.getModels()
    local tattoos = CacheAPI.getTattoos()
    
    -- Load player's current tattoos from server
    lib.callback('bakery_appearance:getPlayerTattoos', false, function(playerTattoos)
        if playerTattoos then
            _CurrentTattoos = playerTattoos
        end
    end)


      -- Get locked models from cache
  local settings = CacheAPI.getSettings()
  local lockedModels = (settings and settings.lockedModels) or {}

  -- Get player data from framework
  local playerData = Framework and Framework.GetPlayerData() or nil
  local jobData = { name = "", isBoss = false }

  if playerData and playerData.job then
    jobData = {
      name = playerData.job.name,
      isBoss = playerData.job.isBoss
    }
  end


    if Config.Tabs[menuType] and TableContains(Config.Tabs[menuType], 'outfits') then
        lib.callback('bakery_appearance:getOutfits', false, function(outfits)
            handleNuiMessage({
                action = 'data',
                data = {
                    tabs = Config.Tabs[menuType],
                    appearance = GetAppearance(cache.ped),
                    models = models,
                    blacklist = blacklist,
                    tattoos = tattoos,
                    outfits = outfits or {},
                    allowExit = true,
                    job = jobData
                }
            }, true)


        end)
    else
        -- do other stuff

                    handleNuiMessage({
                action = 'data',
                data = {
                    tabs = Config.Tabs[menuType],
                    appearance = GetAppearance(cache.ped),
                    models = models,
                    blacklist = blacklist,
                    tattoos = tattoos,
                    allowExit = true,
                    job = jobData
                }
            }, true)

            -- Send locked models separately
            handleNuiMessage({
                action = 'setLockedModels',
                data = lockedModels
            }, true)
    end

                -- Send locked models separately
            handleNuiMessage({
                action = 'setLockedModels',
                data = lockedModels
            }, true)

            Wait(100)
            ToggleCam(true)
            handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
    HudToggle(true)  -- Hide HUD when menu is open
end

-- Listen for server event to open appearance menu
RegisterNetEvent('bakery_appearance:client:openAppearanceMenu', function()
  OpenAppearanceMenu({type = 'all'})
end)

-- Listen for server event to open appearance menu
RegisterNetEvent('bakery_appearance:client:openAppearanceMenuByType', function(zoneType)
  OpenAppearanceMenu({type = zoneType, shouldcharge = true})
end)

RegisterNuiCallback('save', function(data, cb)

  -- Store current appearance before saving (in case we need to revert)
  local beforeAppearance = GetAppearance(cache.ped)
  
  -- Get current appearance and save to database
  local appearance = GetAppearance(cache.ped)
  appearance.menuType = _CurrentMenuType or 'clothing'  -- Include menu type for pricing
  appearance.customPrice = _CustomPrice  -- Include custom price if set
  
  lib.callback('bakery_appearance:saveAppearance', false, function(success)
    if success then
      DebugPrint('[bakery_appearance] Appearance saved successfully')
      handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
      ToggleCam(false)
      cb('ok')
    else
      -- Save failed (likely due to insufficient funds), revert appearance
      DebugPrint('[bakery_appearance] Save failed, reverting appearance')
      
      -- Revert to previous appearance
      if beforeAppearance and beforeAppearance.model then
        local ped = cache.ped
        
        -- Restore model if changed
        if beforeAppearance.model ~= appearance.model then
          local modelHash = GetHashKey(beforeAppearance.model)
          lib.requestModel(modelHash, 1000)
          SetPlayerModel(PlayerId(), modelHash)
          SetModelAsNoLongerNeeded(modelHash)
        end
        
        -- Restore appearance components
        if beforeAppearance.drawables then
          for key, drawable in pairs(beforeAppearance.drawables) do
            if drawable.drawable >= 0 and drawable.texture >= 0 then
              SetPedComponentVariation(ped, tonumber(key), drawable.drawable, drawable.texture, 0)
            end
          end
        end
        
        -- Restore props
        if beforeAppearance.props then
          for key, prop in pairs(beforeAppearance.props) do
            if prop.drawable >= 0 and prop.texture >= 0 then
              SetPedPropIndex(ped, tonumber(key), prop.drawable, prop.texture, true)
            end
          end
        end
        
        -- Restore head blend (heritage)
        if beforeAppearance.headBlend then
          SetPedHeadBlend(ped, beforeAppearance.headBlend)
        end
      end
      
      handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
      ToggleCam(false)
      cb('ok')
    end
  end, appearance)
  HudToggle(false)  -- Show HUD when menu is closed
end)

RegisterNuiCallback('saveOutfit', function(outfitData, cb)
  -- outfitData contains: { label, outfit, job }
  -- job is optional and indicates if this is a job/gang outfit (admin only)
  lib.callback('bakery_appearance:saveOutfit', false, function(success)
    if success then
      DebugPrint('[bakery_appearance] Outfit saved successfully')
      
      -- Fetch updated outfits list
      lib.callback('bakery_appearance:getOutfits', false, function(outfits)
        cb({ 
          success = true,
          outfits = outfits 
        })
      end)
    else
      DebugPrint('[bakery_appearance] Failed to save outfit')
      cb({ success = false, error = 'Failed to save outfit' })
    end
  end, outfitData)
end)

RegisterNuiCallback('renameOutfit', function(data, cb)
  local outfitId = data.id
  local newLabel = data.label
  
  lib.callback('bakery_appearance:renameOutfit', false, function(success)
    if success then
      -- Fetch updated outfits list
      lib.callback('bakery_appearance:getOutfits', false, function(outfits)
        cb({ 
          outfits = outfits 
        })
      end)
    else
      cb({})
    end
  end, { id = outfitId, label = newLabel })
end)

RegisterNuiCallback('getOutfitShareCode', function(data, cb)
  local outfitId = data.id
  
  lib.callback('bakery_appearance:getOutfitShareCode', false, function(shareCode)
    cb({ shareCode = shareCode })
  end, outfitId)
end)

RegisterNuiCallback('importOutfitByCode', function(data, cb)
  lib.callback('bakery_appearance:importOutfitByCode', false, function(success)
    if success then
      -- Fetch updated outfits list
      lib.callback('bakery_appearance:getOutfits', false, function(outfits)
        cb({ 
          success = true,
          outfits = outfits 
        })
      end)
    else
      cb({ success = false })
    end
  end, data)
end)

RegisterNuiCallback('deleteOutfitPlayer', function(data, cb)
  lib.callback('bakery_appearance:deleteOutfit', false, function(success)
    if success then
      -- Fetch updated outfits list
      lib.callback('bakery_appearance:getOutfits', false, function(outfits)
        cb({ 
          outfits = outfits 
        })
      end)
    else
      cb({})
    end
  end, data)
end)

RegisterNuiCallback('cancel', function(data, cb)
  -- Check if data is different from current appearance
  local currentAppearance = GetAppearance(cache.ped)
  local ped = cache.ped
  
  -- Compare data with current appearance
  if data and type(data) == 'table' then
    -- Quick comparison of key fields

      -- Restore model if changed
      if data.model ~= currentAppearance.model then
        SetModel(ped, data.model)
        Wait(100) -- Wait for model to load
      end
      
      -- Restore head blend (heritage)
      if data.headBlend then
        SetPedHeadBlend(ped, data.headBlend)
      end
      
      -- Restore head structure (face features)
      if data.headStructure then
        SetFaceFeatures(ped, data.headStructure)
      end
      
      -- Restore head overlays (makeup, facial hair, etc.)
      if data.headOverlay then
        for overlayName, overlayData in pairs(data.headOverlay) do
          SetHeadOverlay(ped, overlayData)
        end
      end
      
      -- Restore hair color
      if data.hairColour then
        SetPedHairColor(ped, data.hairColour.primary or 0, data.hairColour.highlight or 0)
      end
      
      -- Restore drawables (clothing)
      if data.drawables then
        for drawableName, drawableData in pairs(data.drawables) do
          SetDrawable(ped, drawableData)
        end
      end
      
      -- Restore props (accessories)
      if data.props then
        for propName, propData in pairs(data.props) do
          SetProp(ped, propData)
        end
      end
      
      -- Restore tattoos
      if data.tattoos then
        _CurrentTattoos = data.tattoos
        -- ApplyTattoos function is local in set_ped_data.lua, so use the NUI callback
        handleNuiMessage({ action = 'setTattoos', data = data.tattoos }, false)
      end
    end
  
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  ToggleCam(false)
  HudToggle(false)  -- Show HUD when menu is closed
  cb('ok')
end)

-- Admin Menu
RegisterNetEvent('bakery_appearance:client:openAdminMenu', function()
  -- Load all data from cache instead of server callback

  handleNuiMessage({ action = 'setVisibleAdminMenu', data = true }, true)
  
  -- Send all cache data to admin menu
  Wait(50)
  handleNuiMessage({ action = 'setThemeConfig', data = CacheAPI.getTheme() }, true)
  handleNuiMessage({ action = 'setRestrictions', data = CacheAPI.getRestrictions() }, true)
  handleNuiMessage({ action = 'setModels', data = CacheAPI.getModels() }, true)
  handleNuiMessage({ action = 'setLockedModels', data = CacheAPI.getBlacklistSettings().lockedModels or {} }, true)
  handleNuiMessage({ action = 'setZones', data = CacheAPI.getZones() }, true)
  handleNuiMessage({ action = 'setOutfits', data = CacheAPI.getOutfits() }, true)
  handleNuiMessage({ action = 'setShopSettings', data = CacheAPI.getShopSettings() }, true)
  handleNuiMessage({ action = 'setShopConfigs', data = CacheAPI.getShopConfigs() }, true)
  handleNuiMessage({ action = 'setTattoos', data = CacheAPI.getTattoos() }, true)
  handleNuiMessage({ action = 'setAppearanceSettings', data = CacheAPI.getAppearanceSettings() }, true)
end)

RegisterNuiCallback('closeAdminMenu', function(data, cb)
  SetNuiFocus(false, false)
  cb('ok')
end)

RegisterNuiCallback('saveTheme', function(theme, cb)
  lib.callback('bakery_appearance:admin:saveTheme', false, function(success)
    cb(success)
  end, theme)
end)

RegisterNuiCallback('saveSettings', function(settings, cb)
  lib.callback('bakery_appearance:admin:saveSettings', false, function(success)
    cb(success)
  end, settings)
end)

RegisterNuiCallback('saveAppearanceSettings', function(settings, cb)
  lib.callback('bakery_appearance:admin:saveAppearanceSettings', false, function(success)
    cb(success)
  end, settings)
end)

RegisterNuiCallback('addRestriction', function(restriction, cb)
  lib.callback('bakery_appearance:admin:addRestriction', false, function(success)
    cb(success)
  end, restriction)
end)

RegisterNuiCallback('getPlayerInfo', function(identifier, cb)
  lib.callback('bakery_appearance:admin:getPlayerInfo', false, function(playerInfo)
    cb(playerInfo)
  end, identifier)
end)

RegisterNuiCallback('deleteRestriction', function(id, cb)
  lib.callback('bakery_appearance:admin:deleteRestriction', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('addModel', function(modelName, cb)
  lib.callback('bakery_appearance:admin:addModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('deleteModel', function(modelName, cb)
  lib.callback('bakery_appearance:admin:deleteModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('addLockedModels', function(payload, cb)
  lib.callback('bakery_appearance:admin:addLockedModels', false, function(updated)
    cb(updated)
  end, payload)
end)

RegisterNuiCallback('deleteModels', function(modelNames, cb)
  lib.callback('bakery_appearance:admin:deleteModels', false, function(success)
    cb(success)
  end, modelNames)
end)

RegisterNuiCallback('saveShopSettings', function(data, cb)
  lib.callback('bakery_appearance:admin:saveShopSettings', false, function(success)
    cb(success)
  end, data)
end)

RegisterNuiCallback('addZone', function(zone, cb)
  lib.callback('bakery_appearance:admin:addZone', false, function(success)
    -- Server will broadcast the updated zones list via event
    -- No need to update cache here as the event handler will do it
    cb(success)
  end, zone)
end)

RegisterNuiCallback('updateZone', function(zone, cb)
  lib.callback('bakery_appearance:admin:updateZone', false, function(success)
    -- Server will broadcast the updated zones list via event
    -- No need to update cache here as the event handler will do it
    cb(success)
  end, zone)
end)

RegisterNuiCallback('deleteZone', function(id, cb)
  lib.callback('bakery_appearance:admin:deleteZone', false, function(success)
    -- Server will broadcast the updated zones list via event
    -- No need to update cache here as the event handler will do it
    cb(success)
  end, id)
end)

RegisterNuiCallback('addOutfit', function(outfit, cb)
  lib.callback('bakery_appearance:admin:addOutfit', false, function(result)
    cb(result)
  end, outfit)
end)

RegisterNuiCallback('deleteOutfit', function(id, cb)
  lib.callback('bakery_appearance:admin:deleteOutfit', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('saveTattoos', function(tattoos, cb)
  lib.callback('bakery_appearance:admin:saveTattoos', false, function(success)
    cb(success)
  end, tattoos)
end)

RegisterNetEvent('bakery_appearance:client:updateTheme', function(theme)
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateRestrictions', function(restrictions)
    -- Update cache with nested structure
    CacheAPI.updateCache('restrictions', restrictions)
    
    -- Flatten for NUI
    local flattened = {}
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
    
    handleNuiMessage({ action = 'setRestrictions', data = flattened }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateZones', function(zones)
    CacheAPI.updateCache('zones', zones)
    handleNuiMessage({ action = 'setZones', data = zones }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateOutfits', function(outfits)
    CacheAPI.updateCache('outfits', outfits)
    handleNuiMessage({ action = 'setOutfits', data = outfits }, true)
end)

RegisterNetEvent('bakery_appearance:client:updateTattoos', function(tattoos)
    CacheAPI.updateCache('tattoos', tattoos)
    handleNuiMessage({ action = 'setTattoos', data = tattoos }, true)
end)

-- JSON blacklist management removed per request

-- Utility: return player's current coords and heading
RegisterNuiCallback('getPlayerCoords', function(_, cb)
  local ped = cache.ped
  local x, y, z = table.unpack(GetEntityCoords(ped))
  local heading = GetEntityHeading(ped)
  cb({ x = x, y = y, z = z, heading = heading })
end)

-- Get current player appearance data (components and props only)
RegisterNuiCallback('getAppearanceData', function(_, cb)
  local ped = cache.ped
  
  -- Get components and props (ignoring the totals return value)
  local components = GetPedComponents(ped)
  local props = GetPedProps(ped)
  
  -- Filter out face, and hair from components
  local filteredComponents = {}
  for key, value in pairs(components) do
    if key ~= 'face' and key ~= 'hair' then
      filteredComponents[key] = value
    end
  end
  
  cb({
    components = filteredComponents,
    props = props,
  })
end)

-- Reload skin command with cooldown
local lastReloadTime = 0

RegisterCommand(Config.ReloadSkin.command, function()
  local currentTime = GetGameTimer()
  local timeSinceLastReload = (currentTime - lastReloadTime) / 1000 -- Convert to seconds
  
  -- Check cooldown
  if timeSinceLastReload < Config.ReloadSkin.cooldown then
    local timeRemaining = math.ceil(Config.ReloadSkin.cooldown - timeSinceLastReload)
    lib.notify({
      title = 'Cooldown Active',
      description = string.format('Please wait %d seconds before reloading your skin again', timeRemaining),
      type = 'error'
    })
    return
  end
  
  -- Check disable conditions
  local ped = cache.ped
  
  if Config.ReloadSkin.Disable.dead and IsEntityDead(ped) then
    lib.notify({
      title = 'Cannot Reload',
      description = 'You cannot reload your skin while dead',
      type = 'error'
    })
    return
  end
  
  if Config.ReloadSkin.Disable.car and IsPedInAnyVehicle(ped, false) then
    lib.notify({
      title = 'Cannot Reload',
      description = 'You cannot reload your skin while in a vehicle',
      type = 'error'
    })
    return
  end
  
  if Config.ReloadSkin.Disable.cuffed and IsPedCuffed(ped) then
    lib.notify({
      title = 'Cannot Reload',
      description = 'You cannot reload your skin while cuffed',
      type = 'error'
    })
    return
  end
  
  -- Fetch and apply saved appearance
  lib.callback('bakery_appearance:getAppearance', false, function(appearance)
    if appearance then
      -- Apply the appearance
      SetPedAppearance(ped, appearance)
      
      -- Apply tattoos if they exist
      if appearance.tattoos then
        _CurrentTattoos = appearance.tattoos
        ApplyTattoos(ped, appearance.tattoos)
      end
      
      -- Update last reload time
      lastReloadTime = GetGameTimer()
      
      lib.notify({
        title = 'Success',
        description = 'Your appearance has been reloaded',
        type = 'success'
      })
    else
      lib.notify({
        title = 'Error',
        description = 'Failed to load your saved appearance',
        type = 'error'
      })
    end
  end)
end, false)
