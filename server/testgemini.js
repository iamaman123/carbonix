import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.log('NO KEY'); return; }
    const testModel = async (m) => {
        try {
            await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, { contents: [{ parts: [{ text: "hi" }] }] });
            console.log(m, "SUCCESS");
        } catch(e) { console.log(m, "ERROR:", e.response?.data?.error?.message); }
    }
    
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-latest");
    await testModel("gemini-2.0-flash");
    await testModel("gemini-2.5-flash");
}
test();
