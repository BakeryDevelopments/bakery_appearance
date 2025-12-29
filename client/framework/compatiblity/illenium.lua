local export = '__cfx_export_illenium-appearance_'

local IlleniumExports  = {
    { 'startPlayerCustomization', InitialCreation },
    { 'getPedModel',              GetPedModalHash },
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
        local Key = {
            Nose_Width = "noseWidth",
            Nose_Peak_Height = "nosePeakHigh",
            Nose_Peak_Lenght = "nosePeakSize",
            Nose_Bone_Height = "noseBoneHigh",
            Nose_Peak_Lowering = "nosePeakLowering",
            Nose_Bone_Twist = "noseBoneTwist",
            EyeBrown_Height = "eyeBrownHigh",
            EyeBrown_Forward = "eyeBrownForward",
            Cheeks_Bone_High = "cheeksBoneHigh",
            Cheeks_Bone_Width = "cheeksBoneWidth",
            Cheeks_Width = "cheeksWidth",
            Eyes_Openning = "eyesOpening",
            Lips_Thickness = "lipsThickness",
            Jaw_Bone_Width = "jawBoneWidth",
            Jaw_Bone_Back_Length = "jawBoneBackSize",
            Chin_Bone_Lowering = "chinBoneLowering",
            Chin_Bone_Length = "chinBoneLenght",
            Chin_Bone_Width = "chinBoneSize",
            Chin_Hole = "chinHole",
            Neck_Thickness = "neckThickness",
        }


        local features = GetHeadStructure(ped)
        local converted = {}
        for k, v in pairs(Key) do
            converted[v] = features and features[k]
        end
        return converted
    end },

    { 'getPedHeadOverlays', function(ped)
        local key = {
            Blemishes = "Blemishes",
            FacialHair = "Beard",
            Eyebrows = "Eyebrows",
            Ageing = "Ageing",
            Makeup = "Makeup",
            Blush = "Blush",
            Complexion = "Complexion",
            SunDamage = "SunDamage",
            Lipstick = "Lipstick",
            MolesFreckles = "MolesFreckles",
            ChestHair = "ChestHair",
            BodyBlemishes = "BodyBlemishes",
            AddBodyBlemishes = "AddBodyBlemishes",
            EyeColour = "EyeColor"
        }

        local overlay = GetHeadOverlay(ped)
        local converted = {}

        for k, v in pairs(key) do
            converted[v] = overlay and overlay[k]
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
        local Key = {
            noseWidth = 0,
            nosePeakHigh = 1,
            nosePeakSize = 2,
            noseBoneHigh = 3,
            nosePeakLowering = 4,
            noseBoneTwist = 5,
            eyeBrownHigh = 6,
            eyeBrownForward = 7,
            cheeksBoneHigh = 8,
            cheeksBoneWidth = 9,
            cheeksWidth = 10,
            eyesOpening = 11,
            lipsThickness = 12,
            jawBoneWidth = 13,
            jawBoneBackSize = 14,
            chinBoneLowering = 15,
            chinBoneLenght = 16,
            chinBoneSize = 17,
            chinHole = 18,
            neckThickness = 19,
        }
        for k, v in pairs(features) do
            if Key[k] and type(v) == "number" then
                SetPedFaceFeature(ped, Key[k], v)
            end
        end
    end },

    { 'setPedHeadOverlays', function(ped, overlays)
        local key = {
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
        local converted = {}

        for k, v in pairs(key) do
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
{'setPedComponents', function(ped, components)
        for _, component in pairs(components) do
            local convert = {
                index = component.component_id,
                value = component.drawable,
                texture = component.texture
            }
            SetDrawable(ped, convert)
        end
    end},
    {'setPedProp', function(ped, prop)
        local convert = {
            index = prop.prop_id,
            value = prop.drawable,
            texture = prop.texture
        }
        SetProp(ped, convert)
    end},
    {'setPedProps', function(ped, props)
        for _, prop in pairs(props) do
            local convert = {
                index = prop.prop_id,
                value = prop.drawable,
                texture = prop.texture
            }
            SetProp(ped, convert)
        end
    end},
    {'setPedAppearance', SetPedAppearance },
    {'setPedTattoos', ApplyTattoos }


}


for _, exportInfo in pairs(IlleniumExports) do
    local exportName, exportFunction = export .. exportInfo[1], exportInfo[2]

    AddEventHandler(exportName, function(setCB)
        setCB(exportFunction)
    end)
end
