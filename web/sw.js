import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/hackathons'),
  new NetworkFirst({ cacheName: 'api-hackathons' })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images' })
);

registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({ cacheName: 'fonts' })
);

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({ cacheName: 'static-resources' })
);

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
