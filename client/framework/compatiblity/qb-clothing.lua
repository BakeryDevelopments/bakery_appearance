
-- Guard: ensure qb-core is started before loading
if GetResourceState('qb-core') ~= 'started' then
    return
end


RegisterNetEvent("qb-clothing:client:openMenu", function()
    OpenAppearanceMenu({type = 'all', shouldcharge = false})
end)


RegisterNetEvent("qb-clothing:client:openOutfitMenu", function()
    OpenAppearanceMenu({type = 'outfit', shouldcharge = false})
end)


RegisterNetEvent("qb-clothing:client:loadOutfit", function(outfitData)
    -- todo: implement
    print("Load outfit not implemented yet")
end)

RegisterNetEvent("qb-multicharacter:client:chooseChar", function()

    ClearPedDecorations(cache.ped)
end)


RegisterNetEvent("qb-clothes:client:CreateFirstCharacter", function()
    InitialCreation()
end)