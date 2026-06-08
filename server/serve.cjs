/**
 * Standalone production server for Expo static builds.
 *
 * Serves the output of build.js (static-build/) with two special routes:
 * - GET / or /manifest with expo-platform header → platform manifest JSON
 * - GET / without expo-platform → landing page HTML
 * Everything else falls through to static file serving from ./static-build/.
 *
 * Zero external dependencies — uses only Node.js built-ins (http, fs, path).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const STATIC_ROOT = path.resolve(__dirname, "..", "dist");
const TEMPLATE_PATH = path.resolve(__dirname, "templates", "landing-page.html");
const DATA_DIR = path.resolve(__dirname, "..", "data");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const PRICES_FILE = path.join(DATA_DIR, "prices.json");
const basePath = (process.env.BASE_PATH || "/").replace(/\/+$/, "");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Prices management
const DEFAULT_PRICES = {
  maruti_groundnut: 2800,
  maharani_groundnut: 3199,
  saraswati_groundnut: 3301,
  saurashtra_pure: 3000,
  amrutdhara_groundnut: 3099,
  sungold_sunflower: 2490,
  sunfit_sunflower: 2400,
  sunhealth_sunflower: 2800,
  sunfresh_sunflower: 2799,
  naturallife_sunflower: 2800,
  sunplus_sunflower: 2799,
  forsun_sunflower: 2799,
  forline_sunflower: 2799,
  forking_sunflower: 3000,
  updatedAt: new Date().toISOString()
};

function loadPricesFromFile() {
  try {
    if (fs.existsSync(PRICES_FILE)) {
      const data = fs.readFileSync(PRICES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (_e) {}
  try {
    fs.writeFileSync(PRICES_FILE, JSON.stringify(DEFAULT_PRICES, null, 2), "utf-8");
  } catch (_e) {}
  return DEFAULT_PRICES;
}

function savePricesToFile(prices) {
  try {
    fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2), "utf-8");
  } catch (_e) {}
}

async function handlePricesGET(res) {
  try {
    const prices = loadPricesFromFile();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(prices));
  } catch (err) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
}

async function handlePricesPOST(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {
      const pricesMap = JSON.parse(body);
      
      // Validation: verify that each key other than 'updatedAt' is a positive number
      const newPrices = {};
      for (const [key, val] of Object.entries(pricesMap)) {
        if (key === "updatedAt") continue;
        const num = Number(val);
        if (isNaN(num) || num <= 0) {
          res.writeHead(400, { "content-type": "application/json" });
          res.end(JSON.stringify({ error: `Invalid price for ${key}: must be a positive number` }));
          return;
        }
        newPrices[key] = num;
      }
      
      newPrices.updatedAt = new Date().toISOString();

      savePricesToFile(newPrices);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(newPrices));
    } catch (_e) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request" }));
    }
  });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
};

// Message management functions
// MongoDB integration (optional). If `MONGODB_URI` is provided, messages
// will be stored in MongoDB; otherwise we fall back to file-backed JSON.
let mongoClient = null;
let messagesCollection = null;

async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    const { MongoClient } = await import("mongodb");
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    const dbName = process.env.MONGODB_DB || "oil_shop";
    const db = mongoClient.db(dbName);
    messagesCollection = db.collection("messages");
    await messagesCollection.createIndex({ createdAt: 1 });
    console.log("Connected to MongoDB", uri, dbName);
  } catch (err) {
    console.error("MongoDB connection failed:", err && err.message ? err.message : err);
    messagesCollection = null;
  }
}

function loadMessagesFromFile() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (_e) {}
  return [];
}

function saveMessagesToFile(messages) {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (_e) {}
}

async function handleMessagesGET(res) {
  try {
    if (messagesCollection) {
      const docs = await messagesCollection.find({}).sort({ createdAt: 1 }).toArray();
      const messages = docs.map((d) => {
        const copy = { ...d };
        delete copy._id;
        return copy;
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(messages));
      return;
    }

    const messages = loadMessagesFromFile();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(messages));
  } catch (err) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
}

async function handleMessagesPOST(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    try {
      const { customerName, phone, message } = JSON.parse(body);
      if (!message || !message.trim()) {
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Message is required" }));
        return;
      }

      const newMessage = {
        id: Date.now(),
        customerName: customerName || null,
        phone: phone || null,
        message: message.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      if (messagesCollection) {
        await messagesCollection.insertOne(newMessage);
        const copy = { ...newMessage };
        res.writeHead(201, { "content-type": "application/json" });
        res.end(JSON.stringify(copy));
        return;
      }

      // Fallback to file storage
      const messages = loadMessagesFromFile();
      messages.push(newMessage);
      saveMessagesToFile(messages);

      res.writeHead(201, { "content-type": "application/json" });
      res.end(JSON.stringify(newMessage));
    } catch (_e) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid request" }));
    }
  });
}

async function handleMessageMarkRead(messageId, res) {
  try {
    if (messagesCollection) {
      const result = await messagesCollection.findOneAndUpdate(
        { id: messageId },
        { $set: { isRead: true } },
        { returnDocument: "after" },
      );
      if (!result.value) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Message not found" }));
        return;
      }
      const copy = { ...result.value };
      delete copy._id;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(copy));
      return;
    }

    const messages = loadMessagesFromFile();
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Message not found" }));
      return;
    }
    messages[messageIndex].isRead = true;
    saveMessagesToFile(messages);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(messages[messageIndex]));
  } catch (_e) {
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
}

function getAppName() {
  try {
    const appJsonPath = path.resolve(__dirname, "..", "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, "manifest.json");

  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(
      JSON.stringify({ error: `Manifest not found for platform: ${platform}` }),
    );
    return;
  }

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "expo-protocol-version": "1",
    "expo-sfv-version": "0",
  });
  res.end(manifest);
}

function serveLandingPage(req, res, landingPageTemplate, appName) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = forwardedProto || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"];
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(STATIC_ROOT, safePath);

  if (!filePath.startsWith(STATIC_ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not Found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { "content-type": contentType });
  res.end(content);
}

const landingPageTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || "/";
  }

  // Set CORS headers for API requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Handle API routes
  if (pathname === "/api/messages") {
    if (req.method === "GET") {
      return handleMessagesGET(res);
    } else if (req.method === "POST") {
      return handleMessagesPOST(req, res);
    }
  }

  if (pathname === "/api/prices") {
    if (req.method === "GET") {
      return handlePricesGET(res);
    } else if (req.method === "POST") {
      return handlePricesPOST(req, res);
    }
  }

  // Handle mark message as read
  const messageReadMatch = pathname.match(/^\/api\/messages\/(\d+)\/read$/);
  if (messageReadMatch && req.method === "PATCH") {
    const messageId = parseInt(messageReadMatch[1], 10);
    return handleMessageMarkRead(messageId, res);
  }

  // Handle manifest requests
  if (pathname === "/" || pathname === "/manifest") {
    const platform = req.headers["expo-platform"];
    if (platform === "ios" || platform === "android") {
      return serveManifest(platform, res);
    }

    if (pathname === "/") {
      return serveLandingPage(req, res, landingPageTemplate, appName);
    }
  }

  serveStaticFile(pathname, res);
});

(async () => {
  await initMongo();
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Serving static Expo build on port ${port}`);
  });
})();
