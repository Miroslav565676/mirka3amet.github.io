const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PORT = 49273;

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".m4a": "audio/mp4",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let url = req.url === "/" ? "/index.html" : req.url;
  url = url.split("?")[0];
  const filePath = path.join(ROOT, url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end("Not found"); return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Server running on port " + PORT);
  // wait 5 seconds then open fullscreen
  setTimeout(() => {
    const url = "http://127.0.0.1:" + PORT;
    // try edge/kiosk, fallback to default browser
    const cmd = `start msedge --kiosk --inprivate "${url}" 2>nul || start chrome --kiosk "${url}" 2>nul || start "" "${url}"`;
    exec(cmd);
  }, 5000);
});
