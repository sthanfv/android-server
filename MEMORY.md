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

## 5. Decisiones Técnicas Inquebrantables
- **No se tocará el Dashboard** para agregar funcionalidades estéticas; solo se usará para monitorear el Cerebro.
- **Testing Primero:** Ninguna pieza matemática sube al M10 sin haber sido probada en el entorno local del PC (`C:\workspace\ofertas-hunter-pro\tests\`).
- **Resiliencia Pura:** La ausencia de datos en el historial no debe romper el sistema. Debe haber degradación elegante (Graceful Degradation).