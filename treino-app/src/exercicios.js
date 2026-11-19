// Alternativas de cada exercício, carga "por lado" e a regra de progressão de carga.
import { OPCIONAL, PLAN, PLAN_ANTIGO, planoDe } from './plan.js'

const A = (id, nome, nota = '') => ({ id, nome, nota })

// Exercícios em que a carga anotada costuma ser de cada lado (cada halter, ou um braço/perna por vez).
const POR_LADO = new Set([
  'supino-inc-halter', 'supino-reto-halter', 'elev-lateral', 'encolh-halter', 'stiff', 'step-up', 'rosca-martelo',
  'rosca-halter', 'crucifixo-halter', 'crucifixo-inc', 'desenv-halter', 'afundo', 'remada-unilateral', 'elev-lateral-cabo',
  'aducao-cabo', 'abducao-cabo', 'leg-unilateral', 'rosca-punho-halter',
])

// Exercícios de perna e quadril sobem de 5 em 5 kg; o resto, 2,5 kg (ou 2 kg por halter).
const PERNA = new Set(['hip-thrust', 'hip-thrust-b', 'hip-thrust-maq', 'leg-press', 'hack', 'smith-agacha', 'stiff-barra', 'goblet', 'sumo', 'pant-em-pe', 'pant-sentado', 'pant-leg'])

