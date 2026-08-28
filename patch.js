const fs = require("fs");
let code = fs.readFileSync("server.js", "utf8");

// 1. Inyectar en APPS_CATALOG
const appHunter = `  {
    id: "ofertas-hunter",
    name: "Ofertas Hunter",
    description: "Meta-Buscador Universal de precios. Evasivo y sigiloso usando Fetch nativo HTTP/2.",
    port: null,
    category: "scraper",
    icon: "fa-spider",
    ramEstimate: "30 MB",
    startCommand: 'su - u0_a106 -c "/data/data/com.termux/files/usr/bin/node /data/data/com.termux/files/home/ofertas-hunter/src/core.js > /data/data/com.termux/files/home/ofertas-hunter/run.log 2>&1"',
  }`;

if (!code.includes("ofertas-hunter")) {
    code = code.replace(/id: "pocketbase"[\s\S]+?\},/, match => match + "\n" + appHunter + ",");
}

// 2. Modificar el endpoint de Logs para que intercepte 'ofertas-hunter' y lea el archivo run.log
const logLogic = `app.get("/api/tasks/:id/logs", (req, res) => {
  if (req.params.id === "ofertas-hunter") {
    try {
      const logContent = require("fs").readFileSync("/data/data/com.termux/files/home/ofertas-hunter/run.log", "utf8");
      return res.json({ id: req.params.id, logs: logContent.split("\\n").filter(Boolean) });
    } catch (e) {
      return res.json({ id: req.params.id, logs: ["[Info] El Scraper aun no ha generado registros o esta iniciando..."] });
    }
  }`;

if (!code.includes('req.params.id === "ofertas-hunter"')) {
    code = code.replace(/app\.get\("\/api\/tasks\/:id\/logs", \(req, res\) => \{/, logLogic);
}

fs.writeFileSync("server.js", code);
