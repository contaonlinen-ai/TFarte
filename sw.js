
/* Firebase Messaging */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

var firebaseConfig = {
  apiKey: "AIzaSyBUmJpCIUQuNJHz3IS6ag-A_lt5YRVUPlg",
  authDomain: "tfarte-90cca.firebaseapp.com",
  projectId: "tfarte-90cca",
  messagingSenderId: "419540859839",
  appId: "1:419540859839:web:5c02bf3e62a74b2044ff0a"
};

firebase.initializeApp(firebaseConfig);

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  var data = payload.notification || payload.data || {};

  var title = data.title || "TFarte";

  var options = {
    body: data.body || "Tens uma nova notificação!",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: {
      url: data.url || "./"
    }
  };

  self.registration.showNotification(title, options);
});

/* Cache da aplicação */
var CACHE = 't-f-arte-v1';
var SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) {
        return c.addAll(SHELL);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys()
      .then(function(ks) {
        return Promise.all(
          ks.filter(function(k) {
            return k !== CACHE;
          }).map(function(k) {
            return caches.delete(k);
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(e) {
  var r = e.request;

  if (
    r.method !== 'GET' ||
    new URL(r.url).origin !== location.origin
  ) return;

  e.respondWith(
    fetch(r)
      .then(function(res) {
        var cp = res.clone();

        caches.open(CACHE).then(function(c) {
          c.put(r, cp);
        });

        return res;
      })
      .catch(function() {
        return caches.match(r).then(function(m) {
          return m || caches.match('index.html');
        });
      })
  );
});

/* Abrir a TFarte ao tocar na notificação */
self.addEventListener('notificationclick', function(e) {
  e.notification.close();

  var url = e.notification.data.url || './';

  e.waitUntil(
    clients.openWindow(url)
  );
});
