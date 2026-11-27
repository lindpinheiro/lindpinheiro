// Guarda a última versão do fanfic.html para o app abrir sem internet (ler e editar capítulos).
// Registrado com escopo "./fanfic", então não substitui o service worker do treino.
const CACHE = 'fanfic-v46'
const PAGINA = /\/fanfic\.html(\?.*)?$/
// dicionário e sinônimos: grandes e quase nunca mudam; guardados à parte na primeira vez que são usados
const DICT = /\/fanfic-dict-[\w-]+\.(aff|dic|txt)$/
const DICT_CACHE = 'dictpt-v2'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => (k.startsWith('fanfic-') && k !== CACHE) || (k.startsWith('dictpt-') && k !== DICT_CACHE)).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()),
))

self.addEventListener('fetch', (e) => {
  if (e.request.method === 'GET' && DICT.test(e.request.url)) {
    e.respondWith(caches.open(DICT_CACHE).then((c) => c.match(e.request.url).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) c.put(e.request.url, r.clone()); return r }))))
    return
  }
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
