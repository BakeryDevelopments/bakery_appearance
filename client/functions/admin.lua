-- ===== Zone Noclip + Raycast Mode =====
local _zoneNoclipActive = false
local _zoneRaycastPoint = nil
local _zoneMoveSpeed = 0.1
local _zoneMultiPointMode = false
local _zoneMultiPoints = {}
local _zoneStartedAt = 0
local _lastPointAddTime = 0
local _pointDebounceDelay = 300 -- milliseconds between point additions
local CacheAPI = require('client.functions.cache')


---@alias ShapetestIgnore
---| 1 GLASS
---| 2 SEE_THROUGH
---| 3 GLASS | SEE_THROUGH
---| 4 NO_COLLISION
---| 7 GLASS | SEE_THROUGH | NO_COLLISION

---@alias ShapetestFlags integer
---| 1 INCLUDE_MOVER
---| 2 INCLUDE_VEHICLE
---| 4 INCLUDE_PED
---| 8 INCLUDE_RAGDOLL
---| 16 INCLUDE_OBJECT
---| 32 INCLUDE_PICKUP
---| 64 INCLUDE_GLASS
---| 128 INCLUDE_RIVER
---| 256 INCLUDE_FOLIAGE
---| 511 INCLUDE_ALL

-- Raycast setup

local _raycastHandle = nil
local _raycastResult = nil

local function TickRaycast()
  local coords, normal = GetWorldCoordFromScreenCoord(0.5, 0.5)
  local destination = coords + normal * 10
  
  -- If no handle exists or last one is complete, start a new raycast
  if not _raycastHandle then
    _raycastHandle = StartShapeTestLosProbe(coords.x, coords.y, coords.z, destination.x, destination.y, destination.z,
      1, cache.ped, 4)
  else
    -- Check if current raycast is complete
    local retval, hit, endCoords, surfaceNormal, materialHash, entityHit = GetShapeTestResultIncludingMaterial(_raycastHandle)
    
    if retval ~= 1 then
      -- Raycast completed, store result and reset for next frame
      _raycastResult = endCoords
      _raycastHandle = nil
    end
  end
  
  return _raycastResult
end

local function DrawRayLine(from)
  local to = from + vector3(0.0, 0.0, 5.0)
  DrawLine(from.x, from.y, from.z, to.x, to.y, to.z, 255, 0, 0, 200)
end

