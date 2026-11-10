// Estimativas de gasto calórico. Todas usam o gasto ACIMA do repouso (MET − 1),
// porque o repouso já está no gasto base do dia.
import { PLAN, duracao } from './plan.js'
import { EXTRAS, LIVRE, REFEICOES } from './dieta.js'
import { PESO_INICIAL } from './store.js'

const MET_LIQ = { patins: 5, musculacao: 2.5, esteira: 5, escada: 6, caminhada: 2.3 }
const kcal = (met, kg, min) => Math.round((met * kg * min) / 60)
export const diaSemana = (date) => new Date(`${date}T12:00:00`).getDay()

// Peso registrado mais recente até a data; antes do primeiro registro, o peso inicial.
export function pesoEm(s, date) {
  const ps = [...s.peso].sort((a, b) => (a.date < b.date ? -1 : 1))
  return ps.filter((p) => p.date <= date).at(-1)?.kg ?? PESO_INICIAL
}

export const kcalPatins = (min, kg) => (kg ? kcal(MET_LIQ.patins, kg, min) : null)

export function kcalTreino(s, date, kg) {
  const log = s.logs[date], p = PLAN[diaSemana(date)]
  if (!kg || !log) return 0
  const cardio = log.cardio && p.cardio ? kcal(MET_LIQ[p.cardio.tipo], kg, log.cardio.min) : 0
  const musculacao = log.feito ? kcal(MET_LIQ.musculacao, kg, duracao(p) - (p.cardio?.min || 0)) : 0
  return cardio + musculacao
}

// Gasto do corpo sem exercício: metabolismo basal (Mifflin-St Jeor) × 1,2 de rotina sedentária.
export const gastoBase = (kg, perfil) => (kg && perfil ? Math.round((10 * kg + 6.25 * perfil.altura - 5 * perfil.idade + 5) * 1.2) : null)

export function consumo(s, date) {
  const d = s.dieta?.[date]
  const refeicoes = REFEICOES.filter((r) => d?.m?.[r.id])
  const extras = EXTRAS.map((x) => ({ ...x, n: d?.[x.id] || 0 })).filter((x) => x.n)
  return {
    refeicoes, extras, completa: refeicoes.length === REFEICOES.length,
    kcal: refeicoes.reduce((t, r) => t + (d.m[r.id] === 'livre' ? LIVRE.kcal : r.kcal), 0) + extras.reduce((t, x) => t + x.n * x.kcal, 0),
    prot: refeicoes.reduce((t, r) => t + (d.m[r.id] === 'livre' ? LIVRE.prot : r.prot), 0),
  }
}
