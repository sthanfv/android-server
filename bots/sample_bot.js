/**
 * Bot de Telegram de Ejemplo / Demostración
 * Simula la respuesta a comandos y envío de alertas de telemetría.
 */

console.log("🤖 Bot de Telegram inicializado en el servidor.");
console.log("📡 Conectado a la API de Telegram vía Webhook/Polling.");

let counter = 1;

setInterval(() => {
  const mem = process.memoryUsage().rss / (1024 * 1024);
  console.log(
    `[Ping #${counter++}] Bot activo en segundo plano. Consumo RAM: ${mem.toFixed(2)} MB`,
  );
}, 5000);
