const express = require("express");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 3000;

function getForwardHeaders(req) {
    const clientIp = req.headers["x-forwarded-for"]
        ? `${req.headers["x-forwarded-for"]}, ${req.socket.remoteAddress}`
        : req.socket.remoteAddress;

    return {
        "X-Forwarded-For": clientIp,
        "X-Real-IP": req.ip || clientIp,
    };
}

function proxyRequest(upstreamUrl, req, res) {
    https.get(upstreamUrl.toString(), { headers: getForwardHeaders(req) }, (apiRes) => {
        res.status(apiRes.statusCode || 200);
        Object.entries(apiRes.headers).forEach(([name, value]) => {
            if (value != null) {
                res.set(name, value);
            }
        });
        apiRes.pipe(res);
    }).on("error", (err) => {
        res.status(500).send("Error: " + err.message);
    });
}

app.get("/api/aes", (req, res) => {
    const upstreamUrl = new URL("https://fortnite-api.com/v2/aes");
    upstreamUrl.search = new URLSearchParams(req.query).toString();

    https.get(upstreamUrl.toString(), { headers: getForwardHeaders(req) }, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => (data += chunk));
        apiRes.on("end", () => {
            try {
                const json = JSON.parse(data);
                const formatted = {
                    mainKey: "0x" + json.data.mainKey.replace(/^0x/i, "").toUpperCase(),
                    dynamicKeys: json.data.dynamicKeys.map((k) => ({
                        name: k.pakFilename,
                        guid: k.pakGuid,
                        key: "0x" + k.key.replace(/^0x/i, "").toUpperCase(),
                    })),
                };
                res.json(formatted);
            } catch (err) {
                res.status(500).send("Error: " + err.message);
            }
        });
    }).on("error", (err) => {
        res.status(500).send("Error: " + err.message);
    });
});

app.get("/uedb/aes", (req, res) => {
    const upstreamUrl = new URL("https://uedb.dev/svc/api/v1/fortnite/aes");
    upstreamUrl.search = new URLSearchParams(req.query).toString();
    proxyRequest(upstreamUrl, req, res);
});

app.get("/uedb/mappings", (req, res) => {
    const upstreamUrl = new URL("https://uedb.dev/svc/api/v1/fortnite/mappings");
    upstreamUrl.search = new URLSearchParams(req.query).toString();
    proxyRequest(upstreamUrl, req, res);
});

app.use((req, res) => {
    res.status(404).send("Not found");
});

app.listen(PORT, () => {
    console.log(`proxy server running at http://localhost:${PORT}/`);
});
