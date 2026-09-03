/**
 * Galaxy M10 Mini Server Core - Frontend Logic
 * Telemetría en tiempo real, App Hub en 1 Clic, Desplegador Web,
 * Gestión de Alertas Webhook y Selector Multi-Tema.
 */

/**
 * Escapa caracteres HTML para prevenir inyección XSS al insertar en el DOM.
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto seguro para insertar en HTML
 */
function escaparHtml(texto) {
  if (!texto) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 1. Configuración de Pestañas (Tabs)
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    const targetTab = btn.getAttribute("data-tab");
    const content = document.getElementById(targetTab);
    if (content) content.classList.add("active");

    // Cargas perezosas según pestaña
    if (targetTab === "tab-offers") {
      loadOffersStats();
      loadOffers(1);
    }
    if (targetTab === "tab-apphub") loadApps();
    if (targetTab === "tab-deployer") loadProjects();
    if (targetTab === "tab-settings") loadConfig();
  });
});

// 2. Gráfico de Rendimiento (Chart.js)
let perfChart = null;
const MAX_CHART_POINTS = 30;
const chartData = {
  labels: Array(MAX_CHART_POINTS).fill(""),
  datasets: [
    {
      label: "CPU (%)",
      borderColor: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.12)",
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4,
      data: Array(MAX_CHART_POINTS).fill(0),
    },
    {
      label: "RAM (%)",
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.12)",
      borderWidth: 2,
      pointRadius: 0,
      fill: true,
      tension: 0.4,
      data: Array(MAX_CHART_POINTS).fill(0),
    },
  ],
};

function initChart() {
  const ctx = document.getElementById("performanceChart").getContext("2d");
  perfChart = new Chart(ctx, {
    type: "line",
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          min: 0,
          max: 100,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: { color: "#64748b", font: { size: 10 } },
        },
      },
    },
  });
}

