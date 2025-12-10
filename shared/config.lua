Config = {}

Config.Debug = false

Config.Locale = 'en' -- Available options: 'en', 'es', 'fr', 'de', 'it'

Config.Prices = {
    clothing = 100,
    barber = 50,
    tattoo = 75,
    surgeon = 200
}

Config.Camera = {
    Body_Distance = 2.0, -- Distance of the camera from the player
    Default_Distance = 1.0, -- Default distance for close-up views

    -- this offset is for female peds to better center the head
    Head_Z_Offset = 0.16, -- Vertical offset for head camera position
    
    Bones = {
        whole = 0,
        head = 12844,
        torso = 24818,
        legs = {16335, 46078},
        shoes = {14201, 52301}
    }
}

Config.Tattoo = {
    UseRcore = false,       -- Set to true to use rcore tattoo system
    ChargeEachTattoo = true -- Set to true to charge for each tattoo separately
}

Config.ReloadSkin = {

    command = 'reloadskin',
    cooldown = 10, -- in seconds

    Disable = {
        jail = true,
        cuffed = true,
        dead = true,
        car = true
    }

}

Config.EnablePedsForShops = true -- Enable peds at shop locations
Config.UseTarget = true -- Use ox_target for ped interactions (if false, uses markers)

Config.Blips = {
    clothing = {
        sprite = 73,
        color = 47,
        scale = 0.7,
        name = 'Clothing Store'
    },
    barber = {
        sprite = 71,
        color = 4,
        scale = 0.7,
        name = 'Barber Shop'
    },
    tattoo = {
        sprite = 75,
        color = 48,
        scale = 0.7,
        name = 'Tattoo Parlor'
    },
    surgeon = {
        sprite = 102,
        color = 2,
        scale = 0.7,
        name = 'Plastic Surgeon'
    },
    outfits = {
        sprite = 366,
        color = 3,
        scale = 0.7,
        name = 'Outfits'
    }
}


Config.Tabs = {
    clothing = {'clothes', 'accessories', 'outfits'},
    barber = {'hair', 'makeup'},
    tattoo = {'tattoos'},
    surgeon = {'face', 'body'},
    outfits = {'outfits'}
}