import { useCallback, useState } from 'react'
import { ORDEM } from './plan.js'

const KEY = 'treino-v2'
// Ponto de partida e objetivo, fixos até a meta ser atingida.
export const PESO_INICIAL = 117
export const META = 95
export const PERFIL_PADRAO = { altura: 179, idade: 33 }
const VAZIO = { logs: {}, peso: [], patins: [], dieta: {}, perfil: null, meta: null }

function ler() {
  try {
    return { ...VAZIO, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...VAZIO }
  }
}

// Pede ao navegador para não apagar os dados sozinho quando faltar espaço no aparelho.
try { navigator.storage?.persist?.() } catch {}

// Os dados ficam sempre na mesma chave (KEY). Ao mudar o formato, converter aqui em vez de trocar a chave,
// para que nenhuma atualização do site apague o que já foi registrado.
export function useStore() {
  const [s, setS] = useState(ler)
  const update = useCallback((fn) => {
    setS((prev) => {
      const next = structuredClone(prev)
      fn(next)
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])
  const replace = useCallback((d) => update((n) => Object.assign(n, VAZIO, d)), [update])
  return [s, update, replace]
}

export const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
export const hojeISO = () => iso(new Date())
export const br = (s) => s.split('-').reverse().slice(0, 2).join('/')
export const num = (n) => String(n).replace('.', ',')

// Segunda a domingo da semana atual.
export function semana() {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return ORDEM.map((wd, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return { wd, date: iso(x) }
  })
}

// Séries registradas na sessão anterior deste exercício.
export function ultima(logs, exId, antes) {
  const datas = Object.keys(logs).filter((d) => d < antes).sort().reverse()
  for (const d of datas) {
    const sets = (logs[d].ex?.[exId] || []).filter((x) => x && (x.kg || x.reps))
    if (sets.length) return { d, sets }
  }
  return null
}