function updateChart(cpuUsage, ramPercent) {
  if (!perfChart) return;
  const now = new Date().toLocaleTimeString("es-ES", { hour12: false });
  chartData.labels.push(now);
  chartData.labels.shift();
  chartData.datasets[0].data.push(cpuUsage);
  chartData.datasets[0].data.shift();
  chartData.datasets[1].data.push(ramPercent);
  chartData.datasets[1].data.shift();
  perfChart.update();
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// 3. Telemetría Principal
async function fetchTelemetry() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Error al conectar con la API");
    const data = await res.json();

    // CPU
    document.getElementById("cpuUsageText").innerText =
      `${data.cpu.usage.toFixed(1)}%`;
    document.getElementById("cpuProgressBar").style.width =
      `${data.cpu.usage}%`;
    document.getElementById("cpuCoresText").innerText =
      `${data.cpu.cores} Núcleos`;
    document.getElementById("cpuModelText").innerText = data.cpu.model
      .split("(")[0]
      .trim();
    document.getElementById("cpuTempBadge").innerText =
      `${data.cpu.temperature.toFixed(1)} °C`;

    const thermalBadge = document.getElementById("thermalStatusBadge");
    if (data.isThermalThrottled) {
      thermalBadge.className = "badge badge-danger";
      thermalBadge.innerText = "🔥 Enfriando";
    } else {
      thermalBadge.className = "badge badge-success";
      thermalBadge.innerText = "Normal";
    }

    // RAM
    document.getElementById("ramUsedText").innerText =
      `${data.memory.usedMb} MB`;
    document.getElementById("ramTotalText").innerText =
      `de ${data.memory.totalMb} MB`;
    document.getElementById("ramPercentBadge").innerText =
      `${data.memory.percent}%`;
    document.getElementById("ramProgressBar").style.width =
      `${data.memory.percent}%`;
    document.getElementById("ramFreeText").innerText =
      `Libre: ${data.memory.freeMb} MB`;
    document.getElementById("zramText").innerHTML =
      `<i class="fa-solid fa-compress"></i> ZRAM: ${data.memory.swapUsedMb} MB`;

    // Almacenamiento
    document.getElementById("storageUsedText").innerText =
      `${data.storage.usedGb} GB`;
    document.getElementById("storageTotalText").innerText =
      `de ${data.storage.totalGb} GB`;
    document.getElementById("storagePercentBadge").innerText =
      `${data.storage.percent}%`;
    document.getElementById("storageProgressBar").style.width =
      `${data.storage.percent}%`;
    document.getElementById("storageFreeText").innerText =
      `Libre: ${data.storage.freeGb} GB`;

    // Batería
    document.getElementById("batteryLevelText").innerText =
      `${data.battery.level}%`;
    document.getElementById("batteryVoltageText").innerText =
      `${data.battery.voltage} V`;
    document.getElementById("batteryProgressBar").style.width =
      `${data.battery.level}%`;
    document.getElementById("batteryTempText").innerHTML =
      `<i class="fa-solid fa-temperature-half"></i> ${data.battery.temperature} °C`;

    const battBadge = document.getElementById("batteryStatusBadge");
    const battLevel = data.battery.level || 0;
    const battStatus = (data.battery.status || "").toLowerCase();

    if (data.battery.isCharging || (battStatus.includes("charg") && !battStatus.includes("discharg") && !battStatus.includes("not charg"))) {
      battBadge.className = "badge badge-success";
      battBadge.innerHTML = `<i class="fa-solid fa-bolt"></i> Cargando`;
    } else if (battStatus.includes("full") || battStatus.includes("completa") || battLevel === 100) {
      battBadge.className = "badge badge-cyan";
      battBadge.innerHTML = `<i class="fa-solid fa-plug"></i> Completa`;
    } else if (battLevel <= 15) {
      battBadge.className = "badge badge-danger";
      battBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Baja (${battLevel}%)`;
    } else {
      battBadge.className = "badge badge-amber";
      battBadge.innerHTML = `<i class="fa-solid fa-battery-half"></i> Descargando`;
    }

    // Uptime
    document.getElementById("uptimeText").innerText = formatUptime(data.uptime);

    // Internet Status
    const internetText = document.getElementById("internetStatusText");
    const internetBadge = document.getElementById("internetStatusBadge");
    if (internetText && internetBadge) {
      if (data.isInternetOnline) {
        internetText.innerHTML = `<i class="fa-solid fa-circle text-emerald"></i> En Línea (Monitor Activo)`;
        internetBadge.className = "badge badge-success";
        internetBadge.innerText = "Conectado";
      } else {
        internetText.innerHTML = `<i class="fa-solid fa-circle text-red"></i> Sin Conexión (Modo Respaldo)`;
        internetBadge.className = "badge badge-danger";
        internetBadge.innerText = "Caído";
      }
    }

    // Redes
    if (data.networks && data.networks.length > 0) {
      const wifi = data.networks.find((n) => n.type === "Wi-Fi Local");
      const tailscale = data.networks.find((n) => n.type === "Tailscale VPN");
      if (wifi) document.getElementById("wifiIpText").innerText = wifi.ip;
      if (tailscale)
        document.getElementById("tailscaleIpText").innerText = tailscale.ip;
    }

    updateChart(data.cpu.usage, data.memory.percent);
  } catch (err) { console.warn('[Dashboard]', err.message); }
}

// 4. Persiana de Tareas y Watchdog (Protegido contra elementos ausentes)
const tasksHeader = document.getElementById("tasksHeader");
const tasksSection = document.getElementById("tasksSection");
if (tasksHeader && tasksSection) {
  tasksHeader.addEventListener("click", () => {
    tasksSection.classList.toggle("open");
  });
}

async function loadTasks() {
  const tbody = document.getElementById("tasksTableBody");
  if (!tbody) return;
  try {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    tbody.innerHTML = "";

    data.tasks.forEach((t) => {
      const tr = document.createElement("tr");
      const isRunning = t.status === "running";

      tr.innerHTML = `
        <td>
          <strong>${t.name}</strong>
          <p class="text-muted" style="font-size:0.75rem; margin-top:2px;">${t.description}</p>
        </td>
        <td>
          <span class="badge ${t.type === "continuous" ? "badge-info" : "badge-warning"}">
            ${t.type === "continuous" ? "24/7 Continuo" : "On-Demand"}
          </span>
        </td>
        <td>
          <span class="badge ${isRunning ? "badge-success" : "badge-info"}">
            ${isRunning ? "🟢 Ejecutando" : "⏸️ Reposo (0 MB)"}
          </span>
        </td>
        <td class="mono">
          ${isRunning ? `<span class="text-emerald">${t.currentMemoryMb} MB</span>` : "0 MB"}
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            ${
              isRunning
                ? `<button class="btn btn-secondary" style="padding:6px 10px; font-size:0.75rem; background:rgba(239,68,68,0.2); color:#ef4444;" onclick="killTask('${t.id}')"><i class="fa-solid fa-stop"></i> Detener</button>`
                : `<button class="btn btn-primary" style="padding:6px 10px; font-size:0.75rem;" onclick="runTask('${t.id}')"><i class="fa-solid fa-play"></i> Iniciar</button>`
            }
            <button class="btn btn-secondary" style="padding:6px 10px; font-size:0.75rem;" onclick="showLogs('${t.id}', '${t.name}')"><i class="fa-solid fa-terminal"></i></button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const badge = document.getElementById("tasksCountBadge");
    if (badge) badge.innerText = `${data.tasks.length} Tareas`;
  } catch (e) { console.warn('[Dashboard]', e.message); }
}

