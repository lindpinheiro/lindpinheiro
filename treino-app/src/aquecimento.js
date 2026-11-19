// Aquecimento antes da musculação (dinâmico: alongamento parado e longo antes de levantar peso tira força)
// e alongamento estático depois do patins. Tudo em pé ou sentado, para não forçar a pressão.
const A = (id, nome, dose, como) => ({ id, nome, dose, como })

const CORRIDA = A('cardio-leve', 'Esteira ou bicicleta leve', '2 min', 'Só para esquentar. Ritmo de conversa.')
const PERNA_FRENTE = A('perna-frente', 'Balanço de perna para a frente', '10 cada', 'Segure num apoio e balance a perna esticada para a frente e para trás, aumentando aos poucos.')
const PERNA_LADO = A('perna-lado', 'Balanço de perna para o lado', '10 cada', 'De frente para o apoio, balance a perna de um lado para o outro. Solta o quadril para a passada do patins.')
const TORNOZELO = A('tornozelo', 'Joelho na parede', '10 cada', 'Pé a um palmo da parede, leve o joelho até encostar sem tirar o calcanhar do chão. É a flexão de tornozelo que o patins pede.')

export const AQUEC = {
  superior: [
    CORRIDA,
    A('bracos', 'Círculos de braço', '10 para cada lado', 'Braços abertos, comece pequeno e aumente.'),
    A('tronco', 'Rotação de tronco em pé', '10 cada lado', 'Braços cruzados no peito, gire o tronco sem mexer o quadril.'),
    A('elastico', 'Abertura de braços com elástico ou polia leve', '15', 'Puxe abrindo os braços na altura do peito. Acorda a parte de trás do ombro antes de empurrar peso.'),
    PERNA_FRENTE,
    PERNA_LADO,
  ],
  perna: [
    { ...CORRIDA, dose: '3 min' },
    PERNA_FRENTE,
    PERNA_LADO,
    TORNOZELO,
    A('passo-lateral', 'Passo lateral', '10 passos cada lado', 'Semiagachado, com ou sem miniband nos joelhos. Ativa a lateral do glúteo, que segura o joelho no patins.'),
    A('agacha-leve', 'Agachamento só com o corpo', '10 lentos', 'Desça até onde for confortável e suba devagar. Solte o ar na subida.'),
  ],
  // Antes de andar de patins.
  antesPatins: [
    A('marcha', 'Marcha no lugar', '1 min', 'Joelhos altos, sem pressa.'),
    PERNA_FRENTE,
    PERNA_LADO,
    TORNOZELO,
    A('passo-lateral', 'Passo lateral semiagachado', '10 passos cada lado', 'Na posição do patins: joelhos dobrados, tronco à frente.'),
  ],
}

export const aquecDoDia = (p) => (p.perna ? AQUEC.perna : AQUEC.superior)

// Rotinas de alongamento do fim do treino: 3 exercícios parados, 45 s cada, em tatame, chão, parede ou trave.
// Revezam a cada dia (A, B, C). Cada uma cobre quadril, a parte de trás do corpo e tronco ou ombros.
const ALONG_A = [
    A('afundo-ajoelhado', 'Afundo ajoelhado com braço para cima', '45 s cada lado',
      'Um joelho no tatame, o outro pé à frente. Aperte o glúteo de trás, leve o quadril à frente e estique o braço do lado do joelho para cima, inclinando para o outro lado. Solta a frente do quadril e a lateral do tronco.'),
    A('esquadro-trave', 'Esquadro na trave ou na parede', '45 s',
      'Mãos na trave ou na parede, na altura do quadril. Ande para trás até o tronco ficar paralelo ao chão, braços esticados, peito descendo, calcanhares no chão. Estica panturrilha, posterior, costas e ombros.'),
    A('figura-4', 'Figura 4 deitado', '45 s cada lado',
      'Deitado, cruze o tornozelo sobre o joelho oposto e puxe a coxa de baixo para o peito. Solta glúteo e lombar. Para levantar, role de lado e suba devagar.'),
]
const ALONG_B = [
    A('peito-trave', 'Peito e ombro na trave', '45 s cada lado',
      'Antebraço apoiado na trave ou no batente, cotovelo na altura do ombro. Dê um passo à frente e gire o tronco para o lado oposto. Abre o peito e a frente do ombro, que fecham com supino e celular.'),
    A('borboleta', 'Borboleta sentado', '45 s',
      'Sentado no tatame, solas dos pés juntas e joelhos abertos. Segure os pés e incline o tronco à frente com a coluna reta. Solta a parte de dentro da coxa, que trabalha muito no patins.'),
    A('esfinge', 'Esfinge no tatame', '45 s',
      'De barriga para baixo, apoie os antebraços e levante o peito, quadril no chão. Ombros longe das orelhas. Estica abdômen e frente do quadril e destrava a lombar.'),
]
const ALONG_C = [
    A('pendurado', 'Pendurado na barra com os pés no chão', '30–45 s',
      'Segure uma barra baixa ou o espaldar e dobre os joelhos, deixando o corpo pender com os pés no chão aguentando parte do peso. Solta costas, ombros e coluna inteira.'),
    A('posterior-parede', 'Posterior deitado com a perna na parede', '45 s cada lado',
      'Deitado no chão perto do batente, apoie uma perna esticada na parede e deixe a outra no chão. Chegue mais perto da parede para aumentar. Solta a parte de trás da coxa sem forçar a lombar.'),
    A('torcao', 'Torção deitado', '45 s cada lado',
      'Deitado de costas, braços abertos, leve os dois joelhos dobrados para um lado e olhe para o outro. Destrava a coluna e a lateral do quadril. Levante rolando de lado.'),
]
export const ALONGAMENTOS = { A: ALONG_A, B: ALONG_B, C: ALONG_C }
AQUEC.depois = ALONG_A

// Rotina do dia, revezando A → B → C a cada dia do calendário.
export const alongamentoDoDia = (date) => 'ABC'[Math.round((new Date(`${date}T12:00:00`) - new Date('2026-01-01T12:00:00')) / 864e5) % 3]
