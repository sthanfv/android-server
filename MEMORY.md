# Bitácora de Desarrollo y Estado del Sistema (Ofertas Hunter Pro - Nivel Enterprise)

## 1. Visión y Filosofía Actual
El sistema ha dejado de ser un proyecto personal de reventa (Flipping) para evolucionar hacia un **Data Intelligence Engine (Motor de Inteligencia de Datos)**. La finalidad comercial es ofrecer el sistema o sus datos (B2B, SaaS, Reportes) a terceros. 
El núcleo del valor no está en qué tiendas escrapea, sino en la calidad matemática de sus análisis.

## 2. El "Congelador" (Ideas Archivadas / Wiped)
- *Monetización por Afiliados (Modelo A):* Pausado.
- *Arbitraje Inverso / Compras Personales:* Descartado permanentemente por falta de capital.
- *Scraping de Binance P2P:* Descartado. No se crearán más integraciones por el momento.
- *Escala a Servidor Cloud:* Descartado. La infraestructura es y será el M10 local (o un clúster de teléfonos).

## 3. Estado del Sistema
- **Base Técnica:** El scraper y el dashboard se ejecutan de manera estable en el M10 (Node.js + SQLite). Se resolvió el "Proceso Fantasma" y los cuellos de botella de reinicio. 
- **Despliegue:** Se utiliza `sync_direct.ps1` vía ADB para inyectar actualizaciones seguras (como ROOT) directamente a la memoria del M10.

## 4. El Gran Hito: El Cerebro Estadístico (En Progreso)
Por mandato explícito, TODO el esfuerzo se concentra en crear el "Cerebro Matemático".
*   **Qué hará:** Ignorar descuentos comerciales falsos. Evaluar los precios contra un historial matemático (Mediana, Z-Score) y emitir un *Confidence Score* de la oferta.
*   **Arquitectura Exigida:** Modular, resiliente (si falla un cálculo no se cae el bot) y sometida a rigurosas pruebas unitarias locales y de integración.
*   **Documentación Exigida:** Cada línea crítica debe estar explicada. Se exigirán diagramas y estándares profesionales (JSDoc).

## 6. Actualización Reciente de Seguridad y Monitoreo (DevSecOps)
- **Enmascaramiento de Tokens Sensibles:** En `server.js`, el endpoint `GET /api/config` ahora enmascara el token de bot de Telegram (`tok.substring(0, 8) + ':••••••••'`) y los webhooks de Discord para evitar fugas de credenciales en el navegador.
- **Autenticación Timing-Safe (Mitigación de Side-Channel Attacks):** Se implementó `crypto.timingSafeEqual` con buffers de longitud fija en el middleware de autenticación HTTP Basic Auth, neutralizando ataques de análisis de tiempo de respuesta.
- **Protección contra Inyección XSS:** Implementación de la función `escaparHtml` en `public/app.js` aplicada a todos los títulos, tiendas y campos dinámicos antes de insertarlos en el DOM.
- **Filtrado por Ciudad en SQLite:** El endpoint `GET /api/offers` ahora incluye soporte nativo parametrizado por ciudad mediante consultas preparadas seguras.
- **Pestaña de Control & Sistema:** Renombrada y expandida en `public/index.html` para monitorear el estado en tiempo real de los Circuit Breakers de los adaptadores y configurar alertas de Telegram de manera segura.