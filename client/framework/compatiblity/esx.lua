-- Guard: ensure es_extended is started before loading
if GetResourceState('es_extended') ~= 'started' then
    return
end


local firstSpawn = false
local peddata = require('modules.ped')

local MODELS = {
    MALE = GetHashKey('mp_m_freemode_01'),
    FEMALE = GetHashKey('mp_f_freemode_01')
}

local function buildEntry(id, index, value, texture)
    if value == nil and texture == nil then return nil end
    return { id = id, index = index, value = value, texture = texture }
end

local SkinchangerToAppearance = function(skin)
    local appearance = {}

    appearance.drawables = {}
    local compSpecs = {
        { peddata.Components[1],  1,  skin.mask_1,   skin.mask_2 },   -- masks
        { peddata.Components[2],  2,  skin.hair_1,   skin.hair_2 },   -- hair
        { peddata.Components[3],  3,  skin.arms,     skin.arms_2 },   -- torsos
        { peddata.Components[4],  4,  skin.pants_1,  skin.pants_2 },  -- legs
        { peddata.Components[5],  5,  skin.bags_1,   skin.bags_2 },   -- bags
        { peddata.Components[6],  6,  skin.shoes_1,  skin.shoes_2 },  -- shoes
        { peddata.Components[7],  7,  skin.chain_1,  skin.chain_2 },  -- neck
        { peddata.Components[8],  8,  skin.shirt_1,  skin.shirt_2 },  -- shirts
        { peddata.Components[9],  9,  skin.bproof_1, skin.bproof_2 }, -- vest
        { peddata.Components[10], 10, skin.decals_1, skin.decals_2 }, -- decals
        { peddata.Components[11], 11, skin.torso_1,  skin.torso_2 },  -- jackets
    }
    for _, spec in ipairs(compSpecs) do
        local entry = buildEntry(table.unpack(spec))
        if entry then appearance.drawables[entry.id] = entry end
    end

    appearance.props = {}
    local propSpecs = {
        { peddata.Props[0], 0, skin.helmet_1,    skin.helmet_2 },    -- hats
        { peddata.Props[1], 1, skin.glasses_1,   skin.glasses_2 },   -- glasses
        { peddata.Props[2], 2, skin.ears_1,      skin.ears_2 },      -- earrings
        { peddata.Props[6], 6, skin.watches_1,   skin.watches_2 },   -- watches
        { peddata.Props[7], 7, skin.bracelets_1, skin.bracelets_2 }, -- bracelets
    }
    for _, spec in ipairs(propSpecs) do
        local entry = buildEntry(table.unpack(spec))
        if entry then appearance.props[entry.id] = entry end
    end

    appearance.model = skin.model

    if skin.mom or skin.dad or skin.grandparents then
        appearance.headBlend = {
            shapeFirst = skin.mom,
            shapeSecond = skin.dad,
            shapeThird = skin.grandparents,
            skinFirst = skin.mom,
            skinSecond = skin.dad,
            skinThird = skin.grandparents,
            shapeMix = skin.face_md_weight,
            skinMix = skin.skin_md_weight,
            thirdMix = skin.face_g_weight
        }
    end

    return appearance
end

AddEventHandler("esx_skin:resetFirstSpawn", function()
    firstSpawn = true
end)

AddEventHandler("esx_skin:playerRegistered", function()
    if (firstSpawn) then
        InitialCreation()
    end
end)

AddEventHandler("esx_skin:openSaveableMenu", function()
    InitialCreation()
end)

RegisterNetEvent("skinchanger:getSkin", function(cb)
    lib.callback('bakery_appearance:getAppearance', false, function(appearance)
        cb(appearance)
        Framework.CachePed()
    end)
end)


RegisterNetEvent("skinchanger:loadSkin", function(skin, cb)
    lib.callback('bakery_appearance:getAppearance', false, function(appearance)
        if appearance then
            SetPedAppearance(cache.ped, appearance)
        elseif skin and next(skin) ~= nil then
            if skin.sex then
                SetModel(cache.ped, skin.sex == 1 and MODELS.FEMALE or MODELS.MALE)
            end
            local convertedAppearance = SkinchangerToAppearance(skin)
            SetPedAppearance(cache.ped, convertedAppearance)
            convertedAppearance.menuType = 'all'
            
            lib.callback('bakery_appearance:saveAppearance', false, function(saved)
                DebugPrint(saved and 'Appearance saved successfully.' or 'Failed to save appearance.')
                if cb then cb() end
            end, convertedAppearance)
            return
        else
            print('No skin data provided to skinchanger:loadSkin')
            SetModel(cache.ped, MODELS.MALE)
        end
        Framework.CachePed()
        if cb then cb() end
    end)
end)



AddEventHandler("skinchanger:loadDefaultModel", function(ismale)
    SetModel(cache.ped, ismale and MODELS.MALE or MODELS.FEMALE)
end)





local export = '__cfx_export_skinchanger_'

local SkinchangerExports = {
    { 'GetSkin', function()
        lib.callback('bakery_appearance:getAppearance', false, function(appearance)
            return appearance
        end)
    end },
    { 'LoadSkin', function(data)
        print('Loading skin via export...')
        print(json.encode(data))
    end },
    { 'LoadClothes', function(data)
        print('Loading vlothes via export...')
        print(json.encode(data))
    end },

}


for _, exportInfo in pairs(SkinchangerExports) do
    local exportName, exportFunction = export .. exportInfo[1], exportInfo[2]

    AddEventHandler(exportName, function(setCB)
        setCB(exportFunction)
    end)
end