export const ALTERNATIVAS = {
  'supino-reto': [A('supino-reto-halter', 'Supino reto com halteres', 'Desça bem para alongar o peito.'), A('supino-maq', 'Supino na máquina', 'Bom para treinar pesado com segurança.'), A('flexao', 'Flexão de braço', 'Mãos num banco se ficar difícil. Anote 0 na carga.')],
  'supino-inc-halter': [A('supino-inc', 'Supino inclinado na barra ou Smith'), A('supino-inc-maq', 'Supino inclinado na máquina')],
  'peck-deck': [A('crucifixo-halter', 'Crucifixo com halteres', 'Cotovelos levemente dobrados. Desça até sentir alongar.'), A('crossover', 'Crossover na polia', 'Polias no alto, mãos se encontram na frente do quadril.')],
  'elev-lateral': [A('elev-lateral-cabo', 'Elevação lateral na polia', 'Um braço de cada vez.'), A('elev-lateral-maq', 'Elevação lateral na máquina')],
  'triceps-corda': [A('triceps-barra', 'Tríceps na polia com barra', 'Cotovelos colados no corpo.'), A('triceps-frances', 'Tríceps francês', 'Halter ou polia.')],
  'pant-em-pe': [A('pant-leg', 'Panturrilha no leg press', 'Só a ponta do pé na plataforma.'), A('pant-sentado', 'Panturrilha sentado', 'Pause 1 s embaixo.')],
  'puxada-frontal': [A('puxada-neutra', 'Puxada com pegada neutra'), A('puxada-maq', 'Puxada na máquina articulada'), A('barra-assist', 'Barra fixa assistida', 'Na máquina com contrapeso: quanto mais peso, mais ajuda.')],
  'remada-apoiada': [A('remada-maq', 'Remada articulada'), A('remada-baixa', 'Remada baixa com triângulo', 'Segure 1 s com as escápulas juntas.'), A('remada-unilateral', 'Remada unilateral com halter', 'Joelho e mão no banco, puxe o halter até o quadril.')],
  'encolh-halter': [A('encolh-barra', 'Encolhimento com barra'), A('encolh-maq', 'Encolhimento na máquina')],
  'face-pull': [A('crucifixo-inv', 'Crucifixo inverso'), A('crucifixo-inv-cabo', 'Crucifixo inverso na polia')],
  'rosca-w': [A('rosca-halter', 'Rosca alternada com halteres'), A('rosca-polia', 'Rosca na polia')],
  'rosca-punho': [A('rosca-punho-halter', 'Rosca de punho com halteres', 'Antebraço apoiado na coxa ou no banco.')],
  'hip-thrust': [A('hip-thrust-maq', 'Elevação pélvica na máquina'), A('ponte-gluteo', 'Ponte de glúteo com halter', 'Costas no chão, halter no quadril. Levante-se devagar.')],
  'stiff': [A('stiff-barra', 'Stiff com barra'), A('flexora-sentado', 'Cadeira flexora')],
  'mesa-flexora': [A('flexora-sentado', 'Cadeira flexora'), A('flexora-pe', 'Flexora em pé', 'Uma perna de cada vez.')],
  'step-up': [A('afundo', 'Afundo com halteres', 'Passo largo, joelho de trás quase no chão.'), A('leg-unilateral', 'Leg press com uma perna')],
  'abdutora': [A('abducao-cabo', 'Abdução na polia', 'Tornozeleira na polia baixa, perna para o lado.')],
  'pant-sentado': [A('pant-em-pe', 'Panturrilha em pé'), A('pant-leg', 'Panturrilha no leg press')],
  'supino-inc': [A('supino-inc-halter', 'Supino inclinado com halteres'), A('supino-inc-maq', 'Supino inclinado na máquina')],
  'crossover-baixo': [A('crucifixo-inc', 'Crucifixo inclinado com halteres', 'Banco a 30°.'), A('peck-deck', 'Crucifixo na máquina')],
  'desenv-maq': [A('desenv-halter', 'Desenvolvimento com halteres', 'Sentado, costas apoiadas.'), A('desenv-smith', 'Desenvolvimento no Smith')],
  'elev-lateral-cabo': [A('elev-lateral', 'Elevação lateral com halteres'), A('elev-lateral-maq', 'Elevação lateral na máquina')],
  'triceps-frances': [A('triceps-corda-alto', 'Tríceps na polia acima da cabeça', 'De costas para a polia, corda atrás da cabeça.'), A('triceps-corda', 'Tríceps na polia com corda')],
  'rosca-martelo': [A('rosca-martelo-corda', 'Rosca martelo na polia com corda'), A('rosca-inversa', 'Rosca inversa')],
  'remada-maq': [A('remada-apoiada', 'Remada com peito apoiado'), A('remada-baixa', 'Remada baixa com triângulo')],
  'puxada-neutra': [A('puxada-frontal', 'Puxada frontal aberta'), A('puxada-maq', 'Puxada na máquina articulada')],
  'encolh-barra': [A('encolh-halter', 'Encolhimento com halteres'), A('encolh-maq', 'Encolhimento na máquina')],
  'crucifixo-inv': [A('face-pull', 'Face pull na polia'), A('crucifixo-inv-cabo', 'Crucifixo inverso na polia')],
  'rosca-inversa': [A('rosca-martelo', 'Rosca martelo'), A('rosca-inversa-polia', 'Rosca inversa na polia')],
  'rosca-punho-inv': [A('rosca-punho', 'Rosca de punho'), A('rosca-inversa', 'Rosca inversa')],
  'leg-press': [A('hack', 'Agachamento no hack', 'Costas apoiadas: seguro para a pressão.'), A('smith-agacha', 'Agachamento no Smith')],
  'goblet': [A('hack', 'Agachamento no hack'), A('leg-press', 'Leg press 45°')],
  'extensora': [A('leg-press', 'Leg press 45°', 'Pés mais baixos na plataforma para pegar mais a coxa.'), A('hack', 'Agachamento no hack')],
  'hip-thrust-b': [A('hip-thrust-maq', 'Elevação pélvica na máquina'), A('ponte-gluteo', 'Ponte de glúteo com halter')],
  'abdutora-reta': [A('abducao-cabo', 'Abdução na polia')],
  'remada-baixa': [A('remada-maq', 'Remada articulada'), A('remada-apoiada', 'Remada com peito apoiado')],
  'remada-unilateral': [A('remada-baixa', 'Remada baixa com triângulo'), A('remada-maq', 'Remada articulada')],
  'rosca-polia': [A('rosca-halter', 'Rosca alternada com halteres'), A('rosca-w', 'Rosca direta com barra W')],
  'hack': [A('smith-agacha', 'Agachamento no Smith'), A('leg-press', 'Leg press 45°', 'Pés no meio da plataforma.')],
  'flexora-sentado': [A('mesa-flexora', 'Mesa flexora'), A('flexora-pe', 'Flexora em pé', 'Uma perna de cada vez.')],
  'supino-reto-halter': [A('supino-maq', 'Supino na máquina'), A('supino-reto', 'Supino reto com barra')],
  'desenv-halter': [A('desenv-maq', 'Desenvolvimento na máquina'), A('desenv-smith', 'Desenvolvimento no Smith')],
  'triceps-corda-alto': [A('triceps-frances', 'Tríceps francês'), A('triceps-corda', 'Tríceps na polia com corda')],
  'abd-polia': [A('abd-maq', 'Abdominal na máquina', 'Solte o ar ao contrair.'), A('abd-bola', 'Abdominal no chão com pés apoiados', 'Mãos no peito, suba só até tirar as escápulas do chão.')],
  'elev-pernas': [A('elev-pernas-barra', 'Elevação de pernas na barra', 'Pendurado, suba os joelhos até a altura do quadril.'), A('dead-bug', 'Dead bug', 'Deitado, braço e perna opostos descem juntos, lombar colada no chão.')],
  'pallof': [A('dead-bug', 'Dead bug', 'Deitado, braço e perna opostos descem juntos, lombar colada no chão.')],
  'adutora': [A('aducao-cabo', 'Adução na polia', 'Tornozeleira na polia baixa, puxe a perna para dentro.'), A('sumo', 'Agachamento sumô com halter', 'Pés bem abertos, halter entre as pernas.')],
}

