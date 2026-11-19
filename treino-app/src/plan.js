const E = (id, nome, series, reps, desc, nota = '') => ({ id, nome, series, reps, desc, nota })

export const CARDIO = {
  esteira: {
    nome: 'Esteira inclinada',
    como: 'Caminhada a 5–6 km/h com 8–12% de inclinação, sem segurar no apoio. Ritmo em que dá para conversar.',
  },
  escada: {
    nome: 'Escada',
    como: 'Nível 4–6, ritmo constante. Nos 2 últimos minutos, diminua aos poucos — não pare de uma vez.',
  },
  caminhada: {
    nome: 'Caminhada leve',
    como: 'Esteira plana a 4–5 km/h. Serve para a pressão voltar ao normal depois do treino de perna.',
  },
}

// Plano até 19/11/2026 (seis dias de ~1 hora, domingo de descanso). Mantido para o histórico desses dias.
export const PLAN_ANTIGO = {
  1: {
    titulo: 'Peito, ombro e tríceps',
    grupo: 'peito',
    cardio: { tipo: 'esteira', min: 12 },
    ex: [
      E('supino-reto', 'Supino reto', 4, '6–10', 120, 'Escápulas juntas, peito alto. Desça em 2–3 s até o peito e pause 1 s.'),
      E('supino-inc-halter', 'Supino inclinado com halteres', 3, '8–12', 90, 'Banco a 30°. Desça fundo para alongar o peito.'),
      E('peck-deck', 'Crucifixo na máquina', 3, '12–15', 60, 'Aperte 1 segundo no meio.'),
      E('elev-lateral', 'Elevação lateral', 3, '12–20', 45, 'Carga leve, sem balanço.'),
      E('triceps-corda', 'Tríceps na polia com corda', 3, '10–15', 60, 'Cotovelos colados no corpo.'),
      E('pant-em-pe', 'Panturrilha em pé', 3, '10–15', 45, 'Desça tudo, pause 1 s embaixo.'),
    ],
  },
  2: {
    titulo: 'Costas, trapézio e antebraço',
    grupo: 'costas',
    cardio: { tipo: 'escada', min: 12 },
    patins: true,
    ex: [
      E('puxada-frontal', 'Puxada frontal aberta', 4, '8–12', 90, 'Puxe com os cotovelos, peito para cima.'),
      E('remada-apoiada', 'Remada com peito apoiado', 3, '8–12', 90, 'Cavalinho ou máquina. Não força a lombar.'),
      E('encolh-halter', 'Encolhimento com halteres', 3, '10–15', 60, 'Suba o ombro até a orelha e segure 1 s.'),
      E('face-pull', 'Face pull na polia', 3, '12–15', 45, 'Saúde do ombro e parte de trás do trapézio.'),
      E('rosca-w', 'Rosca direta com barra W', 3, '8–12', 60, 'Sem jogar o corpo.'),
      E('rosca-punho', 'Rosca de punho', 2, '15–20', 45, 'Antebraço apoiado no banco, só o punho se move.'),
    ],
  },
  3: {
    titulo: 'Glúteo e posterior',
    grupo: 'perna',
    perna: true,
    cardio: { tipo: 'caminhada', min: 8 },
    ex: [
      E('hip-thrust', 'Elevação pélvica', 4, '8–12', 150, 'Segure 1 s em cima. Levante-se devagar ao terminar.'),
      E('stiff', 'Stiff com halteres', 3, '8–12', 120, 'Quadril para trás, coluna reta. Suba devagar.'),
      E('mesa-flexora', 'Mesa flexora', 3, '10–15', 75),
      E('step-up', 'Subida no banco com halteres', 3, '12 cada perna', 60, 'Banco na altura do joelho. Empurre com o calcanhar da perna de cima, sem impulso da de baixo. É o movimento da remada do patins.'),
      E('abdutora', 'Cadeira abdutora', 3, '15–20', 60, 'Tronco inclinado à frente. Segure 1 s aberto: é o exercício do hip dip.'),
      E('pant-sentado', 'Panturrilha sentado', 3, '12–20', 45, 'Pause 1 s embaixo.'),
    ],
  },
  4: {
    titulo: 'Peito superior, ombro e braços',
    grupo: 'peito',
    cardio: { tipo: 'escada', min: 10 },
    patins: true,
    ex: [
      E('supino-inc', 'Supino inclinado', 4, '6–10', 120, 'Barra, Smith ou máquina.'),
      E('crossover-baixo', 'Crossover de baixo para cima', 4, '12–15', 60, 'Polias embaixo. Suba as mãos até a altura do queixo e aperte 1 s.'),
      E('desenv-maq', 'Desenvolvimento na máquina', 3, '8–12', 90),
      E('elev-lateral-cabo', 'Elevação lateral na polia', 3, '12–20', 45, 'Um braço de cada vez.'),
      E('triceps-frances', 'Tríceps francês', 3, '10–12', 60, 'Halter ou polia.'),
      E('rosca-martelo', 'Rosca martelo', 3, '10–12', 60, 'Engrossa o braço e o antebraço.'),
    ],
  },
  5: {
    titulo: 'Costas, trapézio e antebraço',
    grupo: 'costas',
    cardio: { tipo: 'esteira', min: 12 },
    ex: [
      E('remada-maq', 'Remada articulada', 4, '8–12', 90, 'Na máquina, com o peito apoiado.'),
      E('puxada-neutra', 'Puxada com pegada neutra', 3, '8–12', 90, 'Alongue bem em cima.'),
      E('encolh-barra', 'Encolhimento com barra', 3, '8–12', 75, 'Barra ou Smith. Mais pesado que na terça.'),
      E('crucifixo-inv', 'Crucifixo inverso', 3, '12–15', 45, 'Máquina ou halteres.'),
      E('rosca-inversa', 'Rosca inversa', 3, '12–15', 45, 'Pegada por cima. Trabalha o antebraço.'),
      E('rosca-punho-inv', 'Rosca de punho invertida', 2, '15–20', 45, 'Antebraço apoiado no banco, palmas para baixo. Só o punho sobe.'),
    ],
  },
  6: {
    titulo: 'Glúteo e quadríceps',
    grupo: 'perna',
    perna: true,
    cardio: { tipo: 'caminhada', min: 6 },
    ex: [
      E('leg-press', 'Leg press 45°', 4, '10–12', 150, 'Pés altos e afastados. Não trave o joelho.'),
      E('goblet', 'Agachamento goblet', 3, '8–10', 150, 'Pare com 3 repetições sobrando. Se a pressão estiver ruim, pule.'),
      E('extensora', 'Cadeira extensora', 2, '12–15', 75),
      E('hip-thrust-b', 'Elevação pélvica', 2, '12–15', 90, 'Mais leve que na quarta, mais repetições.'),
      E('abdutora-reta', 'Cadeira abdutora', 3, '15–20', 60, 'Hoje com as costas no encosto. Lateral do glúteo.'),
      E('adutora', 'Cadeira adutora', 3, '15–20', 45, 'Parte de dentro da coxa: é ela que puxa a perna de volta a cada passada no patins. Volte devagar.'),
      E('pant-em-pe', 'Panturrilha em pé', 3, '10–15', 45, 'Pause 1 s embaixo.'),
    ],
  },
  0: { titulo: 'Descanso', descanso: true, patins: true, ex: [] },
}

