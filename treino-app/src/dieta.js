// Plano: ~2.100 kcal e ~160 g de proteína por dia, em 3 refeições.
// Jejum só de segunda a quarta (janela 10h30–19h); nos outros dias o horário é livre.
export const JANELA = { abre: 10 * 60 + 30, fecha: 19 * 60 }
export const DIAS_JEJUM = [1, 2, 3] // seg, ter, qua
export const LIVRES_SEMANA = 2 // refeições livres por semana, sempre no lugar da janta
export const AGUA_META = 6 // garrafas de 500 ml
export const TOTAL = { kcal: 2100, prot: 160 }
export const EXTRAS = [
  { id: 'choc', nome: 'Chocolate', porcao: '1 por dia', limite: 7, dias: 7 },
  { id: 'acai', nome: 'Açaí completo', porcao: '700 ml · a cada 2 semanas', limite: 1, dias: 14 },
]

export const REFEICOES = [
  {
    id: 'merenda', hora: '10h30', nome: 'Merenda', jejum: 'Quebra o jejum e serve de pré-treino', livre: 'Até 1h30 antes do treino', kcal: 580, prot: 28,
    base: ['Cuscuz pronto: 1 xícara cheia', 'Manteiga: 1 colher de sopa rasa', '3 ovos', 'Café sem açúcar'],
    trocas: [
      'Cuscuz + 2 ovos + 1 fatia grossa de queijo',
      'Cuscuz + 4 colheres de sopa de carne moída',
      '2 pães franceses + 3 ovos mexidos',
      '3 fatias de pão de forma + 2 ovos + queijo',
    ],
  },
  {
    id: 'almoco', hora: '13h', nome: 'Almoço', jejum: 'Logo depois do treino', livre: 'Logo depois do treino', kcal: 820, prot: 68,
    base: ['Arroz: 6 colheres de sopa', 'Feijão: 1 concha', 'Carne: 200 g pronta (duas palmas da mão)', 'Salada e verduras à vontade', '1 fruta'],
    trocas: ['No lugar do arroz: 1 pegador e meio de macarrão', 'No lugar do arroz: 250 g de batata cozida ou assada'],
  },
  {
    id: 'janta', hora: '18h30', nome: 'Janta', jejum: 'Termine até as 19h', livre: 'No horário que preferir', kcal: 700, prot: 64, podeLivre: true,
    base: ['Arroz: 4 colheres de sopa', 'Feijão: 1 concha', 'Carne: 200 g pronta (duas palmas da mão)', 'Legumes ou salada à vontade'],
    trocas: ['No lugar do arroz: 1 pegador de macarrão', 'No lugar do arroz: 200 g de batata', 'Cuscuz com carne moída: 1 xícara de cuscuz + 200 g de carne'],
  },
]
