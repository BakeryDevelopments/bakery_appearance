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
      tabs = {"heritage"},
      appearance = GetPlayerAppearance(),
      locale = locale,
      models = {
        {"mp_m_freemode_01"},
        { "mp_f_freemode_01"}
      },
      blacklist = {},
      tattoos = {},
      outfits = {},
      allowExit = true,
      job = { name = "", isBoss = false }
    }
  }, true)


  handleNuiMessage({action = 'setVisibleApp', data = true}, true)


  ToggleCam(true)
end, false)

function DebugPrint(msg)
  if Config.Debug then
    print(('[tj-appearance] %s'):format(msg))
  end
end




local function getPlayerInformation(_, cb)
  local info = lib.callback.await('getplayerInformation')
  local identifiers = {}
  for _, identifier in pairs(info.identifiers) do identifiers[identifier:match('([^:]+):')] = identifier:match(':(.+)') end
  cb({ name = info.name, identifiers = identifiers })
end

RegisterNUICallback('getplayerInformation', getPlayerInformation)


function GetPlayerAppearance()
  -- Dummy function to simulate getting player appearance
  return {
    model = GetEntityModel(cache.ped),
    headBlend = GetPedHeritageData(cache.ped),
    components = GetPedComponents(cache.ped),
    props = {},
    tattoos = {}
  }
end
