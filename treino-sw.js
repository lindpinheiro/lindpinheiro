// Guarda a última versão do treino.html para o app abrir sem internet (na academia, por exemplo).
// Só cuida dessa página: as outras do site passam direto.
const CACHE = 'treino-v1'
const PAGINA = /\/treino\.html(\?.*)?$/

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
          caches.open(CACHE).then((c) => c.put('treino.html', copia))
        }
        return r
      })
      .catch(() => caches.match('treino.html')),
  )
})
