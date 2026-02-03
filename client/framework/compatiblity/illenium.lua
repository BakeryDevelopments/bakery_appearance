local export = '__cfx_export_illenium-appearance_'


local Keys = {

    facefeatures = {
        Nose_Width = { "noseWidth", 0 },
        Nose_Peak_Height = { "nosePeakHigh", 1 },
        Nose_Peak_Lenght = { "nosePeakSize", 2 },
        Nose_Bone_Height = { "noseBoneHigh", 3 },
        Nose_Peak_Lowering = { "nosePeakLowering", 4 },
        Nose_Bone_Twist = { "noseBoneTwist", 5 },
        EyeBrown_Height = { "eyeBrownHigh", 6 },
        EyeBrown_Forward = { "eyeBrownForward", 7 },
        Cheeks_Bone_High = { "cheeksBoneHigh", 8 },
        Cheeks_Bone_Width = { "cheeksBoneWidth", 9 },
        Cheeks_Width = { "cheeksWidth", 10 },
        Eyes_Openning = { "eyesOpening", 11 },
        Lips_Thickness = { "lipsThickness", 12 },
        Jaw_Bone_Width = { "jawBoneWidth", 13 },
        Jaw_Bone_Back_Length = { "jawBoneBackSize", 14 },
        Chin_Bone_Lowering = { "chinBoneLowering", 15 },
        Chin_Bone_Length = { "chinBoneLenght", 16 },
        Chin_Bone_Width = { "chinBoneSize", 17 },
        Chin_Hole = { "chinHole", 18 },
        Neck_Thickness = { "neckThickness", 19 },
    },
    HeadOverlays = {
        Blemishes = { "Blemishes", 0 },
        FacialHair = { "Beard", 1 },
        Eyebrows = { "Eyebrows", 2 },
        Ageing = { "Ageing", 3 },
        Makeup = { "Makeup", 4 },
        Blush = { "Blush", 5 },
        Complexion = { "Complexion", 6 },
        SunDamage = { "SunDamage", 7 },
        Lipstick = { "Lipstick", 8 },
        MolesFreckles = { "MolesFreckles", 9 },
        ChestHair = { "ChestHair", 10 },
        BodyBlemishes = { "BodyBlemishes", 11 },
        AddBodyBlemishes = { "AddBodyBlemishes", 12 },
        EyeColour = { "EyeColor", 13 }
    }

}



local ConvertIlleniumTobakery = function(appearance)
    DebugPrint("Converting Illenium Appearance to bakery Appearance")



    appearance.headBlend = {
        shapeFirst = appearance.headBlend?.shapeFirst or 0,
        shapeSecond = appearance.headBlend?.shapeSecond or 0,
        shapeMix = appearance.headBlend?.shapeMix or 0.0,
        skinFirst = appearance.headBlend?.skinFirst or 0,
        skinSecond = appearance.headBlend?.skinSecond or 0,
        skinMix = appearance.headBlend?.skinMix or 0.0,
        thirdMix = appearance.headBlend?.thirdMix or 0.0
    }



    if appearance.headStructure then
        appearance.faceFeatures = {}
        for k, v in pairs(appearance.headStructure or {}) do
            if Keys.facefeatures[k] and type(v) == "number" then
                table.insert(appearance.faceFeatures, {
                    id = Keys.facefeatures[k][2],
                    index = Keys.facefeatures[k][2],
                    value = v
                })
            end
        end
    end

    -- Convert Components
    appearance.drawables = {}
    if appearance.components then
        if appearance.hair then
            appearance.hairColour = {
                primary = appearance.hair.Colour or 0,
                secondary = appearance.hair.highlight or 0
            }
        end

        for _, comp in pairs(appearance.components or {}) do
            appearance.drawables[comp.component_id] = {
                index = comp.component_id,
                value = comp.drawable,
                texture = comp.texture
            }
        end
    end






    return appearance
end

