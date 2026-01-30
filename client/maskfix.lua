local cache = GetResourceState('qb-core') == 'started' and exports['qb-core']:GetCoreObject().Functions.GetPlayerData() or {}
local peddata = require('modules.ped')

local savedBlendData = {}
local savedFaceFeatures = {}

-- Get current head blend data
local function getHeadBlendData(ped)
    local tbl = {
        Citizen.InvokeNative(0x2746BD9D88C5C5D0, ped,
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueIntInitialized(0),
            Citizen.PointerValueFloatInitialized(0),
            Citizen.PointerValueFloatInitialized(0),
            Citizen.PointerValueFloatInitialized(0)
        )
    }

    return {
        shapeFirst = tbl[1],
        shapeSecond = tbl[2],
        shapeThird = tbl[3],
        skinFirst = tbl[4],
        skinSecond = tbl[5],
        skinThird = tbl[6],
        shapeMix = tbl[7],
        skinMix = tbl[8],
        thirdMix = tbl[9]
    }
end

-- Restore saved blend data without updating appearance store
local function restoreSavedBlendData(ped)
    if not savedBlendData.shapeFirst then return end
    
    SetPedHeadBlendData(ped,
        savedBlendData.shapeFirst, savedBlendData.shapeSecond, savedBlendData.shapeThird,
        savedBlendData.skinFirst, savedBlendData.skinSecond, savedBlendData.skinThird,
        savedBlendData.shapeMix, savedBlendData.skinMix, savedBlendData.thirdMix,
        false
    )
end

-- Restore saved face features without updating appearance store
local function restoreSavedFaceFeatures(ped)
    if not next(savedFaceFeatures) then return end
    
    for i = 0, 19 do
        if savedFaceFeatures[i] ~= nil then
            SetPedFaceFeature(ped, i, savedFaceFeatures[i])
        end
    end
end

-- Shrink face features to prevent clipping
local function shrinkFaceFeatures(ped)
    repeat Wait(0) until HasPedHeadBlendFinished(ped)
    
    for i = 0, 19 do
        if not savedFaceFeatures[i] then
            savedFaceFeatures[i] = GetPedFaceFeature(ped, i)
        end
        SetPedFaceFeature(ped, i, 0.0)
    end
end

-- Shrink ped head
local function shrinkHead(ped, pedModelHash)
    local isMale = pedModelHash == GetHashKey('mp_m_freemode_01')
    
    SetPedHeadBlendData(ped,
        isMale and 0 or 21, 0, 0,
        savedBlendData.skinFirst, savedBlendData.skinSecond, savedBlendData.skinThird,
        0.0, savedBlendData.skinMix, 0.0,
        false
    )
end

-- Main mask fix logic
local function fixMask(ped, pedModelHash)
    local currentMaskDrawable = GetPedDrawableVariation(ped, 1)
    local currentMaskTexture = GetPedTextureVariation(ped, 1)
    
    -- No mask equipped
    if currentMaskDrawable <= 0 then
        restoreSavedBlendData(ped)
        restoreSavedFaceFeatures(ped)
        savedBlendData = {}
        savedFaceFeatures = {}
        return
    end
    
    local maskHash = GetHashNameForComponent(ped, 1, currentMaskDrawable, currentMaskTexture)
    if maskHash == 0 then return end

    local headBlendData = getHeadBlendData(ped)

    -- Check if mask requires head shrinking
    local requiresShrinkHead = 
        DoesShopPedApparelHaveRestrictionTag(maskHash, `SHRINK_HEAD`, 0) or
        currentMaskDrawable == 108 or -- Skull mask
        currentMaskDrawable == 30     -- Hockey mask

    if requiresShrinkHead then
        if not next(savedBlendData) then 
            savedBlendData = headBlendData 
        end
        shrinkHead(ped, pedModelHash)
    elseif next(savedBlendData) then
        restoreSavedBlendData(ped)
        savedBlendData = {}
    end

    -- Check if mask requires face feature shrinking
    local requiresShrinkFace = 
        not DoesShopPedApparelHaveRestrictionTag(maskHash, `HAT`, 0) and
        not DoesShopPedApparelHaveRestrictionTag(maskHash, `EAR_PIECE`, 0) and
        currentMaskDrawable ~= 11 and   -- Gay super hero
        currentMaskDrawable ~= 114 and  -- Open face headscarf
        currentMaskDrawable ~= 145 and  -- Cluckin Bell chicken
        currentMaskDrawable ~= 148      -- Super hero

    if requiresShrinkFace then
        if not next(savedFaceFeatures) then
            shrinkFaceFeatures(ped)
        end
    elseif next(savedFaceFeatures) then
        restoreSavedFaceFeatures(ped)
        savedFaceFeatures = {}
    end
end

-- Apply mask fix when drawable changes
RegisterNuiCallback('setDrawable', function(data, cb)
    if data.id == 1 or data.id == 'masks' then
        local ped = PlayerPedId()
        local pedModelHash = GetEntityModel(ped)
        
        Wait(100) -- Wait for drawable to apply
        fixMask(ped, pedModelHash)
    end
    
    cb(true)
end)

-- Periodic check in case mask changes via other methods
CreateThread(function()
    while true do
        Wait(500)
        
        local ped = PlayerPedId()
        if DoesEntityExist(ped) then
            local pedModelHash = GetEntityModel(ped)
            if pedModelHash == GetHashKey('mp_m_freemode_01') or pedModelHash == GetHashKey('mp_f_freemode_01') then
                fixMask(ped, pedModelHash)
            end
        end
    end
end)

-- Export original data so get_ped_data.lua can use it instead of modified ped data
exports('GetMaskFixStatus', function()
    return {
        blendDataSaved = next(savedBlendData) ~= nil,
        faceFeaturesSaved = next(savedFaceFeatures) ~= nil
    }
end)

exports('GetMaskFixOriginalBlendData', function()
    if not next(savedBlendData) then return nil end
    return {
        shapeFirst = savedBlendData.shapeFirst,
        shapeSecond = savedBlendData.shapeSecond,
        shapeThird = savedBlendData.shapeThird,
        skinFirst = savedBlendData.skinFirst,
        skinSecond = savedBlendData.skinSecond,
        skinThird = savedBlendData.skinThird,
        shapeMix = savedBlendData.shapeMix,
        skinMix = savedBlendData.skinMix,
        thirdMix = savedBlendData.thirdMix,
        hasParent = false
    }
end)

exports('GetMaskFixOriginalFaceFeatures', function()
    if not next(savedFaceFeatures) then return nil end
    
    local features = {}
    for i = 0, 19 do
        if savedFaceFeatures[i] ~= nil then
            features[peddata.FaceFeatures[i]] = {
                id = peddata.FaceFeatures[i],
                index = i,
                value = savedFaceFeatures[i]
            }
        end
    end
    
    return next(features) and features or nil
end)

exports('ResetMaskFix', function()
    local ped = PlayerPedId()
    restoreSavedBlendData(ped)
    restoreSavedFaceFeatures(ped)
    savedBlendData = {}
    savedFaceFeatures = {}
end)
