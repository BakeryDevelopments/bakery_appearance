local handleNuiMessage = require('modules.nui')



RegisterCommand('test_nui', function()
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
