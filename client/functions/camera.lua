local cameraactive, camera, oldcamera = false, nil, nil
local cameraDistance = Config.Camera.Default_Distance
local currentBone = nil
local angleY, angleZ = 0.0, 0.0
local CAM_CONFIG = Config.Camera

-- Resolve a bone entry to world coordinates. Supports:
--  - number 0: entity center
--  - single bone id (number)
--  - array/table of bone ids: returns midpoint between first two bones
--  - applies a small Z offset when boneKey == 'head' to frame slightly higher
local function GetSectionCoords(entry, boneKey)

  local model = GetPedModalHash(cache.ped)
  local isMale = model == GetHashKey("mp_m_freemode_01")
  local zOffset = not isMale and Config.Camera.Head_Z_Offset or 0.00

  if entry == 0 then
    local pos = GetEntityCoords(cache.ped)
    if boneKey == 'head' then
      return vector3(pos.x, pos.y, pos.z + zOffset)
    end
    return pos
  end

  if type(entry) == 'number' then
    local pos = GetPedBoneCoords(cache.ped, entry, 0.0, 0.0, 0.0)
    if boneKey == 'head' then
      return vector3(pos.x, pos.y, pos.z + zOffset)
    end
    return pos
  end

  if type(entry) == 'table' then
    local a = entry[1]
    local b = entry[2]
    if type(a) == 'number' and type(b) == 'number' then
      local ca = GetPedBoneCoords(cache.ped, a, 0.0, 0.0, 0.0)
      local cb = GetPedBoneCoords(cache.ped, b, 0.0, 0.0, 0.0)
      -- midpoint
      local pos = vector3((ca.x + cb.x) * 0.5, (ca.y + cb.y) * 0.5, (ca.z + cb.z) * 0.5)
      if boneKey == 'head' then
        return vector3(pos.x, pos.y, pos.z + zOffset)
      end
      return pos
    elseif type(a) == 'number' then
      local pos = GetPedBoneCoords(cache.ped, a, 0.0, 0.0, 0.0)
      if boneKey == 'head' then
        return vector3(pos.x, pos.y, pos.z + zOffset)
      end
      return pos
    end
  end

  -- fallback to entity coords
  local pos = GetEntityCoords(cache.ped)
  if boneKey == 'head' then
    return vector3(pos.x, pos.y, pos.z + zOffset)
  end
  return pos
end

function ToggleCam(state)
  if state then
    if cameraactive then return end
    cameraactive = true
    camera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

    local coords = GetPedBoneCoords(cache.ped, 31086, 0.0, 0.0, 0.0)
    SetCamCoord(camera, coords.x, coords.y, coords.z)

    RenderScriptCams(true, true, 1000, true, true)

    cameraDistance = Config.Camera.Body_Distance

    SetCamera('whole')
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
  local boneEntry = CAM_CONFIG.Bones[cameratype]

  if cameratype == 'whole' then
    cameraDistance = Config.Camera.Body_Distance
  else
    cameraDistance = Config.Camera.Default_Distance
  end

  if boneEntry == nil then return end

  local coords = GetSectionCoords(boneEntry, cameratype)
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

  local coords = GetSectionCoords(boneIndex, currentBone)
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
  local maxZoom = currentBone == 'whole' and CAM_CONFIG.Body_Distance or CAM_CONFIG.Default_Distance

  local cache = cameraDistance

  if direction == 'in' then
    cameraDistance = math.max(0.3, cameraDistance - 0.05)
  elseif direction == 'out' then
    cameraDistance = math.min(maxZoom, cameraDistance + 0.05)
  end

  if cache == cameraDistance then
    cb('ok')
    return
  end
  SetCamPosition()
  cb('ok')
end)

-- Move camera by mouse drag deltas { x, y }
RegisterNuiCallback('camMove', function(data, cb)
  if type(data) == 'table' and data.x and data.y then
    SetCamPosition({ x = data.x, y = data.y })
  end
  cb('ok')
end)

-- Change camera section: 'whole' | 'head' | 'torso' | 'legs' | 'shoes'
RegisterNuiCallback('camSection', function(section, cb)
  if type(section) == 'string' then
    SetCamera(section)
  end
  cb('ok')
end)
