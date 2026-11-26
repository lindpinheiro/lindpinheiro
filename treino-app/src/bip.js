// Bipe do fim do descanso.
// O som é agendado no relógio de áudio (Web Audio) no momento do toque que inicia o descanso. Assim ele toca
// na hora certa mesmo com o app minimizado, quando os cronômetros do navegador ficam lentos ou parados.
// Sai pela saída de áudio atual do celular: no fone, se houver um conectado.
let ctx = null
let fontes = [] // bipe do fim do descanso
let seq = [] // sinais da sessão de cardio

function contexto() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Três bipes curtos e um mais longo, como num relógio de academia.
const PADRAO = [[0, 0.12, 880], [0.25, 0.12, 880], [0.5, 0.12, 880], [0.75, 0.35, 1175]]

// Agenda o padrão de bipes a partir de t0 (no relógio de áudio) e devolve os osciladores.
function tocar(c, t0, padrao = PADRAO, volume = 0.35) {
  return padrao.map(([ini, dur, freq]) => {
    const osc = c.createOscillator(), vol = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    // Entrada e saída suaves, para não estalar.
    vol.gain.setValueAtTime(0, t0 + ini)
    vol.gain.linearRampToValueAtTime(volume, t0 + ini + 0.01)
    vol.gain.setValueAtTime(volume, t0 + ini + dur - 0.03)
    vol.gain.linearRampToValueAtTime(0, t0 + ini + dur)
    osc.connect(vol).connect(c.destination)
    osc.start(t0 + ini)
    osc.stop(t0 + ini + dur + 0.02)
    return osc
  })
}

// Pausa o áudio quando não há mais nada para tocar, para não segurar o som do celular à toa.
function pausarSeLivre() {
  if (ctx && !fontes.length && !seq.length) ctx.suspend().catch(() => {})
}

// Bipe do fim do descanso, daqui a `segundos`. Substitui o que estiver agendado.
export function agendarBip(segundos) {
  cancelarBip()
  const c = contexto()
  if (!c) return
  const lista = tocar(c, c.currentTime + Math.max(0, segundos))
  fontes = lista
  lista.at(-1).onended = () => { if (fontes === lista) { fontes = []; pausarSeLivre() } }
}

export function cancelarBip() {
  for (const o of fontes) { o.onended = null; try { o.stop() } catch {} }
  fontes = []
}

// Toca o bipe agora, para testar o som e o fone, sem mexer no bipe do descanso.
export function testarBip() {
  const c = contexto()
  if (!c) return
  const lista = tocar(c, c.currentTime + 0.05)
  lista.at(-1).onended = pausarSeLivre
}

/* ---------- Sinais da sessão de cardio ---------- */

// Subindo: aumente a intensidade. Descendo: volte ao moderado. Toque curto: faltam 5 s. Final: acabou.
const SINAIS = {
  subir: [[0, 0.1, 660], [0.15, 0.1, 880], [0.3, 0.28, 1175]],
  descer: [[0, 0.1, 1175], [0.15, 0.1, 880], [0.3, 0.28, 660]],
  aviso: [[0, 0.07, 1000]],
  fim: [[0, 0.15, 880], [0.2, 0.15, 1175], [0.4, 0.7, 1568]],
}

// Agenda todos os sinais da sessão de uma vez, para tocarem mesmo com o app minimizado.
// eventos: [{ em: segundos a partir de agora, tipo: 'subir' | 'descer' | 'aviso' | 'fim' }]
export function agendarSequencia(eventos) {
  cancelarSequencia()
  const c = contexto()
  if (!c) return
  const t = c.currentTime
  const lista = eventos.filter((e) => e.em >= 0).flatMap((e) => tocar(c, t + e.em + 0.05, SINAIS[e.tipo], e.tipo === 'aviso' ? 0.2 : 0.35))
  seq = lista
  if (lista.length) lista.at(-1).onended = () => { if (seq === lista) { seq = []; pausarSeLivre() } }
}

export function cancelarSequencia() {
  for (const o of seq) { o.onended = null; try { o.stop() } catch {} }
  seq = []
  pausarSeLivre()
}

// Toca um sinal agora (prévia na tela da sessão).
export function tocarSinal(tipo) {
  const c = contexto()
  if (!c) return
  const lista = tocar(c, c.currentTime + 0.05, SINAIS[tipo], tipo === 'aviso' ? 0.2 : 0.35)
  lista.at(-1).onended = pausarSeLivre
}
