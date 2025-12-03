local handleNuiMessage = require('modules.nui')



RegisterCommand('appearance', function()
  local localeFile = LoadResourceFile(GetCurrentResourceName(), "shared/locale/en.json")

  if not localeFile then
    return
  end

  local locale = json.decode(localeFile)

  if not locale then
    return
  end

  -- Get player's current model to determine gender
  local model = GetEntityModel(cache.ped)
  local isMale = model == GetHashKey("mp_m_freemode_01")
  local gender = isMale and 'male' or 'female'

    lib.callback('tj_appearance:admin:getTheme', false, function(theme)
    if theme then
      handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShape', false, function(shape)
    if shape then
      handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getRestrictions', false, function(restrictions)
    if restrictions then
      handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
    end
  end)
  
  -- Fetch restrictions for this player
  lib.callback('tj_appearance:getPlayerRestrictions', false, function(restrictions)
    local blacklist = { models = {}, drawables = {}, props = {} }
    
    if restrictions and restrictions.legacy then
      local genderData = restrictions.legacy[gender]
      if genderData then
        blacklist = genderData
      end
    end

    local models = lib.callback.await('tj_appearance:admin:getModels', false)
    
    -- Cache models globally for hash-to-string conversion
    _G.cachedModels = models
    
    -- Get locked models from server
    lib.callback('tj_appearance:admin:getSettings', false, function(settings)
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
      
      handleNuiMessage({
        action = 'data',
        data = {
          tabs = { "heritage", 'face', 'hair', 'clothes', 'accessories','makeup', 'tattoos', 'outfits' },
          appearance = GetPlayerAppearance(),
          locale = locale,
          models = models,
          blacklist = blacklist,
          tattoos = {},
          outfits = {},
          allowExit = true,
          job = jobData
        }
      }, true)
      
      -- Send locked models separately
      handleNuiMessage({
        action = 'setLockedModels',
        data = lockedModels
      }, true)
      
      Wait(1000)
      ToggleCam(true)
      handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
    end)
  end)
end, false)

RegisterNuiCallback('save', function(data, cb)
  if _zoneNoclipActive then
    -- Ignore save while capture mode is active
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)

RegisterNuiCallback('cancel', function(data, cb)
  if _zoneNoclipActive then
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)




function GetPlayerAppearance()
  -- Expanded function to get player appearance
  local headData, headTotal = GetHeadOverlay(cache.ped)
  local drawables, drawTotal = GetPedComponents(cache.ped)

  local props, propTotal = GetPedProps(cache.ped)
  local modelHash = GetEntityModel(cache.ped)
  local hairColour = GetHairColour(cache.ped)
  --local tattoos = cache.ped == PlayerPedId() and GetPedTattoos and GetPedTattoos(cache.ped) or {}

  -- Convert model hash to string by checking against available models
  local modelString = modelHash
  
  -- Check common freemode models first
  if modelHash == `mp_m_freemode_01` then
    modelString = "mp_m_freemode_01"
  elseif modelHash == `mp_f_freemode_01` then
    modelString = "mp_f_freemode_01"
  else
    -- For other models, try to find matching hash in models list
    if _G.cachedModels then
      for _, modelName in ipairs(_G.cachedModels) do
        local calculatedHash = joaat(modelName)
        if calculatedHash == modelHash then
          modelString = modelName
          break
        end
      end
    end
  end

  local data = {
    model = modelString,
    hairColour = hairColour,
    headBlend = GetPedHeritageData(cache.ped),
    headStructure = GetHeadStructure(cache.ped),
    headOverlay = headData,
    headOverlayTotal = headTotal,
    drawables = drawables,
    drawTotal = drawTotal,
    props = props,
    propTotal = propTotal,
    tattoos = nil
  }

  return data
end

