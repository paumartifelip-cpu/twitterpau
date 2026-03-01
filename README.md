# Guía de Despliegue: [TWITTTER PAU] 🚀

¡Felicidades! Tu aplicación está lista para que todo el mundo la vea. Sigue estos pasos para subirla a internet gratis.

## Paso 1: Subir a GitHub
1. Entra en [github.com](https://github.com/) y crea un nuevo repositorio llamado `twitterpau`.
2. Sube tus archivos (`index.html`, `style.css`, `script.js`, `config.js`, `_redirects`). 
   * *Truco:* Puedes simplemente arrastrarlos a la web de GitHub si no quieres usar la consola.

## Paso 2: Desplegar en Cloudflare Pages
1. Entra en el panel de [Cloudflare](https://dash.cloudflare.com/) y ve a **Workers & Pages**.
2. Haz clic en **Create application** -> **Pages** -> **Connect to Git**.
3. Selecciona tu repositorio `twitterpau`.
4. En **Build settings**:
   * **Framework preset**: None (o Static HTML).
   * **Build command**: (Déjalo vacío).
   * **Build output directory**: (Déjalo vacío o pon `./`).
5. Haz clic en **Save and Deploy**.

¡Y listo! Cloudflare te dará una dirección web (ej: `twitterpau.pages.dev`) para que compartas tu creación.

---

## 🛠️ Cómo funciona por dentro
- **SPA:** Todo ocurre en una sola página. Cambiamos de "pantalla" usando el `#` en la URL.
- **Supabase:** Es tu servidor y base de datos. Guarda los mensajes y los likes.
- **Identidad:** Usamos tu `localStorage` para generar un ID único. Así la app sabe qué mensajes son tuyos para dejarte borrarlos.
- **Seguridad:** Las políticas RLS de Supabase protegen tus datos.