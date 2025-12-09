local handleNuiMessage = require('modules.nui')
local CacheAPI = require('client.functions.cache')

_CurrentTattoos = _CurrentTattoos or {}

-- Initialize cache on resource start
CreateThread(function()
  CacheAPI.init()
end)

RegisterCommand('appearance', function()
  -- Get player's current model to determine gender
  local model = GetEntityModel(cache.ped)
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

  handleNuiMessage({
    action = 'data',
    data = {
      tabs = { "heritage", 'face', 'hair', 'clothes', 'accessories', 'makeup', 'tattoos', 'outfits' },
      appearance = GetPlayerAppearance(),
      models = models,
      blacklist = blacklist,
      tattoos = tattoos,
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

  Wait(100)
  ToggleCam(true)
  handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
end, false)

RegisterNuiCallback('save', function(data, cb)
  if _zoneNoclipActive then
    -- Ignore save while capture mode is active
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  ToggleCam(false)
  cb('ok')
end)

RegisterNuiCallback('cancel', function(data, cb)
  if _zoneNoclipActive then
    cb('ok')
    return
  end
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
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
  local modelString = CacheAPI.getModelHashName(modelHash)


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
    tattoos = _CurrentTattoos or {}
  }

  return data
end

-- Admin Menu
RegisterNetEvent('tj_appearance:client:openAdminMenu', function()
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

RegisterNuiCallback('saveTattoos', function(tattoos, cb)
  lib.callback('tj_appearance:admin:saveTattoos', false, function(success)
    cb(success)
  end, tattoos)
end)

RegisterNetEvent('tj_appearance:client:updateTheme', function(theme)
    handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
end)

RegisterNetEvent('tj_appearance:client:updateRestrictions', function(restrictions)
    handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
end)

RegisterNetEvent('tj_appearance:client:updateZones', function(zones)
    handleNuiMessage({ action = 'setZones', data = zones }, true)
end)

RegisterNetEvent('tj_appearance:client:updateOutfits', function(outfits)
    handleNuiMessage({ action = 'setOutfits', data = outfits }, true)
end)

RegisterNetEvent('tj_appearance:client:updateTattoos', function(tattoos)
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
