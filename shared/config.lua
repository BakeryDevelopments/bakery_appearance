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

Config.Blips = {
    clothing = {
        Sprite = 73,
        Color = 47,
        Scale = 0.7
    },
    barber = {
        Sprite = 71,
        Color = 4,
        Scale = 0.7
    },
    tattoo = {
        Sprite = 75,
        Color = 48,
        Scale = 0.7
    },
    surgeon = {
        Sprite = 102,
        Color = 2,
        Scale = 0.7
    }
}