local function DrawPolyZoneVisualization(points)

    -- Draw base polygon (ground level)
    for i = 1, #points do
        local a = points[i]
        local b = points[(i % #points) + 1]

        DrawLine(a.x, a.y, 0.0, b.x, b.y, 0.0, 0, 255, 0, 255) -- bottom edges
    end

    -- Draw top polygon (100 units up)
    for i = 1, #points do
        local a = points[i]
        local b = points[(i % #points) + 1]

        DrawLine(a.x, a.y, 100.0, b.x, b.y, 100.0, 0, 255, 0, 255) -- top edges
    end

    -- Vertical edges
    for i = 1, #points do
        local a = points[i]
        DrawLine(a.x, a.y, 0.0, a.x, a.y, 100.0, 0, 255, 0, 255)
    end

    -- Draw filled polygon sides using DrawPoly correctly
    for i = 1, #points do
        local a = points[i]
        local b = points[(i % #points) + 1]
        
        -- Bottom triangle of side face
        DrawPoly(a.x, a.y, 0.0, b.x, b.y, 0.0, b.x, b.y, 100.0, 0, 255, 0, 100)
        -- Top triangle of side face
        DrawPoly(a.x, a.y, 0.0, b.x, b.y, 100.0, a.x, a.y, 100.0, 0, 255, 0, 100)
    end

    -- Draw filled top and bottom faces
    if #points >= 2 then
        -- Fan triangulation for top face
        for i = 2, #points - 1 do
            DrawPoly(points[1].x, points[1].y, 100.0, 
                     points[i].x, points[i].y, 100.0, 
                     points[i+1].x, points[i+1].y, 100.0, 
                     0, 255, 0, 120)
        end
        
        -- Fan triangulation for bottom face
        for i = 2, #points - 1 do
            DrawPoly(points[1].x, points[1].y, 0.0, 
                     points[i].x, points[i].y, 0.0, 
                     points[i+1].x, points[i+1].y, 0.0, 
                     0, 255, 0, 120)
        end
    end

    -- Point markers
    for _, p in ipairs(points) do
        DrawMarker(28, p.x, p.y, 0.0, 0,0,0, 0,0,0, 0.3, 0.3, 0.3, 0,255,0,120, false, true, 2, false, nil, nil, false)
    end
end

local function DisableControls()
  DisableControlAction(0, 30, true)    -- Move Left/Right
  DisableControlAction(0, 31, true)    -- Move Up/Down
  DisableControlAction(0, 140, true)   -- Melee Attack Light
  DisableControlAction(0, 141, true)   -- Melee Attack Heavy
  DisableControlAction(0, 142, true)   -- Melee Attack Alternative
  DisableControlAction(0, 24, true)    -- Attack
  DisableControlAction(0, 25, true)    -- Aim
  DisableControlAction(0, 22, true)    -- Jump
  DisableControlAction(0, 23, true)    -- Enter Vehicle
  DisableControlAction(0, 75, true)    -- Exit Vehicle
  DisableControlAction(0, 45, true)    -- Reload
end


local function GetCamForwardVector(cam)
  local rot = GetCamRot(cam, 2)
  local pitch = math.rad(rot.x)
  local yaw = math.rad(rot.z)
  local x = -math.sin(yaw) * math.cos(pitch)
  local y = math.cos(yaw) * math.cos(pitch)
  local z = math.sin(pitch)
  return vector3(x, y, z)
end

local function GetCamRightVector(cam)
  local rot = GetCamRot(cam, 2)
  local yaw = math.rad(rot.z)
  local x = math.cos(yaw)
  local y = math.sin(yaw)
  return vector3(x, y, 0.0)
end

-- Freecam controls: move the camera with WASD/Q/Z and rotate with mouse
local function HandleFreecamMovement(cam)
  local camPos = GetFinalRenderedCamCoord()
  local camRot = GetCamRot(cam, 2)
  local speed = _zoneMoveSpeed

  DisableControls()

  -- Movement controls
  if IsControlPressed(0, 32) then -- W - Forward
    camPos = camPos + GetCamForwardVector(cam) * speed
  end

  if IsControlPressed(0, 33) then -- S - Backward
    camPos = camPos - GetCamForwardVector(cam) * speed
  end

  if IsControlPressed(0, 34) then -- A - Strafe Left
    local rightVector = GetCamRightVector(cam)
    camPos = camPos - rightVector * speed
  end

  if IsControlPressed(0, 35) then -- D - Strafe Right
    local rightVector = GetCamRightVector(cam)
    camPos = camPos + rightVector * speed
  end

  if IsControlPressed(0, 44) then -- Q - Up
    camPos = camPos + vector3(0.0, 0.0, speed)
  end

  if IsControlPressed(0, 20) then -- Z - Down
    camPos = camPos - vector3(0.0, 0.0, speed)
  end

  -- Apply position
  SetCamCoord(cam, camPos.x, camPos.y, camPos.z)

  -- Mouse rotation
  local mouseX = GetDisabledControlNormal(0, 1) * 5.0
  local mouseY = GetDisabledControlNormal(0, 2) * 5.0

  camRot = vector3(camRot.x - mouseY, 0.0, camRot.z - mouseX)

  -- Clamp pitch to prevent over-rotation
  if camRot.x > 89.0 then camRot = vector3(89.0, 0.0, camRot.z) end
  if camRot.x < -89.0 then camRot = vector3(-89.0, 0.0, camRot.z) end

  SetCamRot(cam, camRot.x, camRot.y, camRot.z, 2)
end

local function StopZoneRaycastMode()
  lib.hideTextUI()
  SetNuiFocus(true, true)
  _zoneNoclipActive = false
  _zoneRaycastPoint = nil
  _zoneMultiPointMode = false
end

local function StartZoneRaycastMode(multiPoint)
  if _zoneNoclipActive then return end
  _zoneNoclipActive = true
  _zoneMultiPointMode = multiPoint or false
  _zoneMultiPoints = {}
  _zoneStartedAt = GetGameTimer()
  _lastPointAddTime = 0

  local cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
  local pedPos = GetEntityCoords(cache.ped)
  SetCamCoord(cam, pedPos.x, pedPos.y, pedPos.z + 1.0)
  SetCamActive(cam, true)
  RenderScriptCams(true, false, 0, true, true)
  FreezeEntityPosition(cache.ped, true)
  SendNUIMessage({ action = 'zoneCaptureActive', data = { active = true } })
  
  -- Show TextUI instructions
  local locale = CacheAPI.getLocale()
  if _zoneMultiPointMode then
    lib.showTextUI(locale.ZONE_MULTIPOINT_INSTRUCTIONS)
  else
    lib.showTextUI(locale.ZONE_SINGLEPOINT_INSTRUCTIONS)
  end
  CreateThread(function()
    while _zoneNoclipActive do
      HandleFreecamMovement(cam)
      
      -- Tick raycast and get result
      local hit = TickRaycast()
      
      if hit then
        _zoneRaycastPoint = hit
        DrawRayLine(hit)
      end
      
      DisableControlAction(0, 24, true) -- Disable attack
      DisableControlAction(0, 25, true) -- Disable aim

      if _zoneMultiPointMode then
        -- Draw the polyzone visualization with current points
        DrawPolyZoneVisualization(_zoneMultiPoints)
        
        -- Multi-point mode: E to add point, X to remove last, Backspace to finish
        if IsControlJustPressed(0, 38) then -- E key
          local currentTime = GetGameTimer()
          if hit and (currentTime - _lastPointAddTime) > _pointDebounceDelay then
            table.insert(_zoneMultiPoints, { x = hit.x, y = hit.y })
            _lastPointAddTime = currentTime
            local locale = CacheAPI.getLocale()
            lib.notify({ type = 'success', description = locale.ZONE_POINT_ADDED:format(#_zoneMultiPoints) })
          end
        end
        if IsControlJustPressed(0, 73) then -- X key to remove last point
          local locale = CacheAPI.getLocale()
          if #_zoneMultiPoints > 0 then
            table.remove(_zoneMultiPoints, #_zoneMultiPoints)
            lib.notify({ type = 'info', description = locale.ZONE_POINT_REMOVED:format(#_zoneMultiPoints) })
          else
            lib.notify({ type = 'error', description = locale.ZONE_NO_POINTS })
          end
        end
        if IsControlJustPressed(0, 177) then -- Backspace to finish
          StopZoneRaycastMode()
          SendNUIMessage({ action = 'polyzonePointsCaptured', data = { points = _zoneMultiPoints } })
          break
        end
      else
        -- Single-point mode: E to confirm, Backspace to cancel
        if IsControlJustPressed(0, 38) then -- E key
          if hit then
            StopZoneRaycastMode()
            SendNUIMessage({ action = 'singlePointCaptured', data = { coords = { x = hit.x, y = hit.y, z = hit.z } } })
            break
          end
        end
        if IsControlJustPressed(0, 177) then -- Backspace to cancel
          StopZoneRaycastMode()
          break
        end
      end
      Wait(0)
    end
    -- Disable freecam and restore normal camera
    RenderScriptCams(false, false, 0, true, false)
    DestroyCam(cam, false)
    -- Restore player and UI focus
    FreezeEntityPosition(cache.ped, false)
    -- Notify UI capture finished
    SendNUIMessage({ action = 'zoneCaptureActive', data = { active = false } })
  end)
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
