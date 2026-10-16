// Service worker de CQFD : garde une copie de l'appli sur le téléphone.
// Stratégie "réseau d'abord" : on prend la dernière version en ligne, et si le réseau
// ne répond pas, on sert la copie gardée en mémoire.
// Change ce numéro quand tu veux forcer tout le monde à recharger les fichiers.
const VERSION = 'cqfd-v1';
const FICHIERS = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // Firebase gère ses propres requêtes
  e.respondWith(
    fetch(e.request)
      .then(rep => { const copie = rep.clone(); caches.open(VERSION).then(c => c.put(e.request, copie)); return rep; })
      .catch(() => caches.match(e.request))
  );
});
