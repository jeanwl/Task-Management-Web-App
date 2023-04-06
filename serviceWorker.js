const cacheName = 'kanban-v1'
const files = [
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
	'/js/loadDataSample.js'
]
const root = '/Task-Management-Web-App'
const filesToCache = files.map(url => root + url)

const buildCache = async () => {
	const cache = await caches.open(cacheName)

	await cache.addAll(filesToCache)
}

// const getCache = async (request) => {
// 	const cache = await caches.open(cacheName)

// 	return await cache.match(request)
// }

const getCache = async (request) => {
	const cache = await caches.open(cacheName)
	console.log(cache)
	
	return await cache.match(new Request(filesToCache[0]))

	// const cache = await caches.open(cacheName);
	// const cachedResponse = await cache.match(request);

	// if (cachedResponse) {
	// 	return cachedResponse;
	// }

	// try {
	// 	const response = await fetch(request);
	// 	if (request.mode === 'navigate') {
	// 		const clonedResponse = response.clone();
	// 		cache.put(request, clonedResponse);
	// 	}
	// 	return response;
	// } catch (error) {
	// 	// Fallback to the cached index.html when offline
	// 	return await cache.match('/index.html');
	// }
}

self.addEventListener('install', e => {
	e.waitUntil(buildCache())
})

self.addEventListener('fetch', e => {
	e.respondWith(getCache(e.request))
})