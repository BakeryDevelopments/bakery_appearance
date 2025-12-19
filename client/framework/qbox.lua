-- Guard: ensure qb-core is started before loading (QBox is based on QBCore)
if GetResourceState('qb-core') ~= 'started' then
    return
end

local QBCore = exports['qb-core']:GetCoreObject()

Framework = {}

--- Get local player data from QBox/QBCore
---@return table|nil playerData Player data including job, gang, etc.
function Framework.GetPlayerData()
    local PlayerData = QBCore.Functions.GetPlayerData()
    if not PlayerData then return nil end
    
    return {
        citizenid = PlayerData.citizenid,
        name = PlayerData.charinfo.firstname .. ' ' .. PlayerData.charinfo.lastname,
        job = {
            name = PlayerData.job.name,
            label = PlayerData.job.label,
            grade = PlayerData.job.grade.level,
            onduty = PlayerData.job.onduty,
            isBoss = PlayerData.job.isboss
        },
        gang = {
            name = PlayerData.gang and PlayerData.gang.name or 'none',
            label = PlayerData.gang and PlayerData.gang.label or 'None',
            grade = PlayerData.gang and PlayerData.gang.grade.level or 0
        },
        gender = PlayerData.charinfo.gender == 1 and 'Female' or 'Male'
    }
end

--- Listen for job updates
---@param callback function Callback function to run when job changes
function Framework.OnJobUpdate(callback)
    RegisterNetEvent('QBCore:Client:OnJobUpdate', function(job)
        callback(job)
    end)
end

--- Listen for gang updates
---@param callback function Callback function to run when gang changes
function Framework.OnGangUpdate(callback)
    RegisterNetEvent('QBCore:Client:OnGangUpdate', function(gang)
        callback(gang)
    end)
end

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    CacheAPI.init()
end)