async function runTask(id) {
  await fetch(`/api/tasks/${id}/run`, { method: "POST" });
  loadTasks();
}

async function killTask(id) {
  await fetch(`/api/tasks/${id}/kill`, { method: "POST" });
  loadTasks();
}

async function showLogs(id, name) {
  const titleEl = document.getElementById("modalTaskTitle");
  const contentEl = document.getElementById("terminalLogsContent");
  const modalEl = document.getElementById("logsModal");
  if (titleEl) titleEl.innerText = `Logs de ${name}`;
  if (contentEl) contentEl.innerText = "Cargando logs...";
  if (modalEl) modalEl.classList.add("open");

  const res = await fetch(`/api/tasks/${id}/logs`);
  const data = await res.json();
  if (contentEl) contentEl.innerText = (data.logs || []).join("\n");
}

document.getElementById("btnCloseModal")?.addEventListener("click", () => {
  document.getElementById("logsModal")?.classList.remove("open");
});

// 5. App Hub (Integraciones en 1 Clic)
async function loadApps() {
  try {
    const res = await fetch("/api/apps");
    const data = await res.json();
    const grid = document.getElementById("appsGrid");
    grid.innerHTML = "";

    data.apps.forEach((app) => {
      const card = document.createElement("div");
      card.className = "app-card";
      const isRunning = app.isRunning;

      card.innerHTML = `
        <div>
          <div class="app-header">
            <div class="app-icon"><i class="fa-solid ${app.icon}"></i></div>
            <div class="app-meta">
              <h3>${app.name}</h3>
              <p>${app.description}</p>
            </div>
          </div>
          <div class="app-specs">
            <span><i class="fa-solid fa-network-wired"></i> Puerto: ${app.port}</span>
            <span><i class="fa-solid fa-memory"></i> RAM: ~${app.ramEstimate}</span>
          </div>
        </div>
        <div class="app-actions">
          ${
              isRunning
                ? `
              <button class="btn btn-secondary" style="background:rgba(239,68,68,0.2); color:#ef4444;" onclick="stopApp('${app.id}')">
                <i class="fa-solid fa-stop"></i> Detener
              </button>
              ${app.port ? `<a href="http://${window.location.hostname}:${app.port}${app.id === 'pocketbase' ? '/_/' : ''}" target="_blank" class="btn btn-primary">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Panel
              </a>` : `<button class="btn btn-primary" onclick="showLogs('${app.id}', '${app.name}')"><i class="fa-solid fa-terminal"></i> Ver Logs</button>`}
            `
                : `
            <button class="btn btn-primary" onclick="startApp('${app.id}')">
              <i class="fa-solid fa-bolt"></i> ${app.isInstalled ? "Iniciar Servicio" : "Instalar en 1 Clic"}
            </button>
          `
          }
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) { console.warn('[Dashboard]', e.message); }
}

  async function startApp(id) {
    try {
      const btn = document.querySelector(`button[onclick="startApp('${id}')"]`);
      const originalHtml = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
      btn.disabled = true;

      const res = await fetch(`/api/apps/${id}/start`, { method: "POST" });
      const data = await res.json();
      
      if (data.error) {
        alert("❌ Error: " + data.error);
      } else if (data.message && data.message.includes("instalado")) {
        alert("✅ " + data.message);
      }
    } catch (e) {
      alert("❌ Error de red: " + e.message);
    }
    loadApps();
  }
  
  async function stopApp(id) {
    try {
      const res = await fetch(`/api/apps/${id}/stop`, { method: "POST" });
      const data = await res.json();
      if (data.error) alert("❌ Error: " + data.error);
    } catch (e) {
      alert("❌ Error de red: " + e.message);
    }
    loadApps();
  }

// 6. Desplegador Web (Vercel-like)
async function deleteProject(id) {
  if (confirm(`¿Estás seguro de que deseas borrar permanentemente el sitio web?`)) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadProjects();
      }
    } catch (e) {
      alert("Error al borrar: " + e.message);
    }
  }
}

async function loadProjects() {
  try {
    const res = await fetch("/api/projects");
    const data = await res.json();
    const list = document.getElementById("projectsList");
    list.innerHTML = "";

    data.projects.forEach((p) => {
      const li = document.createElement("li");
      li.className = "project-item";
      li.innerHTML = `
        <div class="project-info">
          <h4>${p.name}</h4>
          <span>URL: <a href="${p.urlPath}" target="_blank" style="color:var(--cyan); text-decoration:none;">${p.urlPath}</a></span>
        </div>
        <div style="display: flex; gap: 10px;">
          <a href="${p.urlPath}" target="_blank" class="btn btn-secondary" style="font-size:0.8rem; padding:6px 12px;">
            <i class="fa-solid fa-globe"></i> Ver Web
          </a>
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:6px 12px; background: #ef4444; color: white;" onclick="deleteProject('${p.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (e) { console.warn('[Dashboard]', e.message); }
}

  // 7. Configuración de Alertas (Telegram / Discord)
async function loadConfig() {
  try {
    const res = await fetch("/api/config");
    const cfg = await res.json();

    document.getElementById("cfgTelegramEnabled").checked =
      cfg.telegram?.enabled || false;
    document.getElementById("cfgTelegramToken").value =
      cfg.telegram?.botToken || "";
    document.getElementById("cfgTelegramChatId").value =
      cfg.telegram?.chatId || "";

    document.getElementById("cfgDiscordEnabled").checked =
      cfg.discord?.enabled || false;
    document.getElementById("cfgDiscordWebhook").value =
      cfg.discord?.webhookUrl || "";

    document.getElementById("cfgThermalMax").value =
      cfg.thermal?.maxTemperatureC || 41;
  } catch (e) { console.warn('[Dashboard]', e.message); }
}

const btnSaveConfig = document.getElementById("btnSaveConfig");
if (btnSaveConfig) btnSaveConfig.addEventListener("click", async () => {
  const cfg = {
    serverName: "Mini Servidor Android",
    thermal: {
      enabled: true,
      maxTemperatureC:
        parseInt(document.getElementById("cfgThermalMax").value, 10) || 41,
      cooldownTemperatureC: 36,
    },
    telegram: {
      enabled: document.getElementById("cfgTelegramEnabled").checked,
      botToken: document.getElementById("cfgTelegramToken").value.trim(),
      chatId: document.getElementById("cfgTelegramChatId").value.trim(),
    },
    discord: {
      enabled: document.getElementById("cfgDiscordEnabled").checked,
      webhookUrl: document.getElementById("cfgDiscordWebhook").value.trim(),
    },
  };

  const res = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  const data = await res.json();
  if (data.success) alert("✅ Ajustes y canales de alertas guardados.");
});

const btnTestAlert = document.getElementById("btnTestAlert");
if (btnTestAlert) btnTestAlert.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/alerts/test", { method: "POST" });
    const data = await res.json();
    if (data.success)
      alert("✅ Mensaje de prueba enviado exitosamente a tus canales activos.");
    else
      alert(
        "❌ Error al enviar alerta:\n" + (data.error || "Verifica tus tokens y Chat ID"),
      );
  } catch (e) {
    alert("❌ Error de conexión: " + e.message);
  }
});