local IlleniumExports     = {
    { 'startPlayerCustomization', function()
        return InitialCreation()
    end },
    { 'getPedModel', function()
        return GetEntityModel(cache.ped)
    end },
    { 'getPedComponents', function(ped)
        local components, _ = GetPedComponents(ped)
        local converted = {}

        for k, v in pairs(components) do
            table.insert(converted, {
                component_id = v.index,
                drawable = v.value,
                texture = v.texture
            })
        end

        return converted
    end },

    { 'getPedProps', function(ped)
        local props, _ = GetPedProps(ped)
        local converted = {}

        for k, v in pairs(props) do
            table.insert(converted, {
                prop_id = v.index,
                drawable = v.value,
                texture = v.texture
            })
        end

        return converted
    end },
    { 'getPedHeadBlend',  GetPedHeritageData },

    { 'getPedFaceFeatures', function(ped)
        local features = GetHeadStructure(ped)
        local converted = {}
        for k, v in pairs(Keys.facefeatures) do
            converted[v] = features and features[k][1]
        end
        return converted
    end },

    { 'getPedHeadOverlays', function(ped)
        local overlay = GetHeadOverlay(ped)
        local converted = {}

        for k, v in pairs(Keys.HeadOverlays) do
            converted[v[1]] = overlay and overlay[k][1]
        end

        return converted
    end },

    { 'getPedHair', function(ped)
        return {
            style = GetPedDrawableVariation(ped, 2),
            color = GetPedHairColor(ped),
            highlight = GetPedHairHighlightColor(ped),
            texture = GetPedTextureVariation(ped, 2)
        }
    end },

    { 'getPedAppearance', GetAppearance },
    { 'setPlayerModel', function(model)
        SetModel(cache.ped, model)
    end },
    { 'setPedHeadBlend', SetPedHeadBlend },
    { 'setPedFaceFeatures', function(ped, features)
        for k, v in pairs(features) do
            if Keys.facefeatures[k] and type(v) == "number" then
                SetPedFaceFeature(ped, Keys.facefeatures[k][2], v)
            end
        end
    end },

    { 'setPedHeadOverlays', function(ped, overlays)
        local converted = {}

        for k, v in pairs(Keys.HeadOverlays) do
            converted[k] = {
                id = k,
                index = v[2],
                overlayValue = overlays[v[1]] and overlays[v[1]].opacity,
                colourType = 1,
                firstColour = overlays[v[1]] and overlays[v[1]].color,
                secondColour = overlays[v[1]] and overlays[v[1]].secondColor,
                overlayOpacity = overlays[v[1]] and overlays[v[1]].opacity
            }
        end
        SetHeadOverlay(ped, converted)
    end },
    { 'setPedHair', function(ped, hair)
        SetPedComponentVariation(ped, 2, hair.style or 0, hair.texture or 0, 0)
        SetPedHairColor(ped, hair.color or 0, hair.highlight or 0)
    end },
    { 'setPedEyeColor', function(ped, color)
        SetPedEyeColor(ped, color)
    end },
    { 'setPedComponent', function(ped, component)
        local convert = {
            index = component.component_id,
            value = component.drawable,
            texture = component.texture
        }
        SetDrawable(ped, convert)
    end },
    { 'setPedComponents', function(ped, components)
        for _, component in pairs(components) do
            local convert = {
                index = component.component_id,
                value = component.drawable,
                texture = component.texture
            }
            SetDrawable(ped, convert)
        end
    end },
    { 'setPedProp', function(ped, prop)
        local convert = {
            index = prop.prop_id,
            value = prop.drawable,
            texture = prop.texture
        }
        SetProp(ped, convert)
    end },
    { 'setPedProps', function(ped, props)
        for _, prop in pairs(props) do
            local convert = {
                index = prop.prop_id,
                value = prop.drawable,
                texture = prop.texture
            }
            SetProp(ped, convert)
        end
    end },
    { 'setPedAppearance', function(ped, appearance)
        local newdata = ConvertIlleniumTobakery(appearance)


        return SetPedAppearance(ped, newdata)
    end },
    { 'setPedTattoos', function(ped, tattoos)
        return ApplyTattoos(ped, tattoos)
    end }


}


for _, exportInfo in pairs(IlleniumExports) do
    local exportName, exportFunction = export .. exportInfo[1], exportInfo[2]

    AddEventHandler(exportName, function(setCB)
        setCB(exportFunction)
    end)
end
