function SetHeadOverlay(ped, HeadBlendData)
    if HeadBlendData.index == 13 then
        SetPedEyeColor(ped, HeadBlendData.value)
    end

    if HeadBlendData.id == 'hairColour' then
        SetPedHairTint(ped, HeadBlendData.hairColour, HeadBlendData.hairHighlight)
    end

    SetPedHeadOverlay(ped, HeadBlendData.index, HeadBlendData.value, Tofloat(HeadBlendData.overlayOpacity))
    SetPedHeadOverlayColor(ped, HeadBlendData.index, 1, HeadBlendData.firstColor, HeadBlendData.secondColor)
end

exports('SetPedHeadOverlay', SetHeadOverlay);

function SetPedHeadBlend(ped, headBlend)
    if headBlend and IsFreemodePed(ped) then
        SetPedHeadBlendData(ped,
            math.max(0, headBlend.shapeFirst),
            math.max(0, headBlend.shapeSecond),
            math.max(0, headBlend.shapeThird),
            math.max(0, headBlend.skinFirst),
            math.max(0, headBlend.skinSecond),
            math.max(0, headBlend.skinThird),
            Tofloat(headBlend.shapeMix or 0),
            Tofloat(headBlend.skinMix or 0),
            Tofloat(headBlend.thirdMix or 0), false)
    end
end

exports('SetPedHeadBlend', SetPedHeadBlend);

function SetDrawable(ped, Drawdata)
    if not Drawdata then return end

    SetPedComponentVariation(ped, Drawdata.index, Drawdata.value, Drawdata.texture, 0)
    return GetNumberOfPedTextureVariations(ped, Drawdata.index, Drawdata.value)
end

exports('SetPedDrawable', SetDrawable);

function SetProp(ped, Propdata)
    if not Propdata then return end

    if Propdata.value == -1 then
        ClearPedProp(ped, Propdata.index)
        return
    end

    SetPedPropIndex(ped, Propdata.index, Propdata.value, Propdata.Texture, false)

    return GetNumberOfPedPropTextureVariations(ped, Propdata.index, Propdata.value)
end

exports('SetPedProp', SetProp);


function SetModel(ped, Model)
    if not Model then return ped end
    local hash = Model
    if type(hash) == 'string' then hash = joaat(Model) end


    if hash == 0 then hash = `mp_m_freemode_01` end -- fallback

    RequestModel(hash)
    while not HasModelLoaded(hash) do
        Wait(0)
    end

    print('Setting model to ', hash )

    SetPlayerModel(cache.playerId, hash)
    Wait(150)
    SetModelAsNoLongerNeeded(hash)


    if IsFreemodePed(ped) then
        SetPedDefaultComponentVariation(ped)
        -- Check if the model is male or female, then change the face mix based on this.
        if hash == `mp_m_freemode_01` then
            SetPedHeadBlendData(ped, 0, 0, 0, 0, 0, 0, 0, 0, 0, false)
        elseif hash == `mp_f_freemode_01` then
            SetPedHeadBlendData(ped, 45, 21, 0, 20, 15, 0, 0.3, 0.1, 0, false)
        end
    end

    return ped
end

exports('SetPedModel', SetModel);

function SetFaceFeatures(ped, FaceData)
    if not FaceData then return end

    if FaceData.index and FaceData.value then
        -- Single feature
        SetPedFaceFeature(ped, FaceData.index, ToFloat(FaceData.value))
    else
        -- Multiple features
        for _, feature in ipairs(FaceData) do
            SetPedFaceFeature(ped, feature.index, ToFloat(feature.value))
        end
    end
end

exports('SetPedFaceFeature', SetFaceFeatures)
exports('SetPedFaceFeatures', SetFaceFeatures)


--  NUI CALLBACKS --

RegisterNuiCallback('setHeadBlend', function(data, cb)
    SetPedHeadBlend(cache.ped, data)
    cb(1)
end)

RegisterNuiCallback('setHeadOverlay', function(data, cb)
    SetHeadOverlay(cache.pd, data)
    cb(1)
end)

RegisterNuiCallback('setHeadStructure', function(data, cb)
    SetFaceFeatures(cache.ped, data)
    cb(1)
end)


RegisterNuiCallback('setModel', function(data, cb)
    print('Set Model NUI Callback InvokedS')
    local hash = data[1]
    if type(hash) == "string" then data[1] = joaat(hash) end
    local model = SetModel(cache.ped, hash)
    print('Model set to ', model)
    cb(model)
end)



