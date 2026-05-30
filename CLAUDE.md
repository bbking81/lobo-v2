# Lobo Entrerriano Estadísticas — v2 (Next.js)

## Qué es este proyecto
Sitio web de estadísticas de **Gimnasia y Esgrima de Concepción del Uruguay** ("GEC" o "el Lobo").
Muestra partidos, jugadores, formaciones tácticas, línea de tiempo de eventos, competencias y más.
El dueño/cliente es Alexis. El objetivo es un sitio de calidad premium, potencialmente para vender como producto.

**Sitio actual (referencia de diseño):** https://loboentrerriano.com
**Referencia de diseño premium:** https://www.flashscore.com.ar

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend (este repo) | Next.js 16 + TypeScript + Tailwind CSS |
| Backend API | FastAPI (Python) — servidor existente |
| Base de datos | PostgreSQL |
| Servidor | VPS gec@187.77.240.174 |
| Hosting frontend (futuro) | Vercel |

---

## Backend API

**Base URL:** `https://loboentrerriano.com`

### Endpoint principal
```
GET /api/db
```
Devuelve TODOS los datos públicos en un solo JSON:
- `partidos` — lista de partidos publicados
- `jugadores` — jugadores del plantel
- `equipos` — equipos rivales
- `competencias` — torneos
- `dts` — directores técnicos GEC
- `dtRivales`, `jugadoresRivales`, `estadios`, `arbitros`, `temporadas`
- `config` — configuración general (escudo GEC)
- `proximoPartido` — próximo partido

### Otros endpoints
```
GET /api/jugadores
GET /api/partidos/torneos-sin-vincular
GET /api/participaciones/{partido_id}
GET /api/dts
GET /api/arbitros
GET /api/estadios
```

---

## Estructura de datos clave

### Partido
```typescript
{
  id: number
  fecha: string           // "2026-05-17"
  hora: string            // "15:30"
  local: string
  visitante: string
  gl: number              // goles local
  gv: number              // goles visitante
  gecGF: number           // goles a favor GEC
  gecGC: number           // goles en contra GEC
  torneo: string
  estadio: string
  resultado: string       // "Victoria" | "Empate" | "Derrota"
  planillaGec: any[]      // jugadores GEC con stats
  planillaRival: any[]
  eventos: any[]          // timeline de eventos
  formacionGec: string    // "4-3-3"
  formacionRival: string
  kitGec: object
  kitRival: object
  escudoGec: string
  escudoRival: string
  publicado: boolean
}
```

### Jugador
```typescript
{
  id: number
  apellido: string
  nombres: string
  nombre: string          // "Apellido, Nombres"
  camiseta: number
  puesto: string
  foto: string            // URL PNG transparente
  goles: number
  partidos: number
}
```

### Evento (timeline)
```typescript
{
  min: number
  tipo: string            // "gol" | "tarjeta-amarilla" | "tarjeta-roja" | "cambio"
  jugador: string
  jugador2: string        // en cambios: el que entra
  equipo: string          // "local" | "visitante"
  detalle: string
}
```

---

## Páginas a construir

| Ruta | Descripción | Prioridad |
|------|-------------|-----------|
| `/` | Inicio: próximo partido + últimos resultados | Alta |
| `/partido/[slug]` | Detalle partido (score, timeline, formación) | **Primera** |
| `/jugadores` | Plantel | Media |
| `/jugador/[id]` | Perfil jugador | Media |
| `/competencias` | Lista competencias | Media |
| `/goleadores` | Tabla goleadores | Baja |

---

## Decisiones de diseño ya tomadas

### General
- Diseño base = loboentrerriano.com actual, mejorar estéticamente con el tiempo
- Paleta: azul oscuro `#1e3a5f` (color GEC), blanco, grises
- Tipografía: **DM Sans**
- Mobile-first

### Formación táctica (SVG)
- Campo gris Flashscore: fondo `#f5f5f5`, campo `#efefef`, líneas `#c8c8c8` 1.5px
- Sin franjas verdes
- Max-width 750px
- D-arco (medialuna): forma elíptica achatada
- Landscape SVG: 780×440 | Portrait SVG: 370×750
- GEC siempre a la izquierda (landscape) / arriba (portrait)

### Jugadores en formación
- Fotos SIN recorte circular — imagen directa 44×44px estilo Flashscore
- Sin foto → círculo de color del kit + número
- Label: badge blanco semi-transparente con `número + apellido` (sin inicial del nombre)
- Iconos: ⚽ arriba-izq, tarjeta arriba-der, cambio abajo-izq
- Fotos: PNG fondo transparente en `https://loboentrerriano.com/static/uploads/HASH_nobg.png`

### Fotos de jugadores
- Formato ideal: busto (cabeza+hombros), fondo transparente, mínimo 300×300px
- Ya procesadas con rembg (fondo removido) en el servidor

### Timeline
- Sin escudos ni nombres de equipo en el header
- Mobile: fuente reducida, nombre abreviado

---

## Convenciones de código

- Componentes: `src/components/`
- Páginas: `src/app/` (App Router)
- Tipos: `src/types/`
- API calls: `src/lib/api.ts`
- Estilos: Tailwind CSS
- Componentes en PascalCase, archivos en kebab-case

---

## Notas para trabajar con Alexis

- Pide cambios de diseño/estética en conversación — implementar directamente sin preguntar demasiado
- El admin panel (`admin.html`) sigue siendo el sistema de carga — este repo es SOLO el frontend público
- No tocar autenticación ni admin
- Cuando algo no está claro, proponer una opción y preguntar si le gusta
- El sitio debe verse y sentirse como Flashscore pero para fútbol regional argentino