// 8. Sistema de Temas Visuales
const THEMES = [
  { id: "", name: "Cyberpunk" },
  { id: "theme-oled", name: "OLED Minimal" },
  { id: "theme-emerald", name: "Emerald Matrix" },
  { id: "theme-nordic", name: "Nordic Ice" },
];
let currentThemeIndex = 0;

function applyTheme(index) {
  currentThemeIndex = index % THEMES.length;
  const theme = THEMES[currentThemeIndex];

  document.body.className = theme.id;
  const label = document.getElementById("themeNameText");
  if (label) label.innerText = `Tema: ${theme.name}`;
  localStorage.setItem("miniserver_theme", theme.id);
}

document.getElementById("btnToggleTheme")?.addEventListener("click", () => {
  applyTheme(currentThemeIndex + 1);
});

// 9. Inicialización
document.addEventListener("DOMContentLoaded", () => {
  const savedThemeId = localStorage.getItem("miniserver_theme") || "";
  const foundIndex = THEMES.findIndex((t) => t.id === savedThemeId);
  applyTheme(foundIndex >= 0 ? foundIndex : 0);

  initChart();
  fetchTelemetry();
  loadTasks();
  setInterval(fetchTelemetry, 2000);
});

// Reloj en tiempo real
function updateClock() {
    const clock = document.getElementById('liveClock');
    if (clock) {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    }
}
setInterval(updateClock, 1000);
updateClock();

