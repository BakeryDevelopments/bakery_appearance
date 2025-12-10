-- Guard: ensure qb-core is started before loading (QBox is based on QBCore)
if GetResourceState('qbx_core') ~= 'started' then
    return
end

Framework = {}

--- Get player data from QBox/QBCore
---@param source number Player server ID
---@return table|nil playerData Player data including job, gang, citizenid, etc.
function Framework.GetPlayer(source)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return nil end
    
    return {
        source = source,
        citizenid = Player.PlayerData.citizenid,
        name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
        job = {
            name = Player.PlayerData.job.name,
            label = Player.PlayerData.job.label,
            grade = Player.PlayerData.job.grade.level,
            onduty = Player.PlayerData.job.onduty,
            isBoss = Player.PlayerData.job.isboss
        },
        gang = {
            name = Player.PlayerData.gang and Player.PlayerData.gang.name or 'none',
            label = Player.PlayerData.gang and Player.PlayerData.gang.label or 'None',
            grade = Player.PlayerData.gang and Player.PlayerData.gang.grade.level or 0
        },
        money = {
            cash = Player.PlayerData.money.cash or 0,
            bank = Player.PlayerData.money.bank or 0
        },
        identifiers = {
            steam = Player.PlayerData.steam,
            license = Player.PlayerData.license,
            discord = Player.PlayerData.discord
        }
    }
end

--- Check if player has permission (admin/ACE)
---@param source number Player server ID
---@return boolean hasPermission
function Framework.HasPermission(source)
    return IsPlayerAceAllowed(source, 'command')
end

--- Get player's current job name
---@param source number Player server ID
---@return string|nil jobName
function Framework.GetJob(source)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.job.name
end

--- Get player's current gang name
---@param source number Player server ID
---@return string|nil gangName
function Framework.GetGang(source)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.gang and Player.PlayerData.gang.name or 'none'
end

--- Get player's citizen ID
---@param source number Player server ID
---@return string|nil citizenid
function Framework.GetCitizenId(source)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return nil end
    return Player.PlayerData.citizenid
end

--- Remove money from player (prioritize cash, then bank)
---@param source number Player server ID
---@param amount number Amount to remove
---@return boolean success Whether the operation was successful
function Framework.RemoveMoney(source, amount)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return false end
    
    local cash = Player.PlayerData.money.cash or 0
    local bank = Player.PlayerData.money.bank or 0
    
    if cash + bank < amount then
        return false  -- Insufficient funds
    end
    
    if cash >= amount then
        Player.Functions.RemoveMoney('cash', amount)
    else
        local cashToTake = cash
        local bankToTake = amount - cashToTake
        if cashToTake > 0 then
            Player.Functions.RemoveMoney('cash', cashToTake)
        end
        if bankToTake > 0 then
            Player.Functions.RemoveMoney('bank', bankToTake)
        end
    end
    
    return true
end

--- Add money to player (to bank account)
---@param source number Player server ID
---@param amount number Amount to add
---@return boolean success Whether the operation was successful
function Framework.AddMoney(source, amount)
    local Player = exports.qbx_core:GetPlayer(source)
    if not Player then return false end
    
    Player.Functions.AddMoney('bank', amount)
    return true
end

return Framework
