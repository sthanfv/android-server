# Arquitectura del Sistema: Android Mini Server Core & App Hub

Este documento técnico detalla las capas del sistema, el flujo de datos, el App Hub de integraciones en 1 clic, el Desplegador de Proyectos Web, el Gobernador Térmico del Kernel y el sistema de alertas.

---

## 1. Diagrama de Arquitectura de Capas y Servicios

```
┌────────────────────────────────────────────────────────────────────────┐
│             DISPOSITIVO ANDROID (Mini Servidor Termux)                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 1. Kernel Linux & Sensores de Hardware                           │  │
│  │    - /proc/stat             (Carga diferencial de CPU)           │  │
│  │    - /proc/meminfo          (RAM física + ZRAM/Swap)             │  │
│  │    - /proc/self/oom_score   (oom_score_adj = -900 Shield)        │  │
│  │    - /sys/class/power/*     (Batería, estado, voltaje, temp)     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │ Lectura directa en memoria < 1ms │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 2. Backend Express & Supervisor Universal (server.js)            │  │
│  │    - Telemetría Ultrarrápida (< 0.2 ms)                          │  │
│  │    - Servidor Dual HTTP (:3000) y HTTPS Seguro (:3443)           │  │
│  │    - App Hub (Instalador y Supervisor en 1 Clic para ARM)        │  │
│  │    - Desplegador Web Estático (Rutas /sites/[proyecto])          │  │
│  │    - Gobernador Térmico (Pausa de tareas si temp > 41 °C)        │  │
│  │    - Motor de Alertas Webhook a Telegram y Discord               │  │
│  │    - Monitor de Ciclo de Vida de Red & Heartbeat (1.1.1.1:53)    │  │
│  │    - Watchdog Anti-Cuelgues (Timeout + Límite RAM + SIGKILL)     │  │
│  │    - Scheduler On-Demand (Scale-to-Zero: 0 MB en reposo)         │  │
│  │    - Buffer Circular de Logs en RAM (Cero desgaste eMMC)         │  │
│  └───────────────────┬──────────────────────────────┬───────────────┘  │
│                      │                              │                  │
│       Control spawn  │                              │ Subprocesos      │
│                      ▼                              ▼                  │
│  ┌───────────────────────────────┐  ┌───────────────────────────────┐  │
│  │ 🏬 App Hub:                   │  │ 🚀 Desplegador Web:           │  │
│  │ - PocketBase (:8090)          │  │ - Sitios HTML/CSS/JS          │  │
│  │ - AdGuard Home (:3001)        │  │ - Micro-APIs dedicadas        │  │
│  │ - Gotify Server (:8080)       │  │                               │  │
│  └───────────────────────────────┘  └───────────────────────────────┘  │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │ HTTP / HTTPS
                                       ▼
    ┌──────────────────────────────────┴──────────────────────────────────┐
    │                                                                     │
    ▼ (En tu Casa / Misma Red)                                            ▼ (En la Calle / 4G / Otro Wi-Fi)
┌──────────────────────────────────────┐                ┌──────────────────────────────────────┐
│  Red Local Wi-Fi (wlan0)             │                │  Tailscale Mesh VPN (tun0)           │
│  http://[IP-LOCAL]:3000              │                │  http://[IP-TAILSCALE]:3000          │
│  https://[IP-LOCAL]:3443             │                │  https://[IP-TAILSCALE]:3443         │
│  SSH: puerto 8022                    │                │  SSH: [IP-TAILSCALE] puerto 8022     │
└──────────────────────────────────────┘                └──────────────────────────────────────┘
```

---

## 2. Decisiones de Ingeniería de los Nuevos Módulos

### A. App Hub & Aislamiento de Procesos

- Cada microservicio corre en su propio directorio dentro de `apps/` bajo la supervisión directa del Watchdog.
- Si un servicio supera su cuota de memoria o se congela, el supervisor lo detiene sin comprometer la estabilidad del sistema operativo.

### B. Gobernador Térmico Inteligente

- Evita el estrés térmico del procesador móvil y preserva la salud química de la batería de litio.
- Cuando la temperatura baja a 36 °C, el kernel reanuda automáticamente la cola de tareas sin pérdida de datos.

### C. Desplegador Web Visual

- Permite a usuarios sin conocimientos de terminal o infraestructura desplegar interfaces web, landing pages o documentación en 1 clic.
