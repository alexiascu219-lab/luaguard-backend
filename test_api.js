const axios = require('axios');

async function test() {
    console.log("--- Starting KeySystem API Tests ---");
    
    // 1. Test Valid Key & HWID Binding
    try {
        console.log("\n[Test 1] Valid Key & HWID Binding...");
        const res1 = await axios.post('http://localhost:3000/validate-key', {
            key: "TEST-KEY-123",
            hwid: "PLAYER-1-ID"
        });
        console.log("Response:", res1.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }

    // 2. Test HWID Mismatch
    try {
        console.log("\n[Test 2] HWID Mismatch (Same Key, Different HWID)...");
        const res2 = await axios.post('http://localhost:3000/validate-key', {
            key: "TEST-KEY-123",
            hwid: "PLAYER-2-ID"
        });
        console.log("Response:", res2.data);
    } catch (err) {
        console.error("Expected Error:", err.response ? err.response.data : err.message);
    }

    // 3. Test Invalid Key
    try {
        console.log("\n[Test 3] Invalid Key...");
        const res3 = await axios.post('http://localhost:3000/validate-key', {
            key: "FAKE-KEY-999",
            hwid: "PLAYER-1-ID"
        });
        console.log("Response:", res3.data);
    } catch (err) {
        console.error("Expected Error:", err.response ? err.response.data : err.message);
    }
}

test();
