// Bipe do fim do descanso.
// O som é agendado no relógio de áudio (Web Audio) no momento do toque que inicia o descanso. Assim ele toca
// na hora certa mesmo com o app minimizado, quando os cronômetros do navegador ficam lentos ou parados.
// Sai pela saída de áudio atual do celular: no fone, se houver um conectado.
let ctx = null
let fontes = []

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
function tocar(c, t0) {
  return PADRAO.map(([ini, dur, freq]) => {
    const osc = c.createOscillator(), vol = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    // Entrada e saída suaves, para não estalar.
    vol.gain.setValueAtTime(0, t0 + ini)
    vol.gain.linearRampToValueAtTime(0.35, t0 + ini + 0.01)
    vol.gain.setValueAtTime(0.35, t0 + ini + dur - 0.03)
    vol.gain.linearRampToValueAtTime(0, t0 + ini + dur)
    osc.connect(vol).connect(c.destination)
    osc.start(t0 + ini)
    osc.stop(t0 + ini + dur + 0.02)
    return osc
  })
}

// Pausa o áudio quando não há mais nada para tocar, para não segurar o som do celular à toa.
function pausarSeLivre() {
  if (ctx && !fontes.length) ctx.suspend().catch(() => {})
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
