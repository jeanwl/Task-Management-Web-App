const cacheName = 'kanban-v1'
const filesToCache = [
    '/Task-Management-Web-App/',
    '/Task-Management-Web-App/index.html',
    '/Task-Management-Web-App/manifest.webmanifest',
    '/Task-Management-Web-App/css/base.css',
    '/Task-Management-Web-App/css/components/app.css',
    '/Task-Management-Web-App/css/components/board.css',
    '/Task-Management-Web-App/css/components/column.css',
    '/Task-Management-Web-App/css/components/dialog.css',
    '/Task-Management-Web-App/css/components/subtask.css',
    '/Task-Management-Web-App/css/components/task.css',
    '/Task-Management-Web-App/css/fonts.css',
    '/Task-Management-Web-App/css/main.css',
    '/Task-Management-Web-App/css/reset.css',
    '/Task-Management-Web-App/favicon/apple-touch-icon.png',
    '/Task-Management-Web-App/favicon/icon-192.png',
    '/Task-Management-Web-App/favicon/icon-512.png',
    '/Task-Management-Web-App/favicon/icon-maskable-192.png',
    '/Task-Management-Web-App/favicon/icon-maskable-512.png',
    '/Task-Management-Web-App/favicon/icon.ico',
    '/Task-Management-Web-App/favicon/icon.svg',
    '/Task-Management-Web-App/favicon/mask-icon.svg',
    '/Task-Management-Web-App/fonts/PlusJakartaSans-Bold.woff2',
    '/Task-Management-Web-App/fonts/PlusJakartaSans-ExtraBold.woff2',
    '/Task-Management-Web-App/fonts/PlusJakartaSans-Medium.woff2',
    '/Task-Management-Web-App/js/arrow.js',
    '/Task-Management-Web-App/js/components/App.js',
    '/Task-Management-Web-App/js/components/Board.js',
    '/Task-Management-Web-App/js/components/Column.js',
    '/Task-Management-Web-App/js/components/Dropdown.js',
    '/Task-Management-Web-App/js/components/Subtask.js',
    '/Task-Management-Web-App/js/components/Task.js',
    '/Task-Management-Web-App/js/components/dialogs/BoardFormDialog.js',
    '/Task-Management-Web-App/js/components/dialogs/ColumnFormDialog.js',
    '/Task-Management-Web-App/js/components/dialogs/ConfirmDialog.js',
    '/Task-Management-Web-App/js/components/dialogs/Dialog.js',
    '/Task-Management-Web-App/js/components/dialogs/TaskDialog.js',
    '/Task-Management-Web-App/js/components/dialogs/TaskFormDialog.js',
    '/Task-Management-Web-App/js/generateId.js',
    '/Task-Management-Web-App/js/loadDataSample.js'
]

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll(filesToCache)
        })
    )
})

// self.addEventListener('fetch', e => {
//     const requestURL = e.request.url.replace(/^(https:\/\/[^\/]+)(\/Task-Management-Web-App\/)/, '$2')
//     e.respondWith(
//         caches.match(requestURL).then(resp => {
//             return resp || fetch(e.request)
//         })
//     )
// })
self.addEventListener("fetch", (e) => {
    e.respondWith(
      (async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) {
          return r;
        }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
      })()
    );
  });