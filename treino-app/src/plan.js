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

// Cada dia cabe em ~1 hora: 5 min de aquecimento + musculação + cardio.
export const PLAN = {
  1: {
    titulo: 'Peito, ombro e tríceps',
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
    perna: true,
    cardio: { tipo: 'caminhada', min: 8 },
    ex: [
      E('hip-thrust', 'Elevação pélvica', 4, '8–12', 150, 'Segure 1 s em cima. Levante-se devagar ao terminar.'),
      E('stiff', 'Stiff com halteres', 3, '8–12', 120, 'Quadril para trás, coluna reta. Suba devagar.'),
      E('mesa-flexora', 'Mesa flexora', 3, '10–15', 75),
      E('abdutora', 'Cadeira abdutora', 3, '15–20', 60, 'Tronco inclinado à frente. Segure 1 s aberto: é o exercício do hip dip.'),
      E('pant-sentado', 'Panturrilha sentado', 3, '12–20', 45, 'Pause 1 s embaixo.'),
    ],
  },
  4: {
    titulo: 'Peito superior, ombro e braços',
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
    cardio: { tipo: 'esteira', min: 12 },
    ex: [
      E('remada-maq', 'Remada articulada', 4, '8–12', 90, 'Na máquina, com o peito apoiado.'),
      E('puxada-neutra', 'Puxada com pegada neutra', 3, '8–12', 90, 'Alongue bem em cima.'),
      E('encolh-barra', 'Encolhimento com barra', 3, '8–12', 75, 'Barra ou Smith. Mais pesado que na terça.'),
      E('crucifixo-inv', 'Crucifixo inverso', 3, '12–15', 45, 'Máquina ou halteres.'),
      E('rosca-inversa', 'Rosca inversa', 3, '12–15', 45, 'Pegada por cima. Trabalha o antebraço.'),
      E('farmer', 'Caminhada do fazendeiro', 2, '30–40 s', 60, 'Halteres pesados, ande reto. Anote os segundos em "reps".'),
    ],
  },
  6: {
    titulo: 'Glúteo e quadríceps',
    perna: true,
    cardio: { tipo: 'caminhada', min: 6 },
    ex: [
      E('leg-press', 'Leg press 45°', 4, '10–12', 150, 'Pés altos e afastados. Não trave o joelho.'),
      E('goblet', 'Agachamento goblet', 3, '8–10', 150, 'Pare com 3 repetições sobrando. Se a pressão estiver ruim, pule.'),
      E('extensora', 'Cadeira extensora', 3, '12–15', 75),
      E('hip-thrust-b', 'Elevação pélvica', 3, '10–15', 90, 'Mais leve que na quarta, mais repetições.'),
      E('abdutora-reta', 'Cadeira abdutora', 3, '15–20', 60, 'Hoje com as costas no encosto. Lateral do glúteo.'),
      E('pant-em-pe', 'Panturrilha em pé', 3, '10–15', 45, 'Pause 1 s embaixo.'),
    ],
  },
  0: { titulo: 'Descanso', descanso: true, patins: true, ex: [] },
}

export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const ORDEM = [1, 2, 3, 4, 5, 6, 0]
export const AQUECIMENTO = 5

// Estimativa em minutos: aquecimento + séries (40 s cada) + descansos + troca de aparelho + cardio.
export function duracao(p) {
  if (!p.ex.length) return 0
  const seg = p.ex.reduce((t, e) => t + e.series * (40 + e.desc) + 60, 0)
  return Math.round((AQUECIMENTO * 60 + seg + (p.cardio?.min || 0) * 60) / 300) * 5
}

// Fotos de início e fim do movimento: free-exercise-db (domínio público), em src/img/<id>.jpg.
const FOTOS = import.meta.glob('./img/*.jpg', { eager: true, import: 'default' })
const MESMA_FOTO = { 'hip-thrust-b': 'hip-thrust', 'abdutora-reta': 'abdutora' }
export const foto = (id) => FOTOS[`./img/${MESMA_FOTO[id] || id}.jpg`]
// Busca no YouTube pelo nome do exercício, em vez de um vídeo fixo que pode sair do ar.
export const video = (nome) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nome} execução correta`)}`

export const fmtDesc = (s) => (s >= 120 ? `${String(s / 60).replace('.', ',')} min` : `${s} s`)
