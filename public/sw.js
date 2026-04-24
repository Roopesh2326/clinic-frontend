// ─── SERVICE WORKER — Dr. Somnath Clinic ─────────────────────────────────────
// Strategy:
//   • Cache-first  → static assets (JS, CSS, images, fonts)
//   • Network-first → API calls to clinic backend
//   • Stale-while-revalidate → pages / HTML documents

const CACHE_VERSION    = "v1.2.0";
const STATIC_CACHE     = `somnath-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE    = `somnath-dynamic-${CACHE_VERSION}`;
const API_CACHE        = `somnath-api-${CACHE_VERSION}`;

// Assets to pre-cache on install (shell)
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  // Google Fonts (fetched on first load, then cached)
  // Add your built JS/CSS bundles here if you know the names,
  // or let the dynamic cache handle them automatically
];

// ─── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing…");
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Use individual requests so one bad asset doesn't break the whole install
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) =>
              console.warn(`[SW] Failed to cache ${url}:`, err)
            )
          )
        );
      })
      .then(() => {
        console.log("[SW] Installed — skipping waiting");
        return self.skipWaiting(); // Activate immediately
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname === 'clinic-backend-mxto.onrender.com') {
    return;
  }
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating…");
  const VALID_CACHES = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !VALID_CACHES.includes(name))
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        )
      )
      .then(() => {
        console.log("[SW] Activated — claiming clients");
        return self.clients.claim();
      })
  );
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isApiRequest = (url) =>
  url.includes("clinic-backend-mxto.onrender.com") ||
  url.includes("/api/");

const isStaticAsset = (url) =>
  /\.(js|css|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)(\?.*)?$/.test(url);

const isNavigationRequest = (request) =>
  request.mode === "navigate";

const isGoogleFonts = (url) =>
  url.includes("fonts.googleapis.com") || url.includes("fonts.gstatic.com");

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || url.startsWith("chrome-extension")) return;

  // ── STRATEGY 1: API calls → Network-first, fall back to cache ─────────────
  if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // ── STRATEGY 2: Navigation (HTML pages) → Network-first, offline fallback ──
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest HTML for each page
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(async () => {
          // Offline: serve the cached page or generic offline page
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match("/offline.html");
          return offlinePage || new Response(
            "<h1>You are offline</h1><p>Please check your connection and try again.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        })
    );
    return;
  }

  // ── STRATEGY 3: Google Fonts → Stale-while-revalidate ─────────────────────
  if (isGoogleFonts(url)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // ── STRATEGY 4: Static assets → Cache-first ───────────────────────────────
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ── STRATEGY 5: Everything else → Network-first ───────────────────────────
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// ─── STRATEGY IMPLEMENTATIONS ─────────────────────────────────────────────────

/**
 * Cache-First: Return from cache immediately. If not cached, fetch, cache, return.
 * Best for: immutable static assets (hashed filenames, fonts, icons)
 */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset unavailable offline.", { status: 503 });
  }
}

/**
 * Network-First: Try network, fall back to cache.
 * Best for: API data, frequently updated content
 */
async function networkFirst(request, cacheName, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timeout);
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: "You appear to be offline.", offline: true }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Stale-While-Revalidate: Return cache immediately, then update cache in background.
 * Best for: semi-static resources (Google Fonts, CDN scripts)
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Kick off network fetch in the background regardless
  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  return cached || networkFetch;
}

// ─── PUSH NOTIFICATIONS (future use) ─────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try { data = event.data.json(); }
  catch { data = { title: "Dr. Somnath Clinic", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || "Dr. Somnath Clinic", {
      body:    data.body    || "You have a new notification.",
      icon:    data.icon    || "/icons/icon-192x192.png",
      badge:   data.badge   || "/icons/icon-72x72.png",
      data:    { url: data.url || "/" },
      vibrate: [200, 100, 200],
      tag:     data.tag || "clinic-notification",
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) return client.focus();
        }
        return clients.openWindow(targetUrl);
      })
  );
});

// ─── BACKGROUND SYNC (for offline form submissions) ──────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-appointment") {
    event.waitUntil(syncPendingAppointments());
  }
});

async function syncPendingAppointments() {
  // Read queued appointments from IndexedDB and POST when back online
  // Implementation depends on your IndexedDB setup
  console.log("[SW] Background sync triggered for pending appointments");
}