// =========================================================
// 10. MÓDULO CAZADOR DE OFERTAS PRO (CATÁLOGO EN VIVO)
// =========================================================
let currentOffersPage = 1;
let offerSearchDebounceTimer = null;

async function loadOffersStats() {
  try {
    const res = await fetch("/api/offers/stats");
    const stats = await res.json();
    const countEl = document.getElementById("offersTotalCount");
    const minHistoryEl = document.getElementById("offersMinHistoryCount");
    if (countEl) countEl.innerText = stats.totalProductos ? stats.totalProductos.toLocaleString('es-CO') : "0";
    if (minHistoryEl) minHistoryEl.innerText = stats.totalAlertas ? stats.totalAlertas.toLocaleString('es-CO') : "0";

    // Actualizar dinámicamente las opciones del selector de tiendas con sus contadores reales
    const storeFilter = document.getElementById("offerStoreFilter");
    if (storeFilter && stats.porTienda) {
      const selectedVal = storeFilter.value;
      const tiendasConOfertas = Object.keys(stats.porTienda).sort((a, b) => a.localeCompare(b));
      let optionsHtml = `<option value="">Todas las Tiendas (${stats.totalProductos || 0} productos)</option>`;
      const tiendasExcluidas = ['Éxito Supermercado', 'Decathlon', 'Éxito supermercado'];
      for (const t of tiendasConOfertas) {
        if (tiendasExcluidas.includes(t)) continue;
        const count = stats.porTienda[t];
        const isSel = selectedVal === t ? "selected" : "";
        optionsHtml += `<option value="${t}" ${isSel}>${t} (${count} prod.)</option>`;
      }
      storeFilter.innerHTML = optionsHtml;
    }

    // Actualizar dinámicamente las opciones del selector de categorías
    const categoryFilter = document.getElementById("offerCategoryFilter");
    if (categoryFilter && stats.porCategoria) {
      const selectedCat = categoryFilter.value;
      
      const importancia = {
        "Tecnología": 1,
        "Electrodomésticos": 2,
        "Vehículos": 3,
        "Hogar": 4,
        "Deportes": 5,
        "Herramientas": 6,
        "Ropa y Moda": 7,
        "Vuelos y Viajes": 8
      };
      
      const categoriasConOfertas = Object.keys(stats.porCategoria).sort((a, b) => {
        const pesoA = importancia[a] || 99;
        const pesoB = importancia[b] || 99;
        if (pesoA === pesoB) return a.localeCompare(b);
        return pesoA - pesoB;
      });
      
      let totalCategoriasValidas = 0;
      let catOptionsHtml = '';
      for (const c of categoriasConOfertas) {
        if (!c || c.trim() === '') continue; // Ignorar nulos/vacíos
        const count = stats.porCategoria[c];
        if (count === 0) continue;
        totalCategoriasValidas++;
        const isSel = selectedCat === c ? "selected" : "";
        catOptionsHtml += `<option value="${c}" ${isSel}>${c} (${count} prod.)</option>`;
      }
      
      const allCatText = `Todas las Categorías (${totalCategoriasValidas})`;
      categoryFilter.innerHTML = `<option value="">${allCatText}</option>` + catOptionsHtml;
    }
  } catch (e) {
    console.warn("Error cargando estadísticas de ofertas:", e);
  }
}

