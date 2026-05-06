import { Router } from "express";
import { authenticateToken } from "../../middleware/auth.js"; 
import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from 'mssql';
import { establishConnection } from '../../utils/dbhelper.js'; 
import dbconfigSetup from '../../dbconfigSetup.js';

const router = Router();
const config = dbconfigSetup;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// PERSONA
const systemInstruction = `You are Nexus AI, an expert, highly efficient logistics and warehouse command center assistant. 
You are speaking to authorized personnel. Provide clear, concise, and professional answers. 
When returning lists of data (like users, inventory, or orders), YOU MUST format the data into a Markdown Table. Do not use bullet points for data sets.
Never offer to delete, modify, or change data—you are a read-only assistant.`;

const nexusTools = {
    functionDeclarations: [
        {
            name: "fetch_nexus_api",
            description: "Fetches data from the internal Nexus backend. Use this for all data retrieval.",
            parameters: {
                type: "OBJECT",
                properties: {
                    endpoint: {
                        type: "STRING",
                        description: "The API route to call. MUST be one of: 'users', 'inventory', 'logistics', 'fleet', 'orders', 'warehouses', 'zones'."
                    },
                    queryString: {
                        type: "STRING",
                        description: "Optional URL queries, e.g., '?limit=50' or '?role=system_admin'. Default is empty."
                    }
                },
                required: ["endpoint"]
            }
        }
    ]
};

// 3. DEFINE THE DATABASE FUNCTIONS (The actual SQL queries)
// const dbFunctions = {
//     fetch_nexus_api: async ({ endpoint, queryString = "" }) => {
//         try {
//             const pool = await establishConnection(config);
//             // Query grouping users by Role
//             const query = `
//                 SELECT Role, COUNT(*) as count 
//                 FROM Users 
//                 WHERE IsDeleted = 0 
//                 GROUP BY Role
//             `;
//             const result = await pool.request().query(query);
//             return result.recordset; // Returns an array like [{ Role: 'system_admin', count: 3 }, ...]
//         } catch (error) {
//             console.error("Tool DB Error:", error);
//             return { error: "Failed to connect to the database to retrieve user stats." };
//         }
//     },

//     get_critical_inventory: async () => {
//         try {
//             const pool = await establishConnection(config);
//             // Assuming you have a table named Inventory with Quantity and Threshold columns
//             const query = `
//                 SELECT name, current_stock, reorder_level 
//                 FROM Products 
//                 WHERE current_stock <= reorder_level
//             `;
//             const result = await pool.request().query(query);
//             return result.recordset; 
//         } catch (error) {
//             return { error: "Failed to retrieve critical inventory data." };
//         }
//     }
// };

const apiFunctions = {
    fetch_nexus_api: async (args, cookieHeader) => { 
        try {
            const allowedEndpoints = ['users', 'inventory', 'logistics', 'zones', 'fleet', 'orders', 'warehouses'];
            if (!allowedEndpoints.includes(args.endpoint)) {
                return { error: "Invalid endpoint requested." };
            }

            const query = args.queryString || '';
            const url = `http://localhost:3000/api/${args.endpoint}${query}`;
            
            console.log(`[Nexus AI] Fetching internal API: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Cookie': cookieHeader, 
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 403) {
                console.log(`[Nexus AI] Access Denied for endpoint: ${url}`);
                return { 
                    error: "SYSTEM MESSAGE: The user's role does not have permission to view this data. Tell them they are forbidden from accessing it." 
                };
            }

            if (!response.ok) throw new Error(`API returned ${response.status}`);
            
            return await response.json(); 
        } catch (error) {
            console.error("Master API Tool Error:", error);
            return { error: "Failed to retrieve data from Nexus backend." };
        }
    }
};

router.post("/api/chat", authenticateToken, async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: "Message is required" });

        const formattedHistory = [];
        if (history && history.length > 0) {
            history.forEach(msg => {
                if (msg.id === 1) return; 
                
                formattedHistory.push({
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                });
            });
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: systemInstruction,
            tools: [nexusTools]
        });

        const chat = model.startChat({
            history: formattedHistory
        });
        
        let result = await chat.sendMessage(message);
        let response = result.response;

        const functionCalls = response.functionCalls();
        
        if (functionCalls) {
            const call = functionCalls[0];
            console.log(`[Nexus AI] Triggering Tool: ${call.name}`, call.args);

            if (apiFunctions[call.name]) {
                const cookieHeader = req.headers.cookie || '';

                const apiResponse = await apiFunctions[call.name](call.args, cookieHeader);
                
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: call.name,
                        response: { data: apiResponse }
                    }
                }]);
                
                response = result.response; 
            }
        }

        res.status(200).json({ 
            status: 200, 
            reply: response.text() 
        });

    } catch (err) {
        console.error("Nexus AI Chat Error:", err);
        
        let userFriendlyError = "System Error: Neural net connection failed.";
        
        if (err.status === 503) {
            userFriendlyError = "Nexus AI is currently experiencing heavy network traffic. Please try your request again in a few moments.";
        } else if (err.status === 429) {
            userFriendlyError = "Nexus AI rate limit exceeded. Please wait 60 seconds before scanning the database again.";
        } else if(err.status === 403) {
            userFriendlyError = "Nexus AI access denied. Please ensure you have the necessary permissions.";
        }

        res.status(200).json({ 
            status: 500, 
            reply: userFriendlyError 
        });
    }
});

export default router;