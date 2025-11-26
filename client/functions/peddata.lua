local peddata = {
    components = {
        [0] = "face",
        [1] = "masks",
        [2] = "hair",
        [3] = "torsos",
        [4] = "legs",
        [5] = "bags",
        [6] = "shoes",
        [7] = "neck",
        [8] = "shirts",
        [9] = "vest",
        [10] = "decals",
        [11] = "jackets"
    },
    props = {
        [0] = "hats",
        [1] = "glasses",
        [2] = "earrings",
        [3] = "mouth",
        [4] = "lhand",
        [5] = "rhand",
        [6] = "watches",
        [7] = "bracelets",
    }
}

local function tofloat(num)
    return num + 0.0
end


function GetPedHeritageData(pedHandle)
    -- Native 0x2746bd9d88c5c5d0 gets ped head blend data
    -- Returns: success, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent
    local success, shapeFirst, shapeSecond, shapeThird, skinFirst, skinSecond, skinThird, shapeMix, skinMix, thirdMix, hasParent =
        Citizen.InvokeNative(0x2746bd9d88c5c5d0, pedHandle, Citizen.PointerValueInt(), Citizen.PointerValueInt(),
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

function GetPedComponents(ped)
    local components = {}

    for i = 0, 11 do
        components[peddata.components[i]] = {
            id = peddata.components[i],
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
        propdata[peddata.props[i]] = {
            id = peddata
        }
    end
end

function GetProps(ped)

end

local freemodepeds = {
    [`mp_m_freemode_01`] = true,
    [`mp_f_freemode_01`] = true
}


function IsFreemodePed(ped)
    local model = GetEntityModel(ped)
    if freemodepeds[model] then return true end
    return false
end

function SetPedHeadBlend(ped, headBlend)
    if headBlend and IsFreemodePed(ped) then
        SetPedHeadBlendData(ped, headBlend.shapeFirst, headBlend.shapeSecond, headBlend.shapeThird, headBlend.skinFirst,
            headBlend.skinSecond, headBlend.skinThird, tofloat(headBlend.shapeMix or 0), tofloat(headBlend.skinMix or 0),
            tofloat(headBlend.thirdMix or 0), false)
    end
end

RegisterNuiCallback('setHeadBlend', function(data, cb)
    print('Recieved headblend data', json.encode(data))

    SetPedHeadBlend(cache.ped, data)
end)