async function loadOffers(page = 1) {
  currentOffersPage = page;
  const grid = document.getElementById("offersGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="offers-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Consultando base de datos SQLite en tiempo real...</p>
    </div>
  `;

  const busqueda = (document.getElementById("offerSearchInput")?.value || "").trim();
  const tienda = document.getElementById("offerStoreFilter")?.value || "";
  const categoria = document.getElementById("offerCategoryFilter")?.value || "";
  const ciudad = document.getElementById("offerCityFilter")?.value || "";
  const orden = document.getElementById("offerSortFilter")?.value || "reciente";
  const soloMinimo = document.getElementById("offerMinHistoricalToggle")?.checked ? "true" : "false";

  const params = new URLSearchParams({
    pagina: page,
    limite: 12,
    busqueda,
    tienda,
    categoria,
    ciudad,
    orden,
    soloMinimo
  });

  try {
    const res = await fetch(`/api/offers?${params.toString()}`);
    const data = await res.json();
    renderOffers(data);
  } catch (e) {
    grid.innerHTML = `
      <div class="offers-empty">
        <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
        <h3>Error al consultar el catálogo</h3>
        <p class="text-muted">${e.message}</p>
      </div>
    `;
  }
}

let historyChartInstance = null;

async function showOfferHistory(productoId, titulo) {
  const modal = document.getElementById("historyModal");
  const titleEl = document.getElementById("modalHistoryTitle");
  const statsEl = document.getElementById("modalHistoryStats");
  if (!modal) return;

  if (titleEl) titleEl.innerText = titulo;
  modal.classList.add("open");

  try {
    const res = await fetch(`/api/offers/${productoId}/history`);
    const data = await res.json();
    const history = data.history || [];

    const ctx = document.getElementById("offerHistoryChart").getContext("2d");
    if (historyChartInstance) {
      historyChartInstance.destroy();
    }

    const labels = history.map(h => {
      const d = new Date(h.fecha);
      return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    });
    const prices = history.map(h => h.precio);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    historyChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels.length > 0 ? labels : ["Inicio"],
        datasets: [{
          label: "Precio en Pesos ($ COP)",
          data: prices.length > 0 ? prices : [0],
          borderColor: "#34d399",
          backgroundColor: "rgba(52, 211, 153, 0.15)",
          borderWidth: 2.5,
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#34d399",
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` $ ${Number(context.raw).toLocaleString('es-CO')} COP`
            }
          }
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: { color: "rgba(255,255,255,0.6)", font: { size: 10 } }
          },
          y: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "rgba(255,255,255,0.6)",
              font: { size: 11 },
              callback: (val) => `$ ${Number(val).toLocaleString('es-CO')}`
            }
          }
        }
      }
    });

    if (statsEl) {
      statsEl.innerHTML = `
        <div><span class="text-muted">Observaciones:</span> <strong class="mono">${history.length}</strong></div>
        <div><span class="text-muted">Mínimo:</span> <strong class="mono" style="color: #34d399;">$ ${minPrice ? minPrice.toLocaleString('es-CO') : 0}</strong></div>
        <div><span class="text-muted">Máximo:</span> <strong class="mono" style="color: #f87171;">$ ${maxPrice ? maxPrice.toLocaleString('es-CO') : 0}</strong></div>
      `;
    }
  } catch (e) {
    console.error("Error al graficar historial:", e);
  }
}

document.getElementById("btnCloseHistoryModal")?.addEventListener("click", () => {
  document.getElementById("historyModal")?.classList.remove("open");
});

function renderOffers(data) {
  const grid = document.getElementById("offersGrid");
  const pagination = document.getElementById("offersPagination");
  if (!data || !data.ofertas || data.ofertas.length === 0) {
    grid.innerHTML = `
      <div class="offers-empty" style="text-align: center; padding: 40px 20px;">
        <i class="fa-solid fa-building-user" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 15px;"></i>
        <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No hay leads registrados todavía</h3>
        <p class="text-muted">La base de datos SQLite se ha reiniciado limpiamente (0 residuos). En cuanto el adaptador capture propietarios directos, se listarán aquí en tiempo real con sus teléfonos.</p>
      </div>
    `;
    if (pagination) pagination.innerHTML = "";
    return;
  }

  let html = "";
  const tiendasExcluidas = ['Éxito Supermercado', 'Decathlon', 'Éxito supermercado'];

  for (const ofr of data.ofertas) {
    if (tiendasExcluidas.includes(ofr.tienda)) continue;

    const precioActual = ofr.precioActual || ofr.precio_actual || 0;
    const precioActualFmt = Number(precioActual).toLocaleString("es-CO");
    const portalEscapado = escaparHtml(ofr.tienda || "Finca Raíz");
    const tituloHtml = escaparHtml(ofr.titulo || "");
    const nombreContacto = escaparHtml(ofr.nombreContacto || "Propietario Particular");
    const telefonoContacto = escaparHtml(ofr.telefono || "En verificación");
    const ciudadBarrio = `${escaparHtml(ofr.barrio || "")}, ${escaparHtml(ofr.ciudad || "Colombia")}`.replace(/^, /, "");
    const categoriaHtml = escaparHtml(ofr.categoria || "Inmueble");

    html += `
      <div class="offer-card" style="border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div>
          <div class="offer-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span class="offer-store-badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700;">
              <i class="fa-solid fa-user-check"></i> PROPIETARIO DIRECTO
            </span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
              ${portalEscapado}
            </span>
          </div>
          <h4 class="offer-title" title="${tituloHtml}" style="font-size: 0.95rem; font-weight: 600; margin-bottom: 8px;">${tituloHtml}</h4>
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; font-size: 0.85rem;">
            <div style="color: var(--text-muted); margin-bottom: 4px;">
              <i class="fa-solid fa-location-dot" style="color: #ef4444; width: 16px;"></i> <strong>${ciudadBarrio}</strong>
            </div>
            <div style="color: var(--text-muted); margin-bottom: 4px;">
              <i class="fa-solid fa-user" style="color: #3b82f6; width: 16px;"></i> Dueño: <strong style="color: var(--text-color);">${nombreContacto}</strong>
            </div>
            <div style="color: var(--text-muted);">
              <i class="fa-solid fa-phone" style="color: #10b981; width: 16px;"></i> Tel / WhatsApp: <strong class="mono" style="color: #10b981;">${telefonoContacto}</strong>
            </div>
          </div>

          <div class="offer-price-box">
            <span class="offer-current-price" style="color: #10b981; font-size: 1.25rem;">$ ${precioActualFmt} COP</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">(${categoriaHtml})</span>
          </div>
        </div>
        <div class="offer-card-actions" style="margin-top: 12px;">
          <a href="${ofr.enlace}" target="_blank" rel="noopener noreferrer" class="offer-btn-buy" style="background: var(--primary-color); text-align: center; justify-content: center;">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Anuncio Original
          </a>
        </div>
      </div>
    `;
  }
  grid.innerHTML = html;

  // Renderizar Paginación
  if (pagination && data.paginas > 1) {
    let pagHtml = "";
    if (data.pagina > 1) {
      pagHtml += `<button class="btn btn-secondary btn-sm" onclick="loadOffers(${data.pagina - 1})"><i class="fa-solid fa-chevron-left"></i> Anterior</button>`;
    }
    pagHtml += `<span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">Página ${data.pagina} de ${data.paginas} (${data.total} gangas)</span>`;
    if (data.pagina < data.paginas) {
      pagHtml += `<button class="btn btn-secondary btn-sm" onclick="loadOffers(${data.pagina + 1})">Siguiente <i class="fa-solid fa-chevron-right"></i></button>`;
    }
    pagination.innerHTML = pagHtml;
  } else if (pagination) {
    pagination.innerHTML = "";
  }
}

