---@diagnostic disable: duplicate-set-field
-- Guard: ensure es_extended is started before loading
if GetResourceState('es_extended') ~= 'started' then
    return
end

local ESX = exports['es_extended']:getSharedObject()

Framework = {}

--- Get local player data from ESX
---@return table|nil playerData Player data including job, etc.
function Framework.GetPlayerData()
    local PlayerData = ESX.GetPlayerData()
    if not PlayerData then return nil end
    
    return {
        identifier = PlayerData.identifier,
        name = PlayerData.name or (PlayerData.firstName .. ' ' .. PlayerData.lastName),
        job = {
            name = PlayerData.job.name,
            label = PlayerData.job.label,
            grade = PlayerData.job.grade,
            isBoss = PlayerData.job.grade_name == 'boss'
        },
        gang = {
            name = 'none',
            label = 'None',
            grade = 0
        },
        gender = PlayerData.sex == "female" and  'Female' or 'Male'
    }
end

--- Listen for job updates
---@param callback function Callback function to run when job changes
function Framework.OnJobUpdate(callback)
    RegisterNetEvent('esx:setJob', function(job)
        callback(job)
    end)
end

--- Listen for gang updates (ESX doesn't have gangs by default)
---@param callback function Callback function to run when gang changes
function Framework.OnGangUpdate(callback)
    -- ESX doesn't have gangs by default
end

RegisterNetEvent('esx:playerLoaded', function (xPlayer, skin)
    CacheAPI.init()
end)

function Framework.CachePed()
    ESX.SetPlayerData("ped", cache.ped)
end
