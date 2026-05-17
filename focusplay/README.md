# FocusPlay 🎮

Aplicación web adaptativa para niños con TEA Grado 1.
Desarrollada para el curso de Interacción Humano Máquina · 2026.

---

## 🚀 Cómo correr el proyecto (paso a paso)

### 1. Instalar dependencias

Abre tu terminal en la carpeta `focusplay/` y ejecuta:

```bash
npm install
```

### 2. Configurar la API key de Anthropic

Abre el archivo `.env.local` y reemplaza el valor:

```
ANTHROPIC_API_KEY=sk-ant-TU_KEY_AQUÍ
```

> Obtén tu key gratis en: https://console.anthropic.com/
> Sin la key, la IA devuelve mensajes estáticos (la app funciona igual).

### 3. Correr en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📁 Estructura del proyecto

```
focusplay/
├── app/
│   ├── page.tsx              ← Pantalla de inicio
│   ├── concentracion/
│   │   └── page.tsx          ← Módulo de memoria y concentración
│   ├── amigos/
│   │   └── page.tsx          ← Módulo de habilidades sociales
│   ├── api/ia/
│   │   └── route.ts          ← API route: IA de Anthropic
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── store.ts              ← Perfil del usuario + motor de IA básica
│   ├── memory-data.ts        ← Datos del juego de memoria (3 niveles)
│   └── scenarios.ts          ← 5 escenarios sociales
├── .env.local                ← API key (NO subir a GitHub)
└── package.json
```

---

## 🌐 Publicar en Vercel (gratis)

1. Sube el proyecto a GitHub (sin `.env.local`)
2. Ve a https://vercel.com → "New Project" → importa tu repo
3. En **Environment Variables** agrega:
   - `ANTHROPIC_API_KEY` = tu key
4. Haz clic en **Deploy**. ¡Listo!

---

## 🧠 Cómo funciona la IA

### IA básica (sin API key)
- Mide el **tiempo de respuesta** del niño en cada actividad
- Detecta si hay muchos **errores consecutivos**
- Ajusta automáticamente la **dificultad** (niveles 1-3)
- Guardado en `localStorage` del navegador

### IA de Anthropic (con API key)
- En el módulo **Amigos**, después de cada respuesta, llama a Claude
- Claude genera feedback personalizado de máximo 30 palabras
- Adaptado al lenguaje de un niño de 7 años
- Si no hay conexión, usa mensajes estáticos de respaldo

---

## 🎮 Funcionalidades implementadas

### Módulo 1 – Concentración
- [x] Juego de memoria con emojis grandes y coloridos
- [x] 3 niveles de dificultad (4 pares, 4 pares difíciles, 6 pares)
- [x] Timer visible (90/75/70 segundos según nivel)
- [x] Animación de destello al encontrar un par
- [x] Sistema de estrellas y gemas
- [x] Pantalla de recompensa con animación
- [x] Pantalla de game over si se acaba el tiempo

### Módulo 2 – Amigos
- [x] 5 escenarios sociales con situaciones reales
- [x] Opciones con emojis expresivos (sin texto difícil)
- [x] Feedback inmediato visual (verde/rojo)
- [x] Feedback personalizado con IA de Anthropic
- [x] Progreso con puntos de escenario
- [x] Pantalla de resultado final con puntaje

### Sistema de IA adaptativa
- [x] Perfil de usuario guardado en localStorage
- [x] Detección de distracción por tiempo de respuesta
- [x] Ajuste automático de dificultad (niveles 1-3)
- [x] Mensaje explicativo al niño del ajuste
- [x] Gemas acumulativas entre sesiones

---

## 📋 Para la presentación

La app está lista para primera revisión. Los próximos pasos serían:
- Agregar más escenarios sociales
- Panel de padres con reporte semanal
- Ejercicio de "destello visual" (TOCAR)
- Más tipos de juegos en el módulo de concentración