// Nome de qualquer exercício (do plano ou alternativo), para histórico e recordes.
export const NOMES = {}
for (const P of [PLAN, PLAN_ANTIGO, { x: OPCIONAL }]) for (const k in P) for (const e of P[k].ex) NOMES[e.id] ??= e.nome
for (const k in ALTERNATIVAS) for (const a of ALTERNATIVAS[k]) NOMES[a.id] ??= a.nome

// Exercício completo por id (as alternativas herdam séries e repetições do original), para a progressão.
export const EXERCICIOS = {}
for (const P of [PLAN, PLAN_ANTIGO, { x: OPCIONAL }]) for (const k in P) for (const e of P[k].ex) EXERCICIOS[e.id] ??= e
for (const k in ALTERNATIVAS) for (const a of ALTERNATIVAS[k]) EXERCICIOS[a.id] ??= { ...EXERCICIOS[k], ...a }

// Troca vigente para um exercício numa data: a do dia, ou a permanente (válida a partir de quando foi feita).
export function trocaDe(s, date, id) {
  const doDia = s.logs?.[date]?.troca?.[id]
  if (doDia !== undefined) return doDia || null // '' = voltou ao original só hoje
  const sempre = s.trocas?.[id]
  return sempre && date >= sempre.desde ? sempre.por : null
}

// Aplica as trocas à lista de exercícios de um treino. O exercício trocado mantém séries, repetições e descanso.
export function aplicarTrocas(s, date, ex) {
  return ex.map((e) => {
    const por = trocaDe(s, date, e.id)
    const alt = por && ALTERNATIVAS[e.id]?.find((a) => a.id === por)
    return alt ? { ...e, id: alt.id, nome: alt.nome, nota: alt.nota, original: e } : e
  })
}

// Treino de uma data já com as trocas de exercício aplicadas.
export function treinoDe(s, date) {
  const p = planoDe(s.logs, date)
  return p.ex.length ? { ...p, ex: aplicarTrocas(s, date, p.ex) } : p
}

/* ---------- Carga total ou por lado ---------- */

export const ladoPadrao = (id) => POR_LADO.has(id)
export const modoLado = (s, id) => s.lados?.[id] ?? ladoPadrao(id)
const ladoDaSerie = (x, id) => x.lado ?? ladoPadrao(id)
// Carga total movida na série (por lado conta os dois lados).
export const kgTotal = (x, id) => (x?.kg || 0) * (ladoDaSerie(x, id) ? 2 : 1)
// Carga da série no modo que está sendo exibido agora.
export const kgNoModo = (x, id, lado) => (x?.kg == null ? undefined : kgTotal(x, id) / (lado ? 2 : 1))

/* ---------- Progressão ---------- */

export function faixa(reps) {
  if (/\ds\b|\bs$/.test(reps) || reps.includes(' s')) return null
  const n = (reps.match(/\d+/g) || []).map(Number)
  return n.length ? { min: Math.min(...n), max: Math.max(...n) } : null
}

const arred = (v, passo) => Math.round(v / passo) * passo

// Recomendação para hoje a partir do último treino deste exercício.
// tipo: 'subir' (bateu o topo da faixa em todas as séries), 'manter' (dentro da faixa) ou 'pesado' (abaixo da faixa).
export function progressao(e, ant, lado) {
  const f = faixa(e.reps)
  if (!f || !ant) return null
  const sets = ant.sets.filter((x) => x.kg && x.reps)
  if (!sets.length) return null
  const cargas = sets.map((x) => kgNoModo(x, e.id, lado))
  const kg = Math.max(...cargas)
  const naCarga = sets.filter((x, i) => cargas[i] === kg)
  const passo = lado ? 2 : PERNA.has(e.id) ? 5 : 2.5
  if (sets.length >= e.series && sets.every((x) => x.reps >= f.max)) {
    return { tipo: 'subir', kg: arred(kg + passo, lado ? 1 : 0.5), reps: f.min, de: kg, passo, f }
  }
  const abaixo = naCarga.filter((x) => x.reps < f.min).length
  if (abaixo > naCarga.length / 2) return { tipo: 'pesado', kg, reps: f.min, f }
  const menor = Math.min(...naCarga.map((x) => x.reps))
  return { tipo: 'manter', kg, reps: Math.min(f.max, menor + 1), f }
}
