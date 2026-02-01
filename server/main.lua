local function getPlyInfo(src) return {name = GetPlayerName(src), identifiers = GetPlayerIdentifiers(src)} end

lib.callback.register('getplayerInformation', getPlyInfo)

-- Load database module
local Database = require('server.database')

function DebugPrint(data)
    if Config.Debug then
    print(data)
    end
end

-- Helper: normalize ped model lookup on the server
local function GetPedModalHash(ped)
    return GetEntityModel(ped)
end

-- Save player appearance callback
lib.callback.register('bakery_appearance:saveAppearance', function(source, appearance)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        DebugPrint('[bakery_appearance] ERROR: Could not get citizenid for player ' .. source)
        return false
    end

    -- Get menu type from appearance data to determine price
    local menuType = appearance.menuType or 'clothing'
    local price = ServerCache.appearanceSettings.prices[menuType] or 0
    
    -- Get player data for money check
    local playerData = Framework.GetPlayer(source)
    if not playerData then
        DebugPrint('[bakery_appearance] ERROR: Could not get player data for source ' .. source)
        return false
    end
    
    -- Check if player has enough money (cash + bank)
    local playerMoney = (playerData.money.cash or 0) + (playerData.money.bank or 0)
    if playerMoney < price then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Insufficient Funds',
            description = string.format('You need $%d to use this service', price),
            type = 'error'
        })
        return false
    end

    appearance.drawTotal = nil
    appearance.propTotal = nil
    appearance.headOverlayTotal = nil

    -- Save appearance to database
    local success = Database.SaveAppearance(citizenid, appearance)
    
    if success and price > 0 then
        -- Deduct money from player using framework-agnostic method
        local moneyRemoved = Framework.RemoveMoney(source, price)
        
        if moneyRemoved then
            DebugPrint(string.format('[bakery_appearance] Saved appearance for citizenid: %s (charged $%d)', citizenid, price))
            TriggerClientEvent('ox_lib:notify', source, {
                title = 'Success',
                description = string.format('Appearance saved! Charged $%d', price),
                type = 'success'
            })
        else
            -- Failed to remove money, revert the save
            DebugPrint(string.format('[bakery_appearance] Failed to charge money for citizenid: %s', citizenid))
            TriggerClientEvent('ox_lib:notify', source, {
                title = 'Error',
                description = 'Failed to process payment',
                type = 'error'
            })
            return false
        end
    elseif success then
        DebugPrint('[bakery_appearance] Saved appearance for citizenid: ' .. citizenid)
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Success',
            description = 'Appearance saved!',
            type = 'success'
        })
    else
        DebugPrint('[bakery_appearance] Failed to save appearance for citizenid: ' .. citizenid)
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Error',
            description = 'Failed to save appearance',
            type = 'error'
        })
    end
    
    return success
end)

