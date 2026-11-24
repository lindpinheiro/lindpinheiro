// Guarda a última versão do fanfic.html para o app abrir sem internet (ler e editar capítulos).
// Registrado com escopo "./fanfic", então não substitui o service worker do treino.
const CACHE = 'fanfic-v26'
const PAGINA = /\/fanfic\.html(\?.*)?$/

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('fanfic-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()),
))

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !PAGINA.test(e.request.url)) return
  // Rede primeiro, para pegar atualizações; sem rede, usa a cópia guardada.
  // "no-cache": sempre confere com o servidor se há versão nova (barato, usa ETag)
  e.respondWith(
    fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then((r) => {
        if (r.ok) {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put('fanfic.html', copia))
        }
        return r
      })
      .catch(() => caches.match('fanfic.html')),
  )
})
