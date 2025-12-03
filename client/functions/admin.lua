-- ===== Zone Noclip + Raycast Mode =====
local _zoneNoclipActive = false
local _zoneRaycastPoint = nil
local _zoneMoveSpeed = 5.0
local _zoneMultiPointMode = false
local _zoneMultiPoints = {}
local _zoneStartedAt = 0

local function RaycastFromCamera(maxDistance)
  local from = GetFinalRenderedCamCoord()
  local dir = GetFinalRenderedCamRot(2)
  local pitch = math.rad(dir.x)
  local yaw = math.rad(dir.z)
  local forward = vector3(-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch))
  local to = from + forward * (maxDistance or 200.0)
  local ray = StartShapeTestRay(from.x, from.y, from.z, to.x, to.y, to.z, 1, cache.ped, 7)
  local _, hit, hitCoords = GetShapeTestResult(ray)
  if hit == 1 then
    return hitCoords
  end
  return nil
end

local function DrawRayLine(from, to)
  DrawLine(from.x, from.y, from.z, to.x, to.y, to.z, 255, 0, 0, 200)
end

local function DisableContols()
    DisableControlAction(0, 30, true) -- Move Left/Right
    DisableControlAction(0, 31, true) -- Move Up/Down
    DisableControlAction(0, 140, true) -- Melee Attack Light
    DisableControlAction(0, 141, true) -- Melee Attack Heavy
    DisableControlAction(0, 142, true) -- Melee Attack Alternative
    DisableControlAction(0, 24, true) -- Attack
    DisableControlAction(0, 25, true) -- Aim
    DisableControlAction(0, 22, true) -- Jump
    DisableControlAction(0, 23, true) -- Enter Vehicle
    DisableControlAction(0, 75, true) -- Exit Vehicle
    DisableControlAction(0, 45, true) -- Reload
end


-- Freecam controls: move the camera instead of the ped
local function HandleFreecamMovement(cam)
  local camPos = GetFinalRenderedCamCoord()
  local speed = _zoneMoveSpeed


end

local function StartZoneRaycastMode(multiPoint)
  if _zoneNoclipActive then return end
  _zoneNoclipActive = true
  _zoneMultiPointMode = multiPoint or false
  _zoneMultiPoints = {}
  _zoneStartedAt = GetGameTimer()
  
  local cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
  local pedPos = GetEntityCoords(cache.ped)
  SetCamCoord(cam, pedPos.x, pedPos.y, pedPos.z + 1.0)
  SetCamActive(cam, true)
  RenderScriptCams(true, false, 0, true, false)
  SendNUIMessage({ action = 'zoneCaptureActive', active = true })
  CreateThread(function()
    while _zoneNoclipActive do
      HandleFreecamMovement(cam)
      local from = GetFinalRenderedCamCoord()
      local hit = RaycastFromCamera(200.0)
      _zoneRaycastPoint = hit
      if hit then
        DrawRayLine(from, hit)
      end
      DisableControlAction(0, 24, true) -- Disable attack
      DisableControlAction(0, 25, true) -- Disable aim
      
      -- Multi-point mode: E to add point, ESC to finish
      if _zoneMultiPointMode then
        if IsControlJustPressed(0, 38) then -- E key
          if hit then
            table.insert(_zoneMultiPoints, { x = hit.x, y = hit.y })
            lib.notify({ type = 'success', description = ('Point %d added'):format(#_zoneMultiPoints) })
          end
        end
        if IsControlJustPressed(0, 177) then -- Backspace to finish
          StopZoneRaycastMode()
          SendNUIMessage({ action = 'polyzonePointsCaptured', points = _zoneMultiPoints })
          break
        end
      end
      Wait(0)
    end
    -- Disable freecam and restore normal camera
    RenderScriptCams(false, false, 0, true, false)
    DestroyCam(cam, false)
    -- Notify UI capture finished
    SendNUIMessage({ action = 'zoneCaptureActive', active = false })
  end)
end

local function StopZoneRaycastMode()
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
  _zoneMultiPointMode = false
end

RegisterNuiCallback('startZoneRaycast', function(data, cb)
  StartZoneRaycastMode(data.multiPoint)
  SetNuiFocus(false, false)
  cb(true)
end)

RegisterNuiCallback('stopZoneRaycast', function(_, cb)
  -- Ignore external stop requests during multi-point mode; finish via keybind
  if _zoneMultiPointMode then
    cb(false)
    return
  end
  -- Ignore if not active or called too soon
  if not _zoneNoclipActive or (GetGameTimer() - _zoneStartedAt) < 200 then
    cb(false)
    return
  end
  StopZoneRaycastMode()
  SetNuiFocus(true, true)
  cb(true)
end)

RegisterNuiCallback('captureRaycastPoint', function(_, cb)
  local hit = _zoneRaycastPoint
  if hit then
    cb({ x = hit.x, y = hit.y, z = hit.z })
  else
    cb(nil)
  end
end)

-- Resource lifecycle failsafes: ensure noclip is disabled on start/stop
AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
end)

AddEventHandler('onResourceStop', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
end)
