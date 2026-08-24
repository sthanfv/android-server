/**
 * Script de Prueba de Watchdog (Simulación de Proceso Colgado / Zombie)
 * Se queda esperando indefinidamente para comprobar que el Watchdog lo termina con SIGKILL.
 */

console.log(
  "⚠️ [Test Watchdog] Iniciando script que simulará quedarse colgado...",
);
console.log("⏳ Esperando respuesta de socket bloqueado (bucle infinito)...");

// Simulación de bloqueo
setInterval(() => {
  console.log(
    "... todavía esperando conexión colgada (el Watchdog debería matarme) ...",
  );
}, 2000);
