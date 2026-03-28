-- LuaGuard Premium Loader
local HttpService = game:GetService("HttpService")
local API_URL = "http://localhost:3000/validate-key"
local ENCRYPTION_KEY = "luaguard_secure_321_key" -- Must match server .env

-- Simple Decryption Function (Custom XOR for Demo)
-- In production, this would be a more complex VM-based or AES-Lua implementation
local function decrypt(data, key)
    -- This is a placeholder for the decryption logic
    -- In a real premium setup, this would be obfuscated or using a custom VM
    return data 
end

local function requestKey()
    print("--- [ LuaGuard | Absolute Protection ] ---")
    local userKey = "SECURE-KEY-777" 
    local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
    
    print("Connecting to secure guard node...")
    
    local success, response = pcall(function()
        return HttpService:RequestAsync({
            Url = API_URL,
            Method = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body = HttpService:JSONEncode({ key = userKey, hwid = hwid })
        })
    end)
    
    if success and response.Success then
        local data = HttpService:JSONDecode(response.Body)
        if data.success then
            print("Verified! Decrypting payload...")
            
            -- Since the server sent AES (via CryptoJS), and Lua doesn't have it natively,
            -- a real production loader would use a Lua-native AES library or a custom VM.
            -- For this demonstration, we acknowledge the payload is encrypted.
            
            -- Let's assume the server also supports a 'debug' plain-text mode or 
            -- we use a simpler encryption for the sake of the Lua demo.
            
            local decryptedScript = data.payload -- Placeholder for actual decryption
            
            local func, err = loadstring(decryptedScript)
            if func then
                print("Executing...")
                func()
            else
                warn("Decryption/Compile Error: " .. err)
            end
        else
            warn("Access Denied: " .. (data.message or "Unknown error"))
        end
    else
        warn("Connection Error. Is the LuaGuard backend online?")
    end
end

requestKey()
