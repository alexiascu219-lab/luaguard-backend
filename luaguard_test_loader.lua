--[[
    LuaGuard Loader Prototype
    Instructions:
    1. Create a script in the dashboard and get its ID (e.g., 1)
    2. Change SCRIPT_ID below to match.
    3. Run this in Synapse X / Krnl / Delta / Fluxus
]]

local SCRIPT_ID = 2
local BACKEND_URL = "http://192.168.18.11:3000" -- Note: Must be running on the same WiFi network as your laptop!
local GATEWAY_URL = "http://192.168.18.11:3001/getkey"

-- Dependencies
local HttpService = game:GetService("HttpService")
local RbxAnalytics = game:GetService("RbxAnalyticsService")
local base64Decode = (syn and syn.crypt and syn.crypt.base64.decode) or (crypt and crypt.base64decode) or function(data)
    -- Fallback base64 decoder if executor lacks one
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c=0
        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
        return string.char(c)
    end))
end

-- Get HWID
local hwid = RbxAnalytics:GetClientId()

local function ValidateKey(key)
    local response = request or http_request or (http and http.request)
    if not response then return false, "Executor does not support HTTP requests." end

    local success, res = pcall(function()
        return response({
            Url = BACKEND_URL .. "/validate-key",
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode({
                key = key,
                hwid = hwid
            })
        })
    end)

    if not success or not res then
        return false, "Failed to connect to LuaGuard Backend."
    end

    local data = HttpService:JSONDecode(res.Body)
    if data.success then
        return true, data.payload
    else
        return false, data.message
    end
end

-- Simulate a basic prompt
-- In a real script, use a Drawing library or core GUI.
local inputKey = "REPLACE_WITH_KEY_FROM_GATEWAY" 

if inputKey == "REPLACE_WITH_KEY_FROM_GATEWAY" then
    print("====================================")
    print("Welcome to LuaGuard Protected Script")
    print("You need a Key. Please get one here:")
    print(GATEWAY_URL .. "?hwid=" .. hwid .. "&script=" .. tostring(SCRIPT_ID))
    print("Once you have it, replace 'REPLACE_WITH_KEY_FROM_GATEWAY' at the bottom of the loader script and run it again.")
    print("====================================")
    -- Optionally auto-copy to clipboard if supported:
    if setclipboard then setclipboard(GATEWAY_URL .. "?hwid=" .. hwid .. "&script=" .. tostring(SCRIPT_ID)) end
else
    local isValid, result = ValidateKey(inputKey)
    if isValid then
        print("[LuaGuard] Key Valid! Decoding and executing script...")
        local decodedScript = base64Decode(result)
        local func, err = loadstring(decodedScript)
        if func then
            func()
            print("[LuaGuard] Script executed successfully.")
        else
            warn("[LuaGuard] Failed to load script: " .. tostring(err))
        end
    else
        warn("[LuaGuard] Access Denied: " .. tostring(result))
    end
end
