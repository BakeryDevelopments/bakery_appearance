Config = {}

Config.Debug = false

Config.Locale = 'en' -- Available options: 'en', 'es', 'fr', 'de', 'it'

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


Config.Disable = {
    Components = {
        face = false, -- Disable face section completely
        masks = false,
        hair = false,
        torsos = false,
        legs = false,
        bags = false,
        shoes = false,
        neck = false,
        shirts = false,
        vest = false,
        decals = false,
        jackets = false
    },
    Props = {
        hats = false,
        glasses = false,
        earrings = false,
        mouth = false,
        lhand = false,
        rhand = false,
        watches = false,
        bracelets = false
    },
    Tattoos = false -- Disable tattoo section completely
}

Config.Tabs = {
    all = {"heritage", 'face', 'hair', 'clothes', 'accessories', 'makeup', 'tattoos', 'outfits'},
    clothing = {'clothes', 'accessories', 'outfits'},
    barber = {'hair', 'makeup'},
    tattoo = {'tattoos'},
    surgeon = {'face', 'body'},
    outfits = {'outfits'}
}