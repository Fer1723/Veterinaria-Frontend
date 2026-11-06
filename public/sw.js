// Service worker MÍNIMO de Dogs & Cats.
// Sirve para que el sistema se pueda "instalar" como app en la tablet o el celular.
// A propósito NO guarda nada en caché: así siempre se usa la versión más nueva
// publicada en Render. Si no hay internet, muestra un aviso claro en vez de un error.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return; // solo las aperturas de página
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión · Dogs & Cats</title>
          <style>body{font-family:system-ui,sans-serif;background:#eef8f6;color:#1e293b;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
          .c{background:#fff;border-radius:28px;padding:32px;max-width:380px;box-shadow:0 10px 30px rgba(13,148,136,.15)}h1{color:#0d9488;margin:.2em 0}button{margin-top:16px;background:#0d9488;color:#fff;border:0;border-radius:14px;padding:12px 22px;font-weight:700;font-size:16px}</style></head>
          <body><div class="c"><div style="font-size:48px">🐾</div><h1>Sin conexión a internet</h1><p>El sistema necesita internet para guardar citas y ventas. Revisa el Wi-Fi y vuelve a intentar.</p><button onclick="location.reload()">Reintentar</button></div></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } },
        ),
    ),
  );
});

// ===== Notificaciones al teléfono (Web Push) =====
// Llega una notificación del servidor: se muestra SIEMPRE (iPhone lo exige).
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Dogs & Cats", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Dogs & Cats";
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body: data.body || "",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: data.tag || "dogs-cats",
        renotify: true,
        data: { url: data.url || "/" },
      }),
      // Si la app está abierta, avisarle para que actualice citas y avisos al instante
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((ventanas) => ventanas.forEach((v) => v.postMessage({ tipo: "push", title, body: data.body || "" }))),
    ]),
  );
});

// Al tocar la notificación: abrir la app (o enfocarla si ya estaba abierta) en la pantalla indicada.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.location.origin)) {
          return v.focus().then((c) => (c && "navigate" in c ? c.navigate(url) : c));
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
