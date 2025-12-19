HudDetection = {
    ['0r-hud-v3'] = {
        toggleon = {
            exports = 'ToggleVisible',
            args = false
        },
        toggleoff = {
            exports = 'ToggleVisible',
            args = true
        },

    },
    ['qbx_hud'] = {
        toggleon = {
            event = 'qbx_hud:client:showHud'
        },
        toggleoff = {
            event = 'qbx_hud:client:hideHud'
        }
    },
    ['esx_hud'] = {
        toggleon = {
            event = 'esx_hud:HudToggle',
            args = false
        },
        toggleoff = {
            event = 'esx_hud:HudToggle',
            args = true
        }
    }

}

DetectedHuds = {}

for hudname, _ in pairs(HudDetection) do
    if GetResourceState(hudname) == 'started' then
        DetectedHuds[hudname] = HudDetection[hudname]
    end
end

function HudToggle(boolean)
    for hudname, actions in pairs(DetectedHuds) do
        print("^2[HUD Manager]^7 Toggled " .. hudname .. " to " .. tostring(boolean))
        if boolean then
            local action = actions['toggleon']
            if action.exports then
                print("^2[HUD Manager]^7 Calling export " .. action.exports, " with args " .. tostring(action.args))
                if action.args ~= nil then
                    exports[hudname][action.exports](nil,action.args)
                else
                    exports[hudname][action.exports]()
                end
            elseif action.event then
                if action.args ~= nil then
                    TriggerEvent(action.event, action.args)
                else
                    TriggerEvent(action.event)
                end
            end
        else
            local action = actions['toggleoff']
            if action.exports then
                if action.args ~= nil then
                    exports[hudname][action.exports](nil,action.args)
                else
                    exports[hudname][action.exports]()
                end
            elseif action.event then
                if action.args ~= nil then
                    TriggerEvent(action.event, action.args)
                else
                    TriggerEvent(action.event)
                end
            end
        end
    end
end
