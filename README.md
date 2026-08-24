# 📱 Android Mini Server Core (Universal Android)

[![Licencia](https://img.shields.io/badge/licencia-MIT-green.svg)](LICENSE)
[![Plataforma](https://img.shields.io/badge/plataforma-Android%20%7C%20Termux-blue.svg)](https://termux.dev)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-emerald.svg)](https://nodejs.org)
[![Seguridad](https://img.shields.io/badge/seguridad-HTTPS%20%2F%20TLS-cyan.svg)](#-cifrado-https-y-seguridad)
[![Watchdog](https://img.shields.io/badge/watchdog-anti--cuelgues-amber.svg)](#-watchdog-anti-cuelgues-y-scale-to-zero)

> Transforma cualquier teléfono Android antiguo o en desuso en un **mini servidor doméstico 24/7 de bajo consumo**, con panel de control web _Glassmorphism_ (Mobile-First), **Centro de Integraciones en 1 Clic (App Hub)**, **Desplegador de Páginas Web (estilo Vercel)**, **Alertas a Telegram / Discord**, **Gobernador Térmico del Kernel**, telemetría en tiempo real acelerada por GPU, **cifrado HTTPS nativo**, **Watchdog anti-cuelgues**, **Scheduler On-Demand (_Scale-to-Zero_)** y acceso remoto seguro.

---

## 🌟 ¿Por qué reutilizar un teléfono antiguo como servidor?

Cualquier teléfono inteligente en desuso (incluso con la pantalla rota) cuenta con un hardware muy superior al de muchas placas de desarrollo:

- **Procesador multi-núcleo eficiente:** 4 a 8 núcleos ARM de muy bajo consumo eléctrico (~2 a 4 Watts).
- **Memoria RAM y Flash integrada:** 2 a 6 GB de RAM física con almacenamiento eMMC/UFS rápido.
- **SAI / UPS Natural Integrado:** La batería interna mantiene el servidor encendido ante cortes de luz domésticos.
- **Módem y Conectividad:** Wi-Fi integrado y posibilidad de respaldo móvil 4G/LTE si se cae la fibra óptica de casa.

---

## 🏬 Centro de Integraciones en 1 Clic (_App Hub_) y Desplegador Web

El panel incorpora una interfaz visual para instalar microservicios y alojar sitios web sin tocar la consola:

```
┌───────────────────────────┬──────────────┬──────────────────┬────────────────────────────────────────────────────────┐
│ APLICACIÓN / SERVICIO     │ PUERTO       │ CONSUMO DE RAM   │ FUNCIÓN Y BENEFICIO                                    │
├───────────────────────────┼──────────────┼──────────────────┼────────────────────────────────────────────────────────┤
│ ⚡ PocketBase              │ :8090        │ ~15 MB - 28 MB   │ Backend completo en 1 archivo: Base de datos SQLite    │
│                           │              │                  │ en tiempo real, autenticación y API REST automática.   │
│ 🛡️ AdGuard Home           │ :3001 / :53  │ ~18 MB - 30 MB   │ Servidor DNS bloqueador de anuncios y rastreadores     │
│                           │              │                  │ para Smart TVs, PCs y móviles de todo el hogar.        │
│ 🔔 Gotify Server          │ :8080        │ ~10 MB - 16 MB   │ Servidor privado de notificaciones push a tu teléfono  │
│                           │              │                  │ personal sin intermediarios.                           │
│ 🚀 Desplegador Web        │ :3000/sites/ │ ~2 MB por web    │ Aloja páginas web estáticas (HTML/CSS/JS) y landing    │
│    (Estilo Vercel)        │              │                  │ pages en 1 clic desde el navegador.                    │
└───────────────────────────┴──────────────┴──────────────────┴────────────────────────────────────────────────────────┘
```

---

## 🔔 Canales de Notificaciones (Telegram / Discord) y Gobernador Térmico

1. **Alertas a Telegram y Discord:**
   - Configura tu Token de Bot de Telegram y Chat ID o tu Webhook de Discord directamente desde la pestaña **`Alertas & Ajustes`**.
   - Recibe avisos automáticos ante cortes de luz, caídas de Wi-Fi, batería baja (< 15%) o sobrecalentamiento.
2. **Gobernador Térmico Inteligente del Kernel:**
   - Monitorea la temperatura del teléfono en tiempo real.
   - Si la batería supera los **41 °C**, pospone automáticamente las tareas pesadas hasta que el procesador descienda a **36 °C**, asegurando que el teléfono nunca se degrade ni sufra estrés térmico.

---

## 📊 Matriz de Lenguajes y Arquitecturas Recomendadas

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟢 NIVEL 1: MÁXIMA EFICIENCIA (Binarios Nativos Compilados - Consumo < 20 MB RAM)           │
├──────────────┬──────────────────┬───────────────────────────────────────────────────────────┤
│ Lenguaje     │ Consumo Típico   │ Casos de Uso y Frameworks Recomendados                    │
├──────────────┼──────────────────┼───────────────────────────────────────────────────────────┤
│ Go (Golang)  │ 8 MB - 25 MB     │ Binarios únicos para ARM. Ideal para APIs ultrarrápidas   │
│              │                  │ (Gin, Fiber, Chi), proxies reversos y brokers.            │
│ Rust         │ 5 MB - 15 MB     │ Cero recolección de basura. Scrapers de alto rendimiento, │
│              │                  │ parsers masivos y servidores ligeros (Axum).              │
│ C / C++      │ 2 MB - 10 MB     │ Servidores web bare-metal (Nginx, lighttpd, Mosquitto).   │
└──────────────┴──────────────────┴───────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟢 NIVEL 2: ALTO RENDIMIENTO CON ECOSISTEMA ÁGIL (Consumo 30 MB - 70 MB RAM)                │
├──────────────┬──────────────────┬───────────────────────────────────────────────────────────┤
│ Node.js      │ 35 MB - 60 MB    │ E/S asíncrona no bloqueante. Excelente para APIs REST     │
│              │                  │ (Express, Fastify), bots de Telegram (Telegraf),          │
│              │                  │ WebSockets y scrapers ligeros (Cheerio / Axios).          │
│ Python       │ 25 MB - 55 MB    │ Automatizaciones, procesamiento de texto y APIs ligeras   │
│              │                  │ (FastAPI, Starlette, Flask con Uvicorn).                  │
│ SQLite       │ 0 MB (en reposo) │ La base de datos perfecta para teléfonos. Cero procesos   │
│              │                  │ secundarios; almacena millones de datos en un solo archivo.│
└──────────────┴──────────────────┴───────────────────────────────────────────────────────────┘
```

## 🔒 DevSecOps, Seguridad y Auditoría

El servidor ahora integra una capa completa de grado de producción (Normativas OWASP) para asegurar tus datos y la integridad de la red doméstica:

1. **Autenticación Estricta (Basic Auth):** Todo el panel web y la API están cerrados al público. Requiere credenciales configurables en `config.json` para acceder.
2. **Defensas Anti-DDoS y Fuerza Bruta (Rate Limiting):** Si un atacante intenta adivinar tu contraseña o satura el sistema, será bloqueado temporalmente (máximo 500 peticiones por ventana).
3. **Escudos HTTP (Helmet.js & CORS):** Bloqueo automático contra ataques XSS, *Clickjacking* e inyecciones de código a través de cabeceras seguras.
4. **Protección Anti-Path Traversal (CWE-22):** El Desplegador Web limpia criptográficamente los nombres de los proyectos (estricto Regex). No permite navegar atrás en el sistema (`../../../etc/passwd`).
5. **Control de Tamaño de Payloads:** Límites estrictos (Max 5MB por carga) para impedir saturación de memoria (*Buffer Overflow*).
6. **Sistema de Auditoría (Access Logs):** Cada IP, tipo de dispositivo (User-Agent) y petición se registra meticulosamente en un archivo de sistema (`logs/access.log`), permitiendo trazabilidad y detección de actividad sospechosa al instante.

---

## 🌐 GUÍA DE CONEXIÓN: ¿Cómo Entrar al Servidor?

Tienes **dos opciones** para acceder al panel de control desde tu computadora, tablet o smartphone:

```
                              ┌────────────────────────────────────────────────────────┐
                              │            CUALQUIER TELÉFONO ANDROID                  │
                              │           (Mini Servidor en Ejecución)                 │
                              └───────────────────────────┬────────────────────────────┘
                                                          │
                   ┌──────────────────────────────────────┴──────────────────────────────────────┐
                   ▼                                                                             ▼
    OPCIÓN 1: CONEXIÓN WI-FI DIRECTA (Sin Apps)                                   OPCIÓN 2: ACCESO GLOBAL CON TAILSCALE
    - No requiere instalar nada en tu PC/Móvil.                                    - Para conectarte desde la calle (4G/5G)
    - Tu PC/Móvil debe estar en la misma red Wi-Fi.                                 o si tu router bloquea la red local.
    - URL HTTP:  http://[IP-LOCAL-DEL-SERVIDOR]:3000                               - URL HTTP:  http://[IP-TAILSCALE]:3000
    - URL HTTPS: https://[IP-LOCAL-DEL-SERVIDOR]:3443                              - URL HTTPS: https://[IP-TAILSCALE]:3443
    - SSH: ssh -p 8022 [USUARIO]@[IP-LOCAL]:8022                                   - SSH: ssh -p 8022 [USUARIO]@[IP-TAILSCALE]
```

---

## 🚀 Guía de Instalación Paso a Paso (Universal)

```
PASO 1                 PASO 2                 PASO 3                 PASO 4
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Instalar Termux  │──►│ Conectar por SSH │──►│ Ejecutar         │──►│ Abrir Dashboard  │
│ en el Teléfono   │   │ desde la PC      │   │ ./setup.sh       │   │ en el Navegador  │
└──────────────────┘   └──────────────────┘   └──────────────────┘   └──────────────────┘
```

1. **Instalar Termux:** Descárgalo desde [F-Droid](https://f-droid.org/es/packages/com.termux/).
2. **Instalar dependencias y clonar:**
   ```bash
   pkg update -y && pkg install -y openssh git nodejs
   git clone https://github.com/tu-usuario/android-mini-server.git ~/termux-dashboard
   cd ~/termux-dashboard
   chmod +x setup.sh && ./setup.sh
   ```
3. **Abrir el panel:** Entra desde cualquier navegador a `http://[IP-DE-TU-TELEFONO]:3000` o `http://[IP-TAILSCALE]:3000`.

---

## ⚖️ Política de Privacidad y Seguridad en GitHub

- **Cero exposición de datos personales:** Los archivos `config.json`, certificados SSL, carpetas de aplicaciones (`apps/`) y proyectos personales (`projects/`) están protegidos bajo `.gitignore`.
- **Uso Ético:** Este software está diseñado exclusivamente con fines educativos y de auto-alojamiento sostenible.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Eres libre de usarlo, modificarlo y compartirlo para proyectos personales, comunitarios o comerciales.
