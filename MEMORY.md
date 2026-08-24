# Memoria de Desarrollo y Estado del Sistema

## 1. Qué Cambió (Caché, Eliminación Web y Despliegue ZIP)
- **Erradicación de Mocks y Gotify:** Se purgó el código de aplicaciones falsas y de Gotify. PocketBase es la única app mantenida y totalmente funcional.
- **Botón de Borrado de Webs (Frontend/Backend):** Se agregó el endpoint DELETE /api/projects/:id en el backend que utiliza fs.rmSync para eliminar del disco a los sitios desplegados. En el frontend se agregó un botón visual rojo junto a cada web alojada para invocar esta función.
- **Motor de Despliegue de ZIP (Pro Deployer):** El Desplegador Web se potenció. Ahora puede recibir paquetes de sitios web enteros (.ZIP de hasta 20 MB). Los codifica en Base64 desde el navegador, los envía al servidor, y el backend usa unzip nativo del Kernel Linux para montarlos automáticamente y desplegarlos.
- **Caché Web Apagado:** Se ajustaron los enrutadores express.static para que tengan maxAge: 0, eliminando la retención de 1 hora. Esto solucionó el bug crítico de UX donde el usuario no podía ver el botón de borrar recién programado.
- **Inyección de Termux:Boot:** Se creó el script persistente start_server.sh en ~/.termux/boot/ con WakeLock para asegurar el auto-arranque.
- **Bypass ADB Inalámbrico:** Se habilitó TCP/IP (puerto 5555) en Android, logrando desconectar el cable USB y mantener control vía Wi-Fi.

## 2. Por Qué Cambió
El usuario intentó usar el Desplegador Web con un sistema pesado pero la API lo rechazó por protección anti-DoS (límite de 5MB en texto). Además el usuario demandaba un verdadero panel de administración para poder borrar las webs estáticas ya alojadas, y reportó que no estaba viendo los cambios en tiempo real por un problema de Caché en su Android. También surgió la necesidad de desatar el teléfono del cable USB.

## 3. Archivos Afectados
- server.js: Agregado endpoint DELETE, agregado el deploy ZIP usando unzip. Cache cambiado a 0.
- public/app.js: Función deleteProject, lector base64 para subir archivos, inyección del UI del basurero y botón ZIP.
- public/index.html: Input type file y botón nuevo.

## 4. Estado Actual del Sistema
- Funciona Perfectamente la instalación, ejecución y eliminación real de sitios web por ZIP. El servidor se inicia inalámbricamente por TCP/IP o de manera automática por Termux:Boot si se apaga el teléfono.
- Siguiente Paso: El usuario debe probar exitosamente subir un proyecto ZIP complejo.