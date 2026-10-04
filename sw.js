/* global OFFLINE_ASSETS */
importScripts('./offline-assets.js');

// Bump this version whenever a deployed app or media file changes.
const CACHE_NAME = 'bend-and-mend-offline-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './pwa.js',
  './manifest.webmanifest',
  './supabase-config.js',
  './offline-assets.js'
];
const PRECACHE_ASSETS = [...new Set([...CORE_ASSETS, ...(self.OFFLINE_ASSETS || [])])];

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => client.postMessage(message));
}

async function precacheOfflineApp() {
  const cache = await caches.open(CACHE_NAME);
  const failures = [];
  let completed = 0;
  const batchSize = 6;

  for (let start = 0; start < PRECACHE_ASSETS.length; start += batchSize) {
    const batch = PRECACHE_ASSETS.slice(start, start + batchSize);
    await Promise.all(batch.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        await cache.put(asset, response);
      } catch (error) {
        console.warn(`Could not cache ${asset}`, error);
        failures.push(asset);
      }
      completed += 1;
    }));

    await notifyClients({
      type: 'OFFLINE_CACHE_PROGRESS',
      completed,
      total: PRECACHE_ASSETS.length
    });
  }

  if (failures.length > 0) {
    await notifyClients({ type: 'OFFLINE_CACHE_ERROR', failures });
    throw new Error(`Offline cache incomplete: ${failures.join(', ')}`);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheOfflineApp().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('bend-and-mend-offline-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
    await notifyClients({ type: 'OFFLINE_CACHE_READY' });
  })());
});

async function cachedResponseFor(request) {
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request, { ignoreSearch: true });
}

async function rangedResponse(request) {
  const cached = await cachedResponseFor(request);
  if (!cached) return fetch(request);

  const range = request.headers.get('range');
  const match = /^bytes=(\d+)-(\d*)$/i.exec(range || '');
  if (!match) return cached;

  const body = await cached.arrayBuffer();
  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : body.byteLength - 1;
  const end = Math.min(requestedEnd, body.byteLength - 1);

  if (start >= body.byteLength || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${body.byteLength}` }
    });
  }

  const headers = new Headers(cached.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(end - start + 1));
  headers.set('Content-Range', `bytes ${start}-${end}/${body.byteLength}`);

  return new Response(body.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers
  });
}

async function navigationResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put('./index.html', response.clone());
    return response;
  } catch (_error) {
    return cache.match('./index.html', { ignoreSearch: true });
  }
}

async function assetResponse(request) {
  const cached = await cachedResponseFor(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.headers.has('range')) {
    event.respondWith(rangedResponse(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  event.respondWith(assetResponse(request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CHECK_OFFLINE_CACHE') return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedAssets = await Promise.all(
      PRECACHE_ASSETS.map((asset) => cache.match(asset, { ignoreSearch: true }))
    );
    const type = cachedAssets.every(Boolean)
      ? 'OFFLINE_CACHE_READY'
      : 'OFFLINE_CACHE_ERROR';
    event.source?.postMessage({ type });
  })());
});