// Plano a partir de 20/11/2026. Semana de ~1 hora por dia, sexta de descanso, e treinos longos (até 2 h)
// no sábado (perna) e no domingo (peito, ombro e acessórios). Antebraço, trapézio e panturrilha ficam no fim de semana.
// Cada grupo tem pelo menos 72 h entre um treino e outro: perna ter/sáb, peito qua/dom, costas seg/qui.
export const PLAN = {
  1: {
    titulo: 'Costas e bíceps',
    grupo: 'costas',
    cardio: { tipo: 'esteira', min: 12 },
    patins: true,
    ex: [
      E('puxada-frontal', 'Puxada frontal aberta', 4, '8–12', 90, 'Puxe com os cotovelos, peito para cima.'),
      E('remada-apoiada', 'Remada com peito apoiado', 4, '8–12', 90, 'Cavalinho ou máquina. Não força a lombar.'),
      E('remada-baixa', 'Remada baixa com triângulo', 3, '10–12', 75, 'Segure 1 s com as escápulas juntas.'),
      E('face-pull', 'Face pull na polia', 3, '12–15', 45, 'Saúde do ombro e parte de trás do ombro.'),
      E('rosca-w', 'Rosca direta com barra W', 3, '8–12', 60, 'Sem jogar o corpo.'),
      E('rosca-martelo', 'Rosca martelo', 3, '10–12', 60, 'Engrossa o braço e o antebraço.'),
    ],
  },
  2: {
    titulo: 'Glúteo e perna',
    grupo: 'perna',
    perna: true,
    cardio: { tipo: 'caminhada', min: 8 },
    ex: [
      E('hip-thrust', 'Elevação pélvica', 4, '8–12', 150, 'Segure 1 s em cima. Levante-se devagar ao terminar.'),
      E('leg-press', 'Leg press 45°', 3, '10–12', 150, 'Pés altos e afastados. Não trave o joelho.'),
      E('stiff', 'Stiff com halteres', 3, '8–12', 120, 'Quadril para trás, coluna reta. Suba devagar.'),
      E('mesa-flexora', 'Mesa flexora', 3, '10–15', 75),
      E('abdutora', 'Cadeira abdutora', 3, '15–20', 60, 'Tronco inclinado à frente. Segure 1 s aberto: é o exercício do hip dip.'),
    ],
  },
  3: {
    titulo: 'Peito e ombro',
    grupo: 'peito',
    cardio: { tipo: 'escada', min: 10 },
    ex: [
      E('supino-reto', 'Supino reto', 4, '6–10', 120, 'Escápulas juntas, peito alto. Desça em 2–3 s até o peito e pause 1 s.'),
      E('supino-inc-halter', 'Supino inclinado com halteres', 3, '8–12', 90, 'Banco a 30°. Desça fundo para alongar o peito.'),
      E('crossover-baixo', 'Crossover de baixo para cima', 3, '12–15', 60, 'Polias embaixo. Suba as mãos até a altura do queixo e aperte 1 s.'),
      E('desenv-maq', 'Desenvolvimento na máquina', 3, '8–12', 90),
      E('elev-lateral', 'Elevação lateral', 3, '12–20', 45, 'Carga leve, sem balanço.'),
      E('triceps-corda', 'Tríceps na polia com corda', 3, '10–15', 60, 'Cotovelos colados no corpo.'),
    ],
  },
  4: {
    titulo: 'Costas e ombro posterior',
    grupo: 'costas',
    cardio: { tipo: 'esteira', min: 12 },
    patins: true,
    ex: [
      E('remada-maq', 'Remada articulada', 4, '8–12', 90, 'Na máquina, com o peito apoiado.'),
      E('puxada-neutra', 'Puxada com pegada neutra', 3, '8–12', 90, 'Alongue bem em cima.'),
      E('remada-unilateral', 'Remada unilateral com halter', 3, '10–12', 60, 'Joelho e mão no banco, puxe o halter até o quadril.'),
      E('crucifixo-inv', 'Crucifixo inverso', 3, '12–15', 45, 'Máquina ou halteres.'),
      E('rosca-polia', 'Rosca na polia', 3, '10–12', 60, 'Cotovelos parados ao lado do corpo.'),
    ],
  },
  5: { titulo: 'Descanso', descanso: true, patins: true, opcional: true, ex: [] },
  6: {
    titulo: 'Perna completa',
    grupo: 'perna',
    perna: true,
    longo: true,
    cardio: { tipo: 'caminhada', min: 10 },
    ex: [
      E('leg-press', 'Leg press 45°', 4, '10–12', 150, 'Pés altos e afastados. Não trave o joelho.'),
      E('hack', 'Agachamento no hack', 3, '8–10', 150, 'Costas apoiadas: seguro para a pressão. Pare com 2 repetições sobrando.'),
      E('hip-thrust-b', 'Elevação pélvica', 4, '10–12', 120, 'Segure 1 s em cima. Levante-se devagar.'),
      E('extensora', 'Cadeira extensora', 3, '12–15', 75),
      E('flexora-sentado', 'Cadeira flexora', 3, '10–15', 75),
      E('step-up', 'Subida no banco com halteres', 3, '12 cada perna', 90, 'Empurre com o calcanhar da perna de cima. É o movimento da passada do patins.'),
      E('abdutora-reta', 'Cadeira abdutora', 3, '15–20', 60, 'Costas no encosto. Lateral do glúteo.'),
      E('adutora', 'Cadeira adutora', 3, '15–20', 45, 'Parte de dentro da coxa: puxa a perna de volta a cada passada no patins.'),
      E('pant-em-pe', 'Panturrilha em pé', 4, '10–15', 60, 'Desça tudo, pause 1 s embaixo.'),
      E('pant-sentado', 'Panturrilha sentado', 3, '12–20', 45, 'Pause 1 s embaixo.'),
    ],
  },
  0: {
    titulo: 'Peito, ombro e acessórios',
    grupo: 'peito',
    longo: true,
    cardio: { tipo: 'esteira', min: 10 },
    ex: [
      E('supino-inc', 'Supino inclinado', 4, '6–10', 120, 'Barra, Smith ou máquina.'),
      E('supino-reto-halter', 'Supino reto com halteres', 3, '8–12', 90, 'Desça bem para alongar o peito.'),
      E('peck-deck', 'Crucifixo na máquina', 3, '12–15', 60, 'Aperte 1 segundo no meio.'),
      E('desenv-halter', 'Desenvolvimento com halteres', 3, '8–12', 90, 'Sentado, costas apoiadas.'),
      E('elev-lateral-cabo', 'Elevação lateral na polia', 4, '12–20', 45, 'Um braço de cada vez.'),
      E('triceps-corda-alto', 'Tríceps na polia acima da cabeça', 3, '10–12', 60, 'De costas para a polia, corda atrás da cabeça. Deixa o braço grosso.'),
      E('encolh-halter', 'Encolhimento com halteres', 4, '10–15', 60, 'Suba o ombro até a orelha e segure 1 s.'),
      E('rosca-inversa', 'Rosca inversa', 3, '12–15', 45, 'Pegada por cima. Trabalha o antebraço.'),
      E('rosca-punho', 'Rosca de punho', 3, '15–20', 45, 'Antebraço apoiado no banco, só o punho se move.'),
      E('rosca-punho-inv', 'Rosca de punho invertida', 3, '15–20', 45, 'Palmas para baixo. Só o punho sobe.'),
    ],
  },
}

