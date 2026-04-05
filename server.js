const express = require("express");
const fetch = require("node-fetch"); // v2

const app = express();

const CLIENT_ID = "1b5fba24b40841ab84c87982eabf8edd";
const CLIENT_SECRET = "3aa30d0d921342d397a3265ccf530397";

app.use(express.static(__dirname));

/* GET TOKEN */
async function getToken() {
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization":
                "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    const data = await result.json();
    return data.access_token;
}

/* SEARCH */
app.get("/search", async (req, res) => {
    try {

        let query = req.query.q;

        // 🔥 FIX 1: handle empty query
        if (!query) {
            return res.json({ tracks: { items: [] } });
        }

        // 🔥 FIX 2: encode query (VERY IMPORTANT)
        query = encodeURIComponent(query);

        const token = await getToken();

        const result = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        const data = await result.json();

        res.json(data);

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Failed to fetch songs" });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});