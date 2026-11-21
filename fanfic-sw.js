// Guarda a última versão do fanfic.html para o app abrir sem internet (ler e editar capítulos).
// Registrado com escopo "./fanfic", então não substitui o service worker do treino.
const CACHE = 'fanfic-v1'
const PAGINA = /\/fanfic\.html(\?.*)?$/

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !PAGINA.test(e.request.url)) return
  // Rede primeiro, para pegar atualizações; sem rede, usa a cópia guardada.
  e.respondWith(
    fetch(e.request)
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
