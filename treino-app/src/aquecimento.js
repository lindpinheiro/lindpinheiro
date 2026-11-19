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
  // Os 3 alongamentos do dia: depois do treino ou do patins. Parados, 45 s cada lado, soltando o ar devagar.
  // Cobrem frente do quadril e coxa, toda a parte de trás (panturrilha, posterior, costas, ombros) e glúteo.
  depois: [
    A('afundo-ajoelhado', 'Afundo ajoelhado com braço para cima', '45 s cada lado',
      'Um joelho no tatame, o outro pé à frente. Aperte o glúteo de trás, leve o quadril à frente e estique o braço do lado do joelho para cima, inclinando para o outro lado. Solta a frente do quadril e a lateral do tronco.'),
    A('esquadro-trave', 'Esquadro na trave ou na parede', '45 s',
      'Mãos na trave ou na parede, na altura do quadril. Ande para trás até o tronco ficar paralelo ao chão, braços esticados, peito descendo, calcanhares no chão. Estica panturrilha, posterior, costas e ombros.'),
    A('figura-4', 'Figura 4 deitado', '45 s cada lado',
      'Deitado, cruze o tornozelo sobre o joelho oposto e puxe a coxa de baixo para o peito. Solta glúteo e lombar. Para levantar, role de lado e suba devagar.'),
  ],
}

export const aquecDoDia = (p) => (p.perna ? AQUEC.perna : AQUEC.superior)