// Listeners de búsqueda y filtros
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("offerSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(offerSearchDebounceTimer);
      offerSearchDebounceTimer = setTimeout(() => loadOffers(1), 300);
    });
  }

  const storeFilter = document.getElementById("offerStoreFilter");
  if (storeFilter) storeFilter.addEventListener("change", () => loadOffers(1));

  const catFilter = document.getElementById("offerCategoryFilter");
  if (catFilter) catFilter.addEventListener("change", () => loadOffers(1));

  const cityFilter = document.getElementById("offerCityFilter");
  if (cityFilter) cityFilter.addEventListener("change", () => loadOffers(1));

  const sortFilter = document.getElementById("offerSortFilter");
  if (sortFilter) sortFilter.addEventListener("change", () => loadOffers(1));

  const minToggle = document.getElementById("offerMinHistoricalToggle");
  if (minToggle) minToggle.addEventListener("change", () => loadOffers(1));

  const btnRefresh = document.getElementById("btnRefreshOffers");
  if (btnRefresh) btnRefresh.addEventListener("click", () => {
    loadOffersStats();
    loadOffers(1);
  });

  const btnExport = document.getElementById("btnExportExcel");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      window.open("/api/leads/export-csv", "_blank");
    });
  }

  // Modal Control Scrapers
  const btnConfigScrapers = document.getElementById("btnConfigScrapers");
  const modalScraperConfig = document.getElementById("scraperConfigModal");
  const btnCloseScraperConfig = document.getElementById("btnCloseScraperConfig");
  const btnCancelScraperConfig = document.getElementById("btnCancelScraperConfig");
  const btnSaveScraperConfig = document.getElementById("btnSaveScraperConfig");
  const scraperConfigTableBody = document.getElementById("scraperConfigTableBody");
  
  let currentScraperConfig = {};

  const closeScraperModal = () => { if (modalScraperConfig) modalScraperConfig.style.display = "none"; };
  
  if (btnCloseScraperConfig) btnCloseScraperConfig.addEventListener("click", closeScraperModal);
  if (btnCancelScraperConfig) btnCancelScraperConfig.addEventListener("click", closeScraperModal);
  
  if (btnConfigScrapers) {
    btnConfigScrapers.addEventListener("click", async () => {
      if (!modalScraperConfig) return;
      scraperConfigTableBody.innerHTML = '<tr><td colspan="3">Cargando configuración...</td></tr>';
      modalScraperConfig.style.display = "flex";
      try {
        const res = await fetch('/api/scrapers/config');
        const data = await res.json();
        currentScraperConfig = data.config || {};
        renderScraperConfig();
      } catch (e) {
        scraperConfigTableBody.innerHTML = '<tr><td colspan="3">Error al cargar la configuración.</td></tr>';
      }
    });
  }

  function renderScraperConfig() {
    // Si no hay info, llenamos con todas las tiendas del sistema
    const tiendasBasicas = [
      'mercadolibre', 'alkosto', 'ktronix', 'falabella', 'homecenter', 
      'exito', 'dafiti', 'jumbo', 'tauret_gamer', 'remates', 
      'vuelos_latam', 'facebook_marketplace', 'amazon', 'invicta', 
      'temu', 'aliexpress'
    ];
    tiendasBasicas.forEach(t => {
      if (!currentScraperConfig[t]) currentScraperConfig[t] = { activo: true, frecuencia: '15m' };
    });

    let html = '';
    Object.keys(currentScraperConfig).sort().forEach(tienda => {
      const conf = currentScraperConfig[tienda];
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px; font-weight: bold;">${tienda}</td>
          <td style="padding: 10px;">
            <label class="switch">
              <input type="checkbox" id="cfg_act_${tienda}" ${conf.activo ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
          <td style="padding: 10px;">
            <select id="cfg_frec_${tienda}" class="input-field" style="width: 120px;">
              <option value="15m" ${conf.frecuencia === '15m' ? 'selected' : ''}>15 min</option>
              <option value="1h" ${conf.frecuencia === '1h' ? 'selected' : ''}>1 Hora</option>
              <option value="8h" ${conf.frecuencia === '8h' ? 'selected' : ''}>3x al Día</option>
              <option value="diario" ${conf.frecuencia === 'diario' ? 'selected' : ''}>1x al Día</option>
            </select>
          </td>
        </tr>
      `;
    });
    scraperConfigTableBody.innerHTML = html;
  }

  if (btnSaveScraperConfig) {
    btnSaveScraperConfig.addEventListener("click", async () => {
      const btn = btnSaveScraperConfig;
      btn.disabled = true;
      btn.innerText = "Guardando...";
      
      const tiendas = Object.keys(currentScraperConfig);
      for (const tienda of tiendas) {
        const activo = document.getElementById(`cfg_act_${tienda}`)?.checked ?? true;
        const frecuencia = document.getElementById(`cfg_frec_${tienda}`)?.value ?? '15m';
        
        try {
          await fetch('/api/scrapers/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tienda, activo, frecuencia })
          });
        } catch(e) {
          console.error("Error guardando", tienda, e);
        }
      }
      
      btn.innerText = "Guardar Cambios";
      btn.disabled = false;
      closeScraperModal();
      alert("Configuración de scrapers guardada correctamente en SQLite.");
    });
  }

  // Carga inicial de ofertas y tiendas
  loadOffersStats();
  loadOffers(1);
});


// Binding for the Escanear Ahora button
document.addEventListener('DOMContentLoaded', () => {
  const btnEscanear = document.getElementById('btnEscanearAhora');
  const msgEscanear = document.getElementById('msgEscanear');
  
  if (btnEscanear) {
    btnEscanear.addEventListener('click', async () => {
      btnEscanear.disabled = true;
      btnEscanear.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Iniciando Escaneo...';
      
      try {
        const res = await fetch('/api/offers/sync-now', { method: 'POST' });
        const data = await res.json();
        
        if (data.status === 'ok') {
          msgEscanear.textContent = '¡Escaneo Forzado Iniciado! El bot está barriendo las tiendas en segundo plano. Te notificará por Telegram los resultados.';
          msgEscanear.style.color = '#4ade80';
          msgEscanear.style.display = 'block';
        } else {
          throw new Error('Error en el servidor');
        }
      } catch (e) {
        console.error(e);
        msgEscanear.textContent = 'Fallo al forzar el escaneo. Revisa los logs.';
        msgEscanear.style.color = '#ef4444';
        msgEscanear.style.display = 'block';
      }
      
      setTimeout(() => {
        btnEscanear.disabled = false;
        btnEscanear.innerHTML = '<i class="fa-solid fa-bolt"></i> Escanear Ahora (Forzar B2B Brain)';
        setTimeout(() => msgEscanear.style.display = 'none', 10000);
      }, 2000);
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const btnStats = document.getElementById('btnConfigScrapersStats');
  if (btnStats) {
    btnStats.addEventListener('click', () => {
      const btnMain = document.getElementById('btnConfigScrapers');
      if (btnMain) btnMain.click();
    });
  }
});
