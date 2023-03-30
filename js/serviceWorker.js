const cacheName = 'kanban-v1'
const filesToCache = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/css/base.css',
    '/css/components/app.css',
    '/css/components/board.css',
    '/css/components/column.css',
    '/css/components/dialog.css',
    '/css/components/subtask.css',
    '/css/components/task.css',
    '/css/fonts.css',
    '/css/main.css',
    '/css/reset.css',
    '/favicon/apple-touch-icon.png',
    '/favicon/icon-192.png',
    '/favicon/icon-512.png',
    '/favicon/icon-maskable-192.png',
    '/favicon/icon-maskable-512.png',
    '/favicon/icon.ico',
    '/favicon/icon.svg',
    '/favicon/mask-icon.svg',
    '/fonts/PlusJakartaSans-Bold.woff2',
    '/fonts/PlusJakartaSans-ExtraBold.woff2',
    '/fonts/PlusJakartaSans-Medium.woff2',
    '/js/arrow.js',
    '/js/components/App.js',
    '/js/components/Board.js',
    '/js/components/Column.js',
    '/js/components/Dropdown.js',
    '/js/components/Subtask.js',
    '/js/components/Task.js',
    '/js/components/dialogs/BoardFormDialog.js',
    '/js/components/dialogs/ColumnFormDialog.js',
    '/js/components/dialogs/ConfirmDialog.js',
    '/js/components/dialogs/Dialog.js',
    '/js/components/dialogs/TaskDialog.js',
    '/js/components/dialogs/TaskFormDialog.js',
    '/js/generateId.js',
    '/js/loadDataSample.js',
    '/js/serviceWorker.js'
]

// self.addEventListener('install', e => {
//     e.waitUntil(
//         caches.open(cacheName).then(cache => {
//             return cache.addAll(filesToCache)
//         })
//     )
// })
self.addEventListener('install', e => {
    e.waitUntil(
      caches.open(cacheName).then(cache => {
        return Promise.all(
          filesToCache.map(url => {
            return cache.add(url).catch(err => {
              console.error(`Failed to cache ${url}: ${err.message}`);
            });
          })
        );
      })
    );
  });
  

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request)
        })
    )
})