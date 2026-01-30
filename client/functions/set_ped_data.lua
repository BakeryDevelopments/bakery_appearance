_CurrentTattoos = _CurrentTattoos or {}

function SetHeadOverlay(ped, HeadBlendData)


    if HeadBlendData.index == 13 then
        SetPedEyeColor(ped, HeadBlendData.overlayValue)
    end

    if HeadBlendData.id == 'hairColour' then
        SetPedHairTint(ped, HeadBlendData.hairColour, HeadBlendData.hairHighlight)
        return -- Hair colour is handled above; skip overlay calls
    end

    local value = HeadBlendData.value or HeadBlendData.overlayValue



    SetPedHeadOverlay(ped, HeadBlendData.index, value, Tofloat(HeadBlendData.overlayOpacity))
    SetPedHeadOverlayColor(ped, HeadBlendData.index, 1, HeadBlendData.firstColour, HeadBlendData.secondColour)
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
    if not Drawdata then 
        DebugPrint('[DEBUG SetDrawable] Drawdata is nil')
        return 
    end

    DebugPrint(string.format('[DEBUG SetDrawable] index=%s, value=%s, texture=%s', Drawdata.index, Drawdata.value, Drawdata.texture))
    
    -- Handle -1 and -2 (no drawable) - just skip, don't set anything
    if Drawdata.value < 0  then
        DebugPrint(string.format('[DEBUG SetDrawable] Skipping index %s (value=%s, no drawable)', Drawdata.index, Drawdata.value))
        Drawdata.value = 0

    end
    
    SetPedComponentVariation(ped, Drawdata.index, Drawdata.value, Drawdata.texture, 0)
    local variations =  GetNumberOfPedTextureVariations(ped, Drawdata.index, Drawdata.value) - 1
    DebugPrint(string.format('[DEBUG SetDrawable] variations returned: %s', variations))
    return variations
end

exports('SetPedDrawable', SetDrawable);

function SetDrawables(ped, Drawdata)
    if type(Drawdata) ~= 'table' then 
        DebugPrint('[DEBUG SetDrawables] Drawdata is not a table')
        return 
    end

    DebugPrint(string.format('[DEBUG SetDrawables] Processing %d drawables', countTable(Drawdata)))
    for key, drawable in pairs(Drawdata) do
        DebugPrint(string.format('[DEBUG SetDrawables] Processing drawable key: %s', key))
        SetDrawable(ped, drawable)
    end
end
exports('SetPedDrawables', SetDrawables);

function SetProp(ped, Propdata)
    if not Propdata then 
        DebugPrint('[DEBUG SetProp] Propdata is nil')
        return 
    end

    DebugPrint(string.format('[DEBUG SetProp] index=%s, value=%s, texture=%s', Propdata.index, Propdata.value, Propdata.texture))
    if Propdata.value == -1 then
        ClearPedProp(ped, Propdata.index)
        return
    end

    SetPedPropIndex(ped, Propdata.index, Propdata.value, Propdata.texture, false)
    local variations = GetNumberOfPedPropTextureVariations(ped, Propdata.index, Propdata.value)
    DebugPrint(string.format('[DEBUG SetProp] variations returned: %s, returning: %s', variations, variations - 1))
    return variations
end

exports('SetPedProp', SetProp);

function SetProps(ped, Propdata)
    if type(Propdata) ~= 'table' then return end

    for _, prop in pairs(Propdata) do
        SetProp(ped, prop)
    end
end
exports('SetPedProps', SetProps);


function SetModel(ped, Model)
    if not Model then return ped end
    local hash = Model
    if type(hash) == 'string' then hash = joaat(Model) end


    if hash == 0 then hash = `mp_m_freemode_01` end -- fallback

    -- Store player position and freeze
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    FreezeEntityPosition(ped, true)

    RequestModel(hash)
    while not HasModelLoaded(hash) do
        Wait(0)
    end

    -- Request collision at current location to prevent falling through map
    RequestCollisionAtCoord(coords.x, coords.y, coords.z)
    while not HasCollisionLoadedAroundEntity(ped) do
        Wait(0)
    end

    if IsPedAPlayer(ped) then
        SetPlayerModel(cache.playerId, hash)
        ped = PlayerPedId()
    else
        SetPlayerModel(ped, hash)
    end

    -- Restore position and unfreeze
    SetEntityCoords(ped, coords.x, coords.y, coords.z, false, false, false, false)
    SetEntityHeading(ped, heading)
    
    -- Additional failsafe: ensure collision is loaded after model change
    RequestCollisionAtCoord(coords.x, coords.y, coords.z)
    Wait(100)
    
    -- Set coords again to ensure proper placement
    SetEntityCoordsNoOffset(ped, coords.x, coords.y, coords.z, false, false, false)
    
    FreezeEntityPosition(ped, false)

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

    return Model
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

