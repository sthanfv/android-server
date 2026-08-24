/**
 * Certificados SSL/TLS auto-firmados integrados para HTTPS seguro nativo (RSA 2048-bit)
 */
const fs = require("fs");
const path = require("path");

const keyPath = path.join(__dirname, "server.key");
const certPath = path.join(__dirname, "server.crt");

function getSslCredentials() {
  try {
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath, "utf8"),
        cert: fs.readFileSync(certPath, "utf8"),
      };
    }
  } catch (e) {}
  return null;
}

module.exports = { getSslCredentials };
