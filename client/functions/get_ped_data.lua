local peddata = require('modules.ped')

local freemodepeds = {
    [`mp_m_freemode_01`] = true,
    [`mp_f_freemode_01`] = true
}


function GetPedHeritageData(ped)
    -- Native 0x2746bd9d88c5c5d0 gets ped head blend data
    -- Returns: shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent
    
    -- Check if mask is equipped and maskfix has original data
    local maskDrawable = GetPedDrawableVariation(ped, 1)
    if maskDrawable > 0 then
        local originalData = exports['bakery_appearance']:GetMaskFixOriginalBlendData()
        if originalData then
            return originalData
        end
    end
    
    local shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent =
        Citizen.InvokeNative(0x2746bd9d88c5c5d0, ped, Citizen.PointerValueInt(), Citizen.PointerValueInt(),
            Citizen.PointerValueInt(), Citizen.PointerValueInt(), Citizen.PointerValueInt(), Citizen.PointerValueInt(),
            Citizen.PointerValueFloat(), Citizen.PointerValueFloat(), Citizen.PointerValueFloat(),
            Citizen.PointerValueInt())

    return {
        shapeFirst = shapeFirst,   -- father
        shapeSecond = shapeSecond, -- mother
        shapeThird = shapeThird,

        skinFirst = skinFirst,
        skinSecond = skinSecond,
        skinThird = skinThird,

        shapeMix = shapeMix, -- resemblance
        skinMix = skinMix,   -- skin percent
        thirdMix = thirdMix,

        hasParent = hasParent == 1,
    }
end

function GetHeadStructure(ped)
    if not IsFreemodePed(ped) then return end
    
    -- Check if mask is equipped and maskfix has original data
    local maskDrawable = GetPedDrawableVariation(ped, 1)
    if maskDrawable > 0 then
        local originalFeatures = exports['bakery_appearance']:GetMaskFixOriginalFaceFeatures()
        if originalFeatures then
            return originalFeatures
        end
    end
    
    local features = {}
    for i = 0, 19 do
        features[peddata.FaceFeatures[i]] = {
            id = peddata.FaceFeatures[i],
            index = i,
            value = GetPedFaceFeature(ped, i)
        }
    end

    return features
end

function GetHeadOverlay(ped)
    local overlaydata = {}
    local totals = {}

    for i = 0, 13 do
        local name = peddata.Head[i]
        totals[name] = GetNumHeadOverlayValues(i)

        if name == 'EyeColour' then
            overlaydata[name] = {
                index = i,
                overlayValue = GetPedEyeColor(ped)
            }
        else
            local _, ovalue, colourtype, firstcolour, secondcolour, oopacity = GetPedHeadOverlayData(ped, i)

            overlaydata[name] = {
                index = i,
                overlayValue = ovalue == 255 and -1 or ovalue,
                colourType = colourtype,
                firstColour = firstcolour,
                secondColour = secondcolour,
                overlayOpacity = oopacity
            }
        end
    end
    return overlaydata, totals
end

function GetPedComponents(ped)
    local components = {}
    local total = {}

    local Isfreemode = IsFreemodePed(ped)

    for i = 0, 11 do
        local name = peddata.Drawable[i]
        local current = GetPedDrawableVariation(ped, i)
        local drawableCount = GetNumberOfPedDrawableVariations(ped, i)
        local textureCount = GetNumberOfPedTextureVariations(ped, i, current)

        if Isfreemode then
            drawableCount = drawableCount - 1 -- exclude freemode extra drawable
        end

        -- drawTotal
        total[name] = {
            id = name,
            total = drawableCount,
            index = i,
            textures = textureCount
        }
        -- drawables
        components[name] = {
            id = name,
            index = i,
            value = current,
            texture = GetPedTextureVariation(ped, i)
        }
    end

    return components, total
end

function GetPedProps(ped)
    local props = {}
    local total = {}

    for i = 0, 7 do
        local name = peddata.Props[i]
        local current = GetPedPropIndex(ped, i)
        local textureCount = -1
        if current ~= -1 then
            textureCount = GetNumberOfPedPropTextureVariations(ped, i, current)
        end

        -- propTotal
        total[name] = {
            id = name,
            total = GetNumberOfPedPropDrawableVariations(ped, i),
            index = i,
            textures = textureCount
        }

        -- props
        props[name] = {
            id = name,
            index = i,
            value = current,
            texture = GetPedPropTextureIndex(ped, i)
        }
    end

    return props, total
end

function GetHairColour(ped)
    return {
        Colour = GetPedHairColor(ped),
        highlight = GetPedHairHighlightColor(ped)
    }
end

function GetPedSkin(ped)
    return {
        headBlend = GetPedHeritageData(ped),
        headStructure = GetHeadStructure(ped),
        hairColour = GetHairColour(ped),
        model = GetPedModalHash(ped),
    }
end

function IsFreemodePed(ped)
    local model = GetPedModalHash(ped)
    if freemodepeds[model] then return true end
    return false
end

function GetAppearance(ped)
  -- Expanded function to get player appearance
  local headData, headTotal = GetHeadOverlay(ped)
  local drawables, drawTotal = GetPedComponents(ped)

  local props, propTotal = GetPedProps(ped)
  local modelHash = GetPedModalHash(ped)
  local hairColour = GetHairColour(ped)
  --local tattoos = ped == PlayerPedId() and GetPedTattoos and GetPedTattoos(ped) or {}

  -- Convert model hash to string by checking against available models
  local modelString = CacheAPI.getModelHashName(modelHash)


  local data = {
    model = modelString,
    hairColour = hairColour,
    headBlend = GetPedHeritageData(ped),
    headStructure = GetHeadStructure(ped),
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