// Treino opcional da sexta: abdômen e cardio leve. Não pesa perna, peito nem costas, para não atrapalhar o fim de semana.
export const OPCIONAL = {
  titulo: 'Abdômen e cardio',
  grupo: 'core',
  opcional: true,
  cardio: { tipo: 'esteira', min: 15 },
  ex: [
    E('abd-polia', 'Abdominal na polia ajoelhado', 3, '12–15', 60, 'Corda atrás da cabeça, enrole o tronco levando os cotovelos aos joelhos. Solte o ar ao descer.'),
    E('elev-pernas', 'Elevação de pernas no banco', 3, '10–15', 60, 'Deitado, mãos segurando o banco. Suba as pernas e tire o quadril do banco no fim. Desça devagar.'),
    E('pallof', 'Pallof press na polia', 2, '10 cada lado', 45, 'De lado para a polia, empurre a alça à frente do peito sem deixar o tronco girar.'),
    E('prancha', 'Prancha', 3, '30–45 s', 45, 'Cotovelos sob os ombros, corpo reto, glúteo contraído. Respire normalmente. Anote os segundos em repetições.'),
    E('prancha-lateral', 'Prancha lateral', 2, '20–30 s cada lado', 45, 'Joelhos no chão para facilitar. Anote os segundos em repetições.'),
  ],
}