function ApplyTattoos(ped, tattoos)
    if not ped then return end

    ClearPedDecorations(ped)
    if not tattoos or type(tattoos) ~= 'table' then return end

    local tattooOptions = CacheAPI and CacheAPI.getTattoos and CacheAPI.getTattoos() or nil
    local isMale = IsPedMale(ped)

    for _, entry in ipairs(tattoos) do
        local tattooData = entry and entry.tattoo
        if tattooData then
            local collection = tattooData.dlc
            if not collection and tattooOptions then
                local zoneIndex = (entry.zoneIndex or 0) + 1
                local dlcIndex = (entry.dlcIndex or 0) + 1
                local zone = tattooOptions[zoneIndex]
                local dlc = zone and zone.dlcs and zone.dlcs[dlcIndex]
                collection = dlc and dlc.label
            end

            local hashString = isMale and (tattooData.hashMale or tattooData.hash) or (tattooData.hashFemale or tattooData.hash)

            if collection and hashString and hashString ~= '' then
                -- Apply tattoo multiple times for opacity effect (0.0 to 1.0)
                local opacity = entry.opacity or 1.0
                local timesToApply = math.max(1, math.floor(opacity * 10))
                
                for _ = 1, timesToApply do
                    AddPedDecorationFromHashes(ped, joaat(collection), joaat(hashString))
                end
            end
        end
    end
end

RegisterNuiCallback('useOutfit', function(outfitData, cb)
  -- Apply outfit (components and props) to the player
  if not outfitData then
    cb({})
    return
  end

  local ped = cache.ped
  
  -- Apply components (clothes)
  if outfitData.components then
    SetDrawables(ped, outfitData.components)
  end
  
  -- Apply props (accessories)
  if outfitData.props then
    SetProps(ped, outfitData.props)
  end
  cb({})
end)



--  NUI CALLBACKS --

RegisterNuiCallback('setHeadBlend', function(data, cb)
    SetPedHeadBlend(cache.ped, data)
    cb(1)
end)

RegisterNuiCallback('setHeadOverlay', function(data, cb)
    SetHeadOverlay(cache.ped, data)
    cb(1)
end)

RegisterNuiCallback('setHeadStructure', function(data, cb)
    SetFaceFeatures(cache.ped, data)
    cb(1)
end)

RegisterNuiCallback('setHeadStructure', function(data, cb)
    SetFaceFeatures(cache.ped, data)
    cb(1)
end)

RegisterNuiCallback('setDrawable', function(data, cb)
    local totalTextures = SetDrawable(cache.ped, data)
    cb(totalTextures)
end)

RegisterNuiCallback('setProp', function(data, cb)
    local totalTextures = SetProp(cache.ped, data)
    cb(totalTextures)
end)

RegisterNuiCallback('setTattoos', function(data, cb)
    _CurrentTattoos = data or {}
    ApplyTattoos(cache.ped, _CurrentTattoos)
    cb(true)
end)

RegisterNuiCallback('getModelTattoos', function(_, cb)
    cb(CacheAPI.getTattoos())
end)

RegisterNuiCallback('setModel', function(data, cb)
    local modelString = data -- Store the original model string
    local model = SetModel(cache.ped, data)
    
    if model then
        Wait(200) -- Give time for model to fully load
        
        -- Get complete fresh appearance data for the new model
        local appearance = GetAppearance(cache.ped)
        
        -- Override the model with the original string instead of hash
        appearance.model = modelString
        
        -- Return the full appearance data to UI
        cb(appearance)
    else
        cb(nil)
    end
end)

-- end NUI CALLBACKS --


-- setting ped data

function SetPedAppearance(ped, data)

            
    if data then
        DebugPrint('Setting ped appearance...')
        -- Handle drawables
        if data.drawables then
            if type(data.drawables) == 'table' then
                SetDrawables(ped, data.drawables)
            end
        end

        -- Handle props
        if data.props then
            if type(data.props) == 'table' then
                SetProps(ped, data.props)
            end
        end

        -- Handle head blend
        if data.headBlend then
            SetPedHeadBlend(ped, data.headBlend)
        end

        -- Handle head overlays (can be array or table)
        if data.headOverlay then
            if type(data.headOverlay) == 'table' then
                -- If it's a table with numeric keys, it's an array
                local isArray = #data.headOverlay > 0
                if isArray then
                    for _, overlay in ipairs(data.headOverlay) do
                        SetHeadOverlay(ped, overlay)
                    end
                else
                    -- If it's a keyed table (like {makeUp: {...}, complexion: {...}})
                    for _, overlay in pairs(data.headOverlay) do
                        if overlay and overlay.id then
                            SetHeadOverlay(ped, overlay)
                        end
                    end
                end
            end
        end

        -- Handle face features
        if data.headStructure or data.faceFeatures then
            local features = data.headStructure or data.faceFeatures
            SetFaceFeatures(ped, features)
        end

        -- Handle hair color
        if data.hairColour then
            SetPedHairTint(ped, data.hairColour.primary or 0, data.hairColour.highlight or 0)
        end

        -- Handle tattoos
        if data.tattoos then
            ApplyTattoos(ped, data.tattoos)
        end
    end
end


function SetupClothing(isMale)
    local ped = cache.ped

    if isMale == nil then
        isMale = IsPedMale(ped)
    end

    local baseclothing = CacheAPI.getAppearanceSettings().initialClothes

    if isMale then
        SetModel(ped, `mp_m_freemode_01`)
        SetPedAppearance(ped, baseclothing.male)
    else
        SetModel(ped, `mp_f_freemode_01`)
        SetPedAppearance(ped, baseclothing.female)
    end



end

exports('SetPedAppearance', SetPedAppearance)
exports('setPedAppearance', SetPedAppearance)

