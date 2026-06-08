const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const DATA = path.join(ROOT, "data");

const MESSAGES = path.join(DATA, "messages.json");
const PRICES = path.join(DATA, "prices.json");

if (!fs.existsSync(DATA)) fs.mkdirSync(DATA, { recursive: true });

function read(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ---------------- SERVER ---------------- */

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathName = url.pathname;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  /* ---------------- API MESSAGES ---------------- */

  if (pathName === "/api/messages") {
    if (req.method === "GET") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify(read(MESSAGES, [])));
    }

    if (req.method === "POST") {
      let body = "";

      req.on("data", (c) => (body += c));

      req.on("end", () => {
        const data = JSON.parse(body || "{}");

        if (!data.message) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "Message required" }));
        }

        const msgs = read(MESSAGES, []);

        const newMsg = {
          id: Date.now(),
          customerName: data.customerName || null,
          phone: data.phone || null,
          message: data.message,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        msgs.push(newMsg);
        write(MESSAGES, msgs);

        res.writeHead(201, { "content-type": "application/json" });
        res.end(JSON.stringify(newMsg));
      });
    }
  }

  /* ---------------- MARK READ ---------------- */

  const match = pathName.match(/^\/api\/messages\/(\d+)\/read$/);

  if (match && req.method === "PATCH") {
    const id = Number(match[1]);

    const msgs = read(MESSAGES, []);
    const msg = msgs.find((m) => m.id === id);

    if (msg) msg.isRead = true;

    write(MESSAGES, msgs);

    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ success: true }));
  }

  /* ---------------- STATIC FRONTEND ---------------- */

  const filePath = path.join(DIST, pathName);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
  const ext = path.extname(filePath);

  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  };

  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream"
  });

  return fs.createReadStream(filePath).pipe(res);
}

  /* ---------------- SPA ---------------- */

  if (!pathName.startsWith("/api")) {
    res.writeHead(200, { "content-type": "text/html" });
    return fs.createReadStream(path.join(DIST, "index.html")).pipe(res);
  }

  res.writeHead(404);
  res.end("Not Found");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on", PORT);
});   