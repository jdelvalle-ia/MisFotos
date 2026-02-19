# MisFotos - Gestión de Galerías Multimedia

Aplicación web moderna para la catalogación y búsqueda inteligente de fotos utilizando IA (Google Gemini).

## Características

- **Dashboard**: Vista general con estadísticas.
- **Galería Inteligente**: Filtrado por metadatos (escena, ánimo, color, etc.).
- **Análisis AI**: Integración con Google Vision/Gemini para etiquetado automático.
- **Modo Oscuro/Claro**: Interfaz adaptable.
- **Local First**: Escaneo de directorios locales (simulado en Vercel, real en local).

## Configuración Local

1.  **Clonar el repositorio**:
    ```bash
    git clone <repo-url>
    cd mis-fotos
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo y añade tu API Key de Google.
    ```bash
    cp .env.local.example .env.local
    ```
    Edita `.env.local` y añade `GOOGLE_API_KEY`.

4.  **Ejecutar en desarrollo**:
    ```bash
    npm run dev
    ```
    Visita `http://localhost:3000`.

## Despliegue

### Vercel (Recomendado)

1.  Instala Vercel CLI: `npm i -g vercel`
2.  Ejecuta `vercel` desde la raíz del proyecto.
3.  Configura las variables de entorno en el dashboard de Vercel.

### GitHub

1.  Sube el código a un repositorio de GitHub.
2.  Conecta tu repositorio a Vercel para despliegues automáticos en cada push.

## Estructura del Proyecto

- `src/app`: Rutas y páginas (App Router).
- `src/components`: Componentes reutilizables.
- `src/lib`: Utilidades y servicios (IA, CSV).
- `src/types`: Definiciones de TypeScript.
