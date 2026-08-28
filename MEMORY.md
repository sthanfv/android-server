# Memoria de Desarrollo y Estado del Sistema

## 1. Qué Cambió (Despliegue ADB Directo, Fix de Interfaz y Migración de BD)
- **Canal Directo ADB:** Se creó el script maestro `sync_direct.ps1` que sincroniza el código desde el PC al M10 mediante cable USB, empleando `adb su` para inyectar los cambios y reiniciar los servicios saltándose las restricciones de API y payload.
- **Solución de Fallo de Interfaz:** Se corrigió un `TypeError` fatal en `app.js` causado por la ausencia del HTML de la pestaña "Alertas & Ajustes", el cual congelaba la UI. Se implementó una lógica a prueba de fallos para los event listeners.
- **Corrección de Base de Datos:** Se ejecutó una migración manual en `hunter.db` (`ALTER TABLE productos ADD COLUMN ciudad TEXT`) para evitar el crasheo del scraper en su arranque. Gracias a esto, el scraper pudo generar la tabla `scraper_config` y levantar la interfaz de control de scrapers de manera dinámica.
- **Ajuste de Telegram:** Se mitigaron alertas innecesarias de enlaces 404 para evitar spam en el canal técnico, priorizando solo errores FATAL y de hardware.

## 2. Por Qué Cambió
El usuario demandaba un canal de despliegue libre de bloqueos de API. Asimismo, era crítico restaurar la estabilidad del Dashboard tras las refactorizaciones agresivas que dejaron componentes huérfanos. Se requería también corregir la discrepancia de esquemas en SQLite que estaba impidiendo que el motor principal arrancara.

## 3. Decisiones Técnicas Tomadas
- Se utilizó `node:sqlite` nativo en un script temporal sobre el M10 para mutar la base de datos sin depender de binarios de sqlite3.
- Se implementó el control de servicios usando `nohup` y `00-miniserver.sh` en vez de `pm2`, ya que el ecosistema Termux del M10 prescinde de este último.
- Se diseñó el modal de *Control de Scrapers* para leer la tabla dinámica directamente, haciendo que nuevas tiendas (adaptadores) se listen solas sin requerir tocar el HTML/JS.

## 4. Estado Actual del Sistema
**ESTABLE Y EN PRODUCCIÓN.** El Dashboard y el Scraper se comunican fluidamente con `hunter.db`. El canal de subida `sync_direct.ps1` funciona como pipeline oficial de despliegue.

## 5. Próximos Pasos (Monetización)
- Implementar la inserción de enlaces de afiliados.
- Comenzar a estructurar el frontend de despliegue a Vercel o la capa de usuario final.
- Ejecutar la suite de validación (ESLint/Prettier) pendiente a petición del usuario, una vez se inicie la próxima fase.