local handleNuiMessage = require('modules.nui')



RegisterCommand('test_nui', function()
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
      blacklist = {},
      tattoos = {},
      outfits = {},
      allowExit = true,
      job = { name = "", isBoss = false }
    }
  }, true)


  Wait(1000)
  ToggleCam(true)
  handleNuiMessage({ action = 'setVisibleApp', data = true }, true)
end, false)

function DebugPrint(msg)
  if Config.Debug then
    print(('[tj-appearance] %s'):format(msg))
  end
end


function GetPlayerAppearance()
  -- Expanded function to get player appearance
  local headData, headTotal = GetHeadOverlay(cache.ped)
  local drawables, drawTotal = GetPedComponents(cache.ped)

  print('Drawables: ' .. json.encode(drawables), 'Total: ' .. json.encode(drawTotal))
  local props, propTotal = GetPedProps(cache.ped)
  local model = GetEntityModel(cache.ped)
  local hairColour = GetHairColour(cache.ped)
  --local tattoos = cache.ped == PlayerPedId() and GetPedTattoos and GetPedTattoos(cache.ped) or {}

  print('hairColour: ' .. json.encode(hairColour))

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