// Primeiro dia do plano novo. Antes dele, cada data usa o plano antigo.
export const INICIO_PLANO = '2026-11-20'
export const planoBase = (date) => (date < INICIO_PLANO ? PLAN_ANTIGO : PLAN)
const diaDe = (date) => new Date(`${date}T12:00:00`).getDay()
// Treino previsto para uma data, sem considerar reposição.
export const previstoEm = (date) => planoBase(date)[diaDe(date)]

export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Treino de uma data. No dia de descanso, se um treino da semana foi reposto, logs[data].repoe guarda o dia da semana.
export function planoDe(logs, date) {
  const repoe = logs?.[date]?.repoe
  // Reposição nova guarda a data do treino perdido; a antiga guardava só o dia da semana.
  if (logs?.[date]?.extra) return { ...OPCIONAL, extra: true }
  if (typeof repoe === 'string') { const wd = diaDe(repoe); return { ...planoBase(repoe)[wd], repoe: wd } }
  if (repoe) return { ...planoBase(date)[repoe], repoe }
  return planoBase(date)[diaDe(date)]
}
export const ORDEM = [1, 2, 3, 4, 5, 6, 0]
export const AQUECIMENTO = 5

// Estimativa em minutos: aquecimento + séries (40 s cada) + descansos + troca de aparelho + cardio.
export function duracao(p) {
  if (!p.ex?.length) return 0
  const seg = p.ex.reduce((t, e) => t + e.series * (40 + e.desc) + 60, 0)
  return Math.round(((p.longo ? 10 : AQUECIMENTO) * 60 + seg + (p.cardio?.min || 0) * 60) / 300) * 5
}

// Fotos de início e fim do movimento: free-exercise-db (domínio público), em src/img/<id>.jpg.
const FOTOS = import.meta.glob('./img/*.jpg', { eager: true, import: 'default' })
const MESMA_FOTO = { 'hip-thrust-b': 'hip-thrust', 'abdutora-reta': 'abdutora' }
export const foto = (id) => FOTOS[`./img/${MESMA_FOTO[id] || id}.jpg`]
// Busca no YouTube pelo nome do exercício, em vez de um vídeo fixo que pode sair do ar.
export const video = (nome) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nome} execução correta`)}`

export const fmtDesc = (s) => (s >= 120 ? `${String(s / 60).replace('.', ',')} min` : `${s} s`)
