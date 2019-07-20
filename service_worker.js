const CACHE_NAME = 'panorama-caches-v1';
const FILES_TO_CACHE = [
    './',
    './dist/main.js',
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(e.request)
                    .then(res => {
                        const resClone = res.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(e.request, resClone));
                        return res;
                    });
            })
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        ))
    );
});