-- Admin Menu
RegisterNetEvent('tj_appearance:client:openAdminMenu', function()
  lib.callback('tj_appearance:admin:getTheme', false, function(theme)
    if theme then
      handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShape', false, function(shape)
    if shape then
      handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getRestrictions', false, function(restrictions)
    if restrictions then
      handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getModels', false, function(models)
    if models then
      handleNuiMessage({ action = 'setModels', data = models }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getSettings', false, function(settings)
    if settings then
      handleNuiMessage({ action = 'setSettings', data = settings }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShopSettings', false, function(shopSettings)
    if shopSettings then
      handleNuiMessage({ action = 'setShopSettings', data = shopSettings }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShopConfigs', false, function(shopConfigs)
    if shopConfigs then
      handleNuiMessage({ action = 'setShopConfigs', data = shopConfigs }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getZones', false, function(zones)
    if zones then
      handleNuiMessage({ action = 'setZones', data = zones }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getOutfits', false, function(outfits)
    if outfits then
      handleNuiMessage({ action = 'setOutfits', data = outfits }, true)
    end
  end)
  
  handleNuiMessage({ action = 'setVisibleAdminMenu', data = true }, true)
  SetNuiFocus(true, true)
end)

RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
  handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('tj_appearance:client:updateShape', function(shape)
  handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
end)

RegisterNuiCallback('closeAdminMenu', function(data, cb)
  SetNuiFocus(false, false)
  cb('ok')
end)

RegisterNuiCallback('saveTheme', function(theme, cb)
  lib.callback('tj_appearance:admin:saveTheme', false, function(success)
    cb(success)
  end, theme)
end)

RegisterNuiCallback('saveShape', function(shape, cb)
  lib.callback('tj_appearance:admin:saveShape', false, function(success)
    cb(success)
  end, shape)
end)

RegisterNuiCallback('saveSettings', function(settings, cb)
  lib.callback('tj_appearance:admin:saveSettings', false, function(success)
    cb(success)
  end, settings)
end)

RegisterNuiCallback('addRestriction', function(restriction, cb)
  lib.callback('tj_appearance:admin:addRestriction', false, function(success)
    cb(success)
  end, restriction)
end)

RegisterNuiCallback('deleteRestriction', function(id, cb)
  lib.callback('tj_appearance:admin:deleteRestriction', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('addModel', function(modelName, cb)
  lib.callback('tj_appearance:admin:addModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('deleteModel', function(modelName, cb)
  lib.callback('tj_appearance:admin:deleteModel', false, function(success)
    cb(success)
  end, modelName)
end)

RegisterNuiCallback('addLockedModels', function(payload, cb)
  lib.callback('tj_appearance:admin:addLockedModels', false, function(updated)
    cb(updated)
  end, payload)
end)

RegisterNuiCallback('deleteModels', function(modelNames, cb)
  lib.callback('tj_appearance:admin:deleteModels', false, function(success)
    cb(success)
  end, modelNames)
end)

RegisterNuiCallback('saveShopSettings', function(data, cb)
  lib.callback('tj_appearance:admin:saveShopSettings', false, function(success)
    cb(success)
  end, data)
end)

RegisterNuiCallback('addZone', function(zone, cb)
  lib.callback('tj_appearance:admin:addZone', false, function(success)
    cb(success)
  end, zone)
end)

RegisterNuiCallback('updateZone', function(zone, cb)
  lib.callback('tj_appearance:admin:updateZone', false, function(success)
    cb(success)
  end, zone)
end)

RegisterNuiCallback('deleteZone', function(id, cb)
  lib.callback('tj_appearance:admin:deleteZone', false, function(success)
    cb(success)
  end, id)
end)

RegisterNuiCallback('addOutfit', function(outfit, cb)
  lib.callback('tj_appearance:admin:addOutfit', false, function(result)
    cb(result)
  end, outfit)
end)

RegisterNuiCallback('deleteOutfit', function(id, cb)
  lib.callback('tj_appearance:admin:deleteOutfit', false, function(success)
    cb(success)
  end, id)
end)

-- JSON blacklist management removed per request

-- Utility: return player's current coords and heading
RegisterNuiCallback('getPlayerCoords', function(_, cb)
  local ped = cache.ped
  local x, y, z = table.unpack(GetEntityCoords(ped))
  local heading = GetEntityHeading(ped)
  cb({ x = x, y = y, z = z, heading = heading })
end)

