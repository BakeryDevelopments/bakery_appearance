local peddata = require('modules.ped') 

local freemodepeds = {
    [`mp_m_freemode_01`] = true,
    [`mp_f_freemode_01`] = true
}


function GetPedHeritageData(ped)
    -- Native 0x2746bd9d88c5c5d0 gets ped head blend data
    -- Returns: shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent
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

        if name == 'EyeColor' then
            overlaydata[name] = {
                index = i,
                overlayValue = GetPedEyeColor(ped)
            }
        else
            local _, ovalue, colourtype, firstcolour, secondcolour, oopacity = GetPedHeadOverlayData(ped, 1)
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

    for i = 0, 11 do
        components[peddata.Components[i]] = {
            id = peddata.Components[i],
            drawable = GetPedDrawableVariation(ped, i),
            texture = GetPedTextureVariation(ped, i),
            index = i
        }
    end

    return components
end

function GetPedProps(ped)
    local propdata = {}

    for i = 0, 7 do
        propdata[peddata.Props[i]] = {
            id = peddata
        }
    end
end

function GetProps(ped)

end

function IsFreemodePed(ped)
    local model = GetEntityModel(ped)
    if freemodepeds[model] then return true end
    return false
end