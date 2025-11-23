local cameraactive, camera, oldcamera = false, nil, nil
local cameraDistance = Config.Camera.Default_Distance
local currentBone = nil
local angleY, angleZ = 0.0, 0.0
local CAM_CONFIG = Config.Camera

function ToggleCam(state)
  if state then
    if cameraactive then return end
    cameraactive = true
    camera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

    local coords = GetPedBoneCoords(cache.ped, 31086, 0.0, 0.0, 0.0)
    SetCamCoord(camera, coords.x, coords.y, coords.z)

    RenderScriptCams(true, true, 1000, true, true)

    cameraDistance = Config.Camera.Body_Distance

    SetCamera('body')
  else
    if not cameraactive then return end
    cameraactive = false
    RenderScriptCams(false, true, 1000, true, true)
    DestroyCam(camera, false)
    camera = nil
  end
end

function SetCamera(cameratype)
  if not cameraactive then return end

  currentBone = cameratype
  local boneIndex = CAM_CONFIG.Bones[cameratype]
  if not boneIndex then return end

  local coords = boneIndex == 0 and GetEntityCoords(cache.ped) or GetPedBoneCoords(cache.ped, boneIndex, 0.0, 0.0, 0.0)
  MoveCamera(coords)
end

function MoveCamera(coords)
  if not cameraactive then return end

  angleZ = GetEntityHeading(cache.ped) + 90
  local angles = GetAngles()

  oldcamera = camera
  camera = CreateCamWithParams(
    "DEFAULT_SCRIPTED_CAMERA",
    coords.x + angles.x,
    coords.y + angles.y,
    coords.z + angles.z,
    0.0,
    0.0,
    angleZ,
    70.0,
    false,
    0
  )

  PointCamAtCoord(camera, coords.x, coords.y, coords.z)
  SetCamActiveWithInterp(camera, oldcamera, 250, 0, 0)

  Wait(250)

  SetCamUseShallowDofMode(camera, true)
  SetCamNearDof(camera, 0.4)
  SetCamFarDof(camera, 1.0)
  SetCamDofStrength(camera, 1.0)
  DestroyCam(oldcamera, true)
end

function SetCamPosition(data)
  if not cameraactive then return end

  if data then
    angleZ = angleZ - data.x
    angleY = angleY + data.y
  end

  local maxangle = currentBone == 'head' and 70.0 or 89.0
  local minangle = currentBone == 'shoes' and 5.0 or -20.0

  angleY = math.min(math.max(angleY, minangle), maxangle)

  local boneIndex = CAM_CONFIG.Bones[currentBone]
  if not boneIndex then return end

  local coords = boneIndex == 0 and GetEntityCoords(cache.ped) or GetPedBoneCoords(cache.ped, boneIndex, 0.0, 0.0, 0.0)
  local angles = GetAngles()

  SetCamCoord(camera, coords.x + angles.x, coords.y + angles.y, coords.z + angles.z)
  PointCamAtCoord(camera, coords.x, coords.y, coords.z)
end

local function Cos(degrees)
  return math.cos(degrees * math.pi / 180)
end

local function Sin(degrees)
  return math.sin(degrees * math.pi / 180)
end

function GetAngles()
  local cosY = Cos(angleY)
  local x = Cos(angleZ) * cosY * cameraDistance
  local y = Sin(angleZ) * cosY * cameraDistance
  local z = Sin(angleY) * cameraDistance

  return vector3(x, y, z)
end

RegisterNuiCallback('scrollWheel', function(direction, cb)
  local maxZoom = currentBone == 'body' and CAM_CONFIG.Body_Distance or CAM_CONFIG.Default_Distance

  if direction == 'in' then
    cameraDistance = math.max(0.2, cameraDistance - 0.05)
  elseif direction == 'out' then
    cameraDistance = math.min(maxZoom, cameraDistance + 0.05)
  end
  SetCamPosition()
  cb('ok')
end)
