local handleNuiMessage = require('modules.nui')



RegisterCommand('appearance', function()
  local localeFile = LoadResourceFile(GetCurrentResourceName(), "shared/locale/en.json")

  if not localeFile then
    print("^1[ERROR] Could not load locale file!^0")
    return
  end

  local locale = json.decode(localeFile)

  if not locale then
    print("^1[ERROR] Could not decode locale JSON!^0")
    return
  end

  print("^2[SUCCESS] Loaded locale successfully^0")

  -- Get player's current model to determine gender
  local model = GetEntityModel(cache.ped)
  local isMale = model == GetHashKey("mp_m_freemode_01")
  local gender = isMale and 'male' or 'female'
  
  -- Fetch restrictions for this player
  lib.callback('tj_appearance:getPlayerRestrictions', false, function(restrictions)
    local blacklist = { models = {}, drawables = {}, props = {} }
    
    if restrictions and restrictions.legacy then
      local genderData = restrictions.legacy[gender]
      if genderData then
        blacklist = genderData
      end
    end
    
    print('[tj_appearance] Loaded blacklist for ' .. gender .. ':', json.encode(blacklist))

    handleNuiMessage({
      action = 'data',
      data = {
        tabs = { "heritage", 'face', 'hair', 'clothes', 'accessories','makeup', 'tattoos', 'outfits' },
        appearance = GetPlayerAppearance(),
        locale = locale,
        models = {
          { "mp_m_freemode_01" },
          { "mp_f_freemode_01" }
        },
        blacklist = blacklist,
        tattoos = {},
        outfits = {},
        allowExit = true,
        job = { name = "", isBoss = false }
      }
    }, true)

    Wait(1000)
    ToggleCam(true)
    handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
  end)
end, false)

RegisterNuiCallback('save', function(data, cb)

  print('[tj-appearance] Saving appearance data:', json.encode(data))
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)

RegisterNuiCallback('cancel', function(data, cb)
  print('[tj-appearance] Closing appearance menu', json.encode(data))
  handleNuiMessage({ action = 'setVisibleApp', data = false }, false)
  SetNuiFocus(false, false)
  ToggleCam(false)
  cb('ok')
end)




function DebugPrint(msg)
  if Config.Debug then
    print(('[tj-appearance] %s'):format(msg))
  end
end


function GetPlayerAppearance()
  -- Expanded function to get player appearance
  local headData, headTotal = GetHeadOverlay(cache.ped)
  local drawables, drawTotal = GetPedComponents(cache.ped)

  local props, propTotal = GetPedProps(cache.ped)
  local model = GetEntityModel(cache.ped)
  local hairColour = GetHairColour(cache.ped)
  --local tattoos = cache.ped == PlayerPedId() and GetPedTattoos and GetPedTattoos(cache.ped) or {}



  local data = {
    model = model,
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
  print('[tj_appearance] Opening admin menu client side')
  
  lib.callback('tj_appearance:admin:getTheme', false, function(theme)
    print('[tj_appearance] Theme data:', json.encode(theme))
    if theme then
      handleNuiMessage({ action = 'setThemeConfig', data = theme }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getShape', false, function(shape)
    print('[tj_appearance] Shape data:', json.encode(shape))
    if shape then
      handleNuiMessage({ action = 'setShapeConfig', data = shape }, true)
    end
  end)
  
  lib.callback('tj_appearance:admin:getRestrictions', false, function(restrictions)
    print('[tj_appearance] Restrictions count:', #restrictions)
    if restrictions then
      handleNuiMessage({ action = 'setRestrictions', data = restrictions }, true)
    end
  end)
  
  print('[tj_appearance] Setting admin menu visible and focus')
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

-- JSON blacklist management removed per request
