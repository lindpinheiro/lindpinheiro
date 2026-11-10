// Estimativas de gasto calórico. Todas usam o gasto ACIMA do repouso (MET − 1),
// porque o repouso já está no gasto base do dia.
import { PLAN, duracao } from './plan.js'
import { EXTRAS, LIVRE, REFEICOES, valores } from './dieta.js'
import { PESO_INICIAL } from './store.js'

const MET_MUSCULACAO = 2.5
// Cardio da academia por intensidade. Registros antigos, sem intensidade, usam o padrão de cada tipo.
const MET_CARDIO = {
  esteira: { leve: 3.5, moderada: 5, forte: 7, padrao: 'moderada' },
  escada: { leve: 4.5, moderada: 6, forte: 8, padrao: 'moderada' },
  caminhada: { leve: 2.3, moderada: 3.3, forte: 4.5, padrao: 'leve' },
}
export const intensidadeCardio = (tipo, c) => c?.int || MET_CARDIO[tipo].padrao
export const kcalCardio = (tipo, c, kg) => kcal(MET_CARDIO[tipo][intensidadeCardio(tipo, c)], kg, c.min)
// Patins: MET de 6, 7,5 e 10 menos o repouso.
export const INTENSIDADES = {
  leve: { nome: 'Leve', met: 5, como: 'Dá para conversar' },
  moderada: { nome: 'Moderada', met: 6.5, como: 'Frases curtas' },
  forte: { nome: 'Forte', met: 9, como: 'Sem fôlego para falar' },
}
// Trabalho de levantar a carga: ~0,5 m por repetição, ida e volta, com eficiência muscular de ~20%.
const KCAL_POR_KG_REP = 0.006
const kcal = (met, kg, min) => Math.round((met * kg * min) / 60)
export const diaSemana = (date) => new Date(`${date}T12:00:00`).getDay()

// Peso registrado mais recente até a data; antes do primeiro registro, o peso inicial.
export function pesoEm(s, date) {
  const ps = [...s.peso].sort((a, b) => (a.date < b.date ? -1 : 1))
  return ps.filter((p) => p.date <= date).at(-1)?.kg ?? PESO_INICIAL
}

export const kcalPatins = (p, kg) => kcal((INTENSIDADES[p.int] || INTENSIDADES.leve).met, kg, p.min)

// Gasto do treino a partir do que foi registrado: tempo das séries marcadas (execução + descanso),
// peso do corpo e volume levantado (carga × repetições). Sem séries marcadas, usa a duração planejada.
export function gastoTreino(s, date, kg) {
  const log = s.logs[date], p = PLAN[diaSemana(date)]
  const r = { series: 0, volume: 0, minutos: 0, musculacao: 0, cardio: 0, total: 0 }
  if (!log) return r
  let seg = 0
  for (const e of p.ex) {
    const feitas = (log.ex?.[e.id] || []).filter((x) => x?.ok)
    if (!feitas.length) continue
    r.series += feitas.length
    seg += feitas.length * (40 + e.desc) + 60
    r.volume += feitas.reduce((t, x) => t + (x.kg || 0) * (x.reps || 0), 0)
  }
  if (r.series) r.minutos = Math.round(seg / 60) + (log.feito ? 5 : 0)
  else if (log.feito) r.minutos = duracao(p) - (p.cardio?.min || 0)
  r.musculacao = kcal(MET_MUSCULACAO, kg, r.minutos) + Math.round(r.volume * KCAL_POR_KG_REP)
  r.cardio = log.cardio && p.cardio ? kcalCardio(p.cardio.tipo, log.cardio, kg) : 0
  r.total = r.musculacao + r.cardio
  return r
}
export const kcalTreino = (s, date, kg) => gastoTreino(s, date, kg).total

// Gasto do corpo sem exercício: metabolismo basal (Mifflin-St Jeor) × 1,2 de rotina sedentária.
export const gastoBase = (kg, perfil) => (kg && perfil ? Math.round((10 * kg + 6.25 * perfil.altura - 5 * perfil.idade + 5) * 1.2) : null)

export function consumo(s, date) {
  const d = s.dieta?.[date]
  const refeicoes = REFEICOES.filter((r) => d?.m?.[r.id])
  const extras = EXTRAS.map((x) => ({ ...x, n: d?.[x.id] || 0 })).filter((x) => x.n)
  return {
    refeicoes, extras, completa: refeicoes.length === REFEICOES.length,
    kcal: refeicoes.reduce((t, r) => t + valores(r, d).kcal, 0) + extras.reduce((t, x) => t + x.n * x.kcal, 0),
    prot: refeicoes.reduce((t, r) => t + valores(r, d).prot, 0),
  }
}
