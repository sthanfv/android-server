# Arquitectura del Sistema: Ofertas Hunter Pro (B2B Data Engine)

Este documento detalla el flujo de la información, desde la extracción en crudo hasta la entrega de la calificación de confianza (*Confidence Score*).

## Diagrama de Flujo (Data Pipeline)

```mermaid
graph TD
    %% Extractores (Scrapers)
    subgraph Capa 1: Extracción (Scraping)
        A[Adaptadores: Mercadolibre, Alkosto, etc.]
        B[DOM / API Response]
        C[Normalización JSON]
        A --> B --> C
    end

    %% Capa de Persistencia (SQLite)
    subgraph Capa 2: Persistencia (db.js)
        C -->|Guarda Oferta Cruda| D[(SQLite: productos)]
        C -->|Guarda Precio Actual| E[(SQLite: historial_precios)]
    end

    %% Capa Analítica (Cerebro Estadístico)
    subgraph Capa 3: Análisis (analytics.js)
        F{¿Es producto nuevo?}
        D --> F
        
        F -->|Sí| G[Score Base: 30 pts. Riesgo Alto]
        
        F -->|No| H[Extraer Historial Limpio 30 días]
        E --> H
        
        H --> I[Cálculo de Mediana]
        H --> J[Desviación Estándar]
        
        I --> K(Z-Score)
        J --> K
        
        K --> L{Generar Confidence Score}
    end

    %% Capa de Salida
    subgraph Capa 4: Entrega B2B (Exportación)
        L -->|Score > 85| M[Exportar JSON / API]
        L -->|Score > 85| N[Notificar Telegram VIP]
        L -->|Score < 85| O[Descartar silenciosamente]
    end
```

## Estructura del "Confidence Score"
El sistema evalúa del 0 al 100.
*   **0 - 50:** Oferta falsa o descuento inflado (Marketing).
*   **50 - 70:** Descuento real pero común.
*   **70 - 85:** Oferta sólida, buena oportunidad.
*   **85 - 100:** Anomalía estadística extrema (Z-Score < -2.0). Posible error de precio.