-- Save outfit callback (personal only - job/gang outfits are saved via admin menu)
lib.callback.register('bakery_appearance:saveOutfit', function(source, outfitData)
    local citizenid = Framework.GetCitizenId(source)
    local playerData = Framework.GetPlayer(source)
    
    if not playerData then
        DebugPrint('[bakery_appearance] ERROR: Could not get player data for source ' .. source)
        return false
    end

    -- Determine gender from current model or outfit data
    local ped = GetPlayerPed(source)
    local model = GetPedModalHash(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    local outfitName = outfitData.label or 'Unnamed Outfit'
    local outfit = outfitData.outfit
    
    -- Extract only components and props for consistency with job outfits
    local filteredComponents = {}
    if outfit.drawables then
        -- Filter out face, hair, and neck components
        for key, value in pairs(outfit.drawables) do
            if key ~= 'face' and key ~= 'hair' and key ~= 'neck' then
                filteredComponents[key] = value
            end
        end
    elseif outfit.components then
        -- If already in components format, filter
        for key, value in pairs(outfit.components) do
            if key ~= 'face' and key ~= 'hair' and key ~= 'neck' then
                filteredComponents[key] = value
            end
        end
    end
    
    local outfitToSave = {
        components = filteredComponents,
        props = outfit.props or {}
    }

    -- Save personal outfit to database
    local success, shareCode = Database.SaveOutfit(citizenid, nil, nil, gender, outfitName, outfitToSave)
    
    if success then
        DebugPrint(string.format('[bakery_appearance] Saved personal outfit "%s" for citizenid: %s (gender: %s) - Share Code: %s', 
            outfitName, citizenid, gender, shareCode or 'N/A'))
    end

    return success
end)

-- Get player outfits callback
lib.callback.register('bakery_appearance:getOutfits', function(source)
    local citizenid = Framework.GetCitizenId(source)
    local playerData = Framework.GetPlayer(source)
    
    if not playerData then
        return {}
    end

    -- Determine gender
    local ped = GetPlayerPed(source)
    local model = GetPedModalHash(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    -- Debug: Print player job/gang info
    DebugPrint(string.format('[bakery_appearance] Fetching outfits for player %s - Job: %s, Gang: %s, Gender: %s', 
        citizenid, playerData.job.name or 'none', playerData.gang.name or 'none', gender))

    -- Get personal outfits from database
    local personalOutfits = Database.GetPersonalOutfits(citizenid, gender)
    
    -- Get job/gang outfits from JSON cache (ServerCache.outfits)
    local jobOutfits = {}
    if ServerCache and ServerCache.outfits then
        for i = 1, #ServerCache.outfits do
            local outfit = ServerCache.outfits[i]
            -- Match current job or gang and gender
            if outfit.gender == gender then
                if (outfit.job and outfit.job == playerData.job.name) or 
                   (outfit.gang and outfit.gang == playerData.gang.name) then
                    table.insert(jobOutfits, outfit)
                end
            end
        end
    end
    
    -- Debug: Print outfit counts
    DebugPrint(string.format('[bakery_appearance] Found %d personal outfits, %d job/gang outfits', 
        #personalOutfits, #jobOutfits))

    -- Transform database format to UI format
    local transformedOutfits = {}
    
    -- Add personal outfits
    for i = 1, #personalOutfits do
        local o = personalOutfits[i]
        table.insert(transformedOutfits, {
            id = 'personal_' .. (o.id or i), -- Prefix with 'personal_' to ensure uniqueness
            label = o.outfit_name,
            outfit = o.outfit_data,
            isPersonal = true
        })
    end
    
    -- Add job/gang outfits from JSON
    for i = 1, #jobOutfits do
        local o = jobOutfits[i]
        table.insert(transformedOutfits, {
            id = 'job_' .. (o.id or i), -- Prefix with 'job_' to ensure uniqueness
            label = o.outfitName,
            outfit = o.outfitData,
            jobname = o.job or o.gang,
            isPersonal = false
        })
    end

    return transformedOutfits
end)

-- Get outfit share code callback
lib.callback.register('bakery_appearance:getOutfitShareCode', function(source, outfitId)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid or not outfitId then
        return nil
    end

    -- Extract numeric ID from prefixed ID (e.g., "personal_1" -> 1)
    local idStr = tostring(outfitId)
    local numericId = tonumber(idStr:match('%d+'))
    
    if not numericId then
        return nil
    end

    local shareCode = Database.GetOutfitShareCode(citizenid, numericId)
    return shareCode
end)

-- Import outfit by share code callback
lib.callback.register('bakery_appearance:importOutfitByCode', function(source, data)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid or not data or not data.shareCode or not data.outfitName then
        return false
    end

    local success = Database.ImportOutfitByShareCode(data.shareCode, citizenid, data.outfitName)
    return success
end)

-- Rename outfit callback
lib.callback.register('bakery_appearance:renameOutfit', function(source, data)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid or not data or not data.id or not data.label then
        return false
    end

    -- Extract numeric ID from prefixed ID (e.g., "personal_1" -> 1)
    local idStr = tostring(data.id)
    local numericId = tonumber(idStr:match('%d+'))
    
    if not numericId then
        return false
    end

    -- Only personal outfits can be renamed by players
    if not idStr:find('personal_') then
        return false
    end

    -- Determine gender
    local ped = GetPlayerPed(source)
    local model = GetPedModalHash(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'
    
    -- Rename in database
    local success = Database.RenamePersonalOutfit(citizenid, numericId, data.label, gender)

    return success
end)

-- Delete outfit callback
lib.callback.register('bakery_appearance:deleteOutfit', function(source, outfitData)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        return false
    end

    -- Only personal outfits can be deleted by players
    -- Job/gang outfits are deleted via admin menu
    if outfitData.jobname or outfitData.isPersonal == false then
        -- This is a job outfit, only admins can delete via admin menu
        return false
    end

    -- Extract numeric ID from prefixed ID (e.g., "personal_1" -> 1)
    local idStr = tostring(outfitData.id)
    local numericId = tonumber(idStr:match('%d+'))
    
    if not numericId then
        return false
    end

    -- Determine gender
    local ped = GetPlayerPed(source)
    local model = GetPedModalHash(ped)
    local isMale = model == GetHashKey("mp_m_freemode_01")
    local gender = isMale and 'male' or 'female'

    local outfitName = outfitData.name or outfitData.label
    
    -- Delete personal outfit from database using numeric ID
    local success = Database.DeletePersonalOutfitById(citizenid, numericId, gender)

    return success
end)

-- Get player appearance callback
lib.callback.register('bakery_appearance:getAppearance', function(source)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        return nil
    end

    return Database.GetAppearance(citizenid)
end)

lib.callback.register('bakery_appearance:getPlayerTattoos', function(source)
    local citizenid = Framework.GetCitizenId(source)
    
    if not citizenid then
        return {}
    end

    local appearance = Database.GetAppearance(citizenid)
    return appearance and appearance.tattoos or {}
end)

-- Export: Get player appearance by identifier (citizenid)
-- This is useful for multicharacter systems or external resources
-- @param identifier string - The citizenid of the player
-- @return table|nil - The appearance data or nil if not found
function GetPlayerAppearance(identifier)
    if not identifier or identifier == '' then
        DebugPrint('[bakery_appearance] ERROR: GetPlayerAppearance - Invalid identifier provided')
        return nil
    end

    local appearance = Database.GetAppearance(identifier)
    
    if appearance then
        -- Return in a format compatible with illenium-appearance and other systems
        return {
            citizenid = identifier,
            model = appearance.model or 'mp_m_freemode_01',
            skin = appearance, -- Full appearance data
            active = 1
        }
    end
    
    return nil
end

exports('GetPlayerAppearance', GetPlayerAppearance)

-- Server-side admin command to open appearance menu for self or another player
RegisterCommand('appearance', function(source, args, rawCommand)
    if not source or source == 0 then
        DebugPrint("^1[bakery_appearance] ERROR: Command can only be used in-game^7")
        return
    end
    
    -- Check if player is admin
    local playerData = Framework.GetPlayer(source)
    if not playerData then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Error',
            description = 'Could not load player data',
            type = 'error'
        })
        return
    end
    
    -- Check admin status (framework-agnostic)

    if not IsAdmin(source) then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Denied',
            description = 'You do not have permission to use this command',
            type = 'error'
        })
        return
    end
    
    -- Determine target player
    local targetId = source -- default to self
    local targetArg = args[1]
    
    if targetArg and targetArg ~= 'me' then
        -- Try to find player by ID
        targetId = tonumber(targetArg)
        if not targetId or targetId < 1 then
            TriggerClientEvent('ox_lib:notify', source, {
                title = 'Invalid Player',
                description = 'Player ID must be a valid number',
                type = 'error'
            })
            return
        end
        
        -- Check if target player exists
        if not GetPlayerName(targetId) then
            TriggerClientEvent('ox_lib:notify', source, {
                title = 'Player Not Found',
                description = 'That player is not online',
                type = 'error'
            })
            return
        end
    end
    
    -- Notify admin that menu is opening
    if targetId ~= source then
        TriggerClientEvent('ox_lib:notify', source, {
            title = 'Opening Menu',
            description = 'Opening appearance menu for ' .. GetPlayerName(targetId),
            type = 'info'
        })
    end
    
    -- Trigger client event to open appearance menu
    TriggerClientEvent('bakery_appearance:client:openAppearanceMenu', targetId)
end, false)

