import React, { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper, Stack, Typography } from '@mui/material'
import { CalendarDays, ChevronDown, Clock, Ruler, Shirt, HeartPulse, Sparkles, TrendingUp, TriangleAlert, Utensils, Wind } from 'lucide-react'
import { DIAS, ORDEM, PLAN, CARDIO, duracao } from './plan.js'

const Itens = ({ children }) => (
  <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', '& li': { mb: 1 }, '& li:last-child': { mb: 0 }, '& b': { color: 'text.primary', fontWeight: 500 } }}>
    {children}
  </Box>
)

const SECOES = [
  { id: 'semana', icone: CalendarDays, titulo: 'A semana', corpo: (
    <Stack spacing={1.25}>
      {ORDEM.map((wd) => {
        const p = PLAN[wd]
        return (
          <Stack key={wd} direction="row" spacing={2}>
            <Typography color="primary" sx={{ width: 44, flexShrink: 0, fontWeight: 600 }}>{DIAS[wd]}</Typography>
            <Box>
              <Typography>{p.titulo}</Typography>
              <Typography variant="body2" color="textSecondary">
                {[p.cardio && `${CARDIO[p.cardio.tipo].nome} ${p.cardio.min} min`, p.patins && 'Patins'].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Stack>
        )
      })}
    </Stack>
  ) },
  { id: 'hora', icone: Clock, titulo: 'Duração dos treinos', corpo: (
    <Itens>
      <li><b>Segunda a quinta, cerca de 1 hora</b>: 5 min de aquecimento, 5 ou 6 exercícios e 8 a 12 min de cardio. Respeite o cronômetro de descanso: é ele que mantém o treino no horário do almoço.</li>
      <li><b>Sábado e domingo, até 2 horas</b>: perna completa no sábado ({duracao(PLAN[6])} min) e peito, ombro e acessórios no domingo ({duracao(PLAN[0])} min). Antebraço, trapézio e panturrilha ficam aqui, para não ocupar os dias curtos.</li>
      <li><b>Nos treinos longos</b>: faça uma refeição 1 a 2 h antes, leve água e uma fruta, e beba entre os exercícios. No sábado de perna, os descansos são mais longos de propósito, por causa da pressão.</li>
      <li><b>Sexta é descanso</b>, para chegar inteiro no fim de semana. Se estiver com vontade, há um treino opcional de abdômen e cardio leve (cerca de 45 min) ou patins leve.</li>
      <li>Sem tempo? Corte o último exercício, nunca o primeiro. Com a academia cheia, use “Trocar exercício”.</li>
      <li><b>Faltou um dia?</b> Na sexta, a aba Treino mostra o que ficou para trás e sugere repor só o que não bate com o fim de semana. Perna e peito perdidos na semana não precisam de reposição: sábado e domingo já cobrem.</li>
    </Itens>
  ) },
  { id: 'cardio', icone: HeartPulse, titulo: 'Cardio na academia', corpo: (
    <Itens>
      <li><b>Esteira inclinada</b> (segunda, quinta e domingo): 5–6 km/h com 8–12% de inclinação. Gasta bastante e poupa o joelho.</li>
      <li><b>Escada</b> (quarta): nível 4–6. Trabalha glúteo e panturrilha. Diminua o ritmo nos 2 últimos minutos; parar de uma vez pode derrubar a pressão.</li>
      <li><b>Caminhada leve</b> (terça e sábado): só para a circulação voltar ao normal depois da perna. Nada de escada nesses dias.</li>
      <li><b>Dia só de cardio</b>: em qualquer dia, “Trocar por cardio hoje” troca a musculação por cerca de 1 hora de bicicleta, esteira ou escada. Use no máximo 2 vezes por semana, de preferência no lugar de um treino de costas: musculação é o que mantém o músculo enquanto você emagrece. Na sexta, dá para fazer cardio em vez de descansar.</li>
      <li><b>Bicicleta</b> é a mais leve para os joelhos; <b>escada</b> é a que mais gasta, mas evite na véspera do sábado de perna.</li>
      <li>Intensidade certa: você consegue falar frases inteiras, mas não cantar.</li>
      <li>Quando ficar fácil, aumente a inclinação ou o nível, não o tempo.</li>
    </Itens>
  ) },
  { id: 'pressao', icone: TriangleAlert, titulo: 'Pressão baixa no treino de perna', corpo: (
    <>
      <Itens>
        <li><b>Coma 1–2 h antes</b>: carboidrato e um pouco de sal. Nunca treine perna em jejum.</li>
        <li><b>Beba água</b>: cerca de 500 ml na hora anterior e goles durante.</li>
        <li><b>Solte o ar na subida</b> de cada repetição.</li>
        <li><b>Descanse 2–3 minutos</b> e pare com 2–3 repetições sobrando.</li>
        <li><b>Não fique parado em pé</b> depois da série. Levante-se devagar dos aparelhos.</li>
        <li><b>Tontura, visão escura, suor frio ou enjoo</b>: pare, deite com as pernas elevadas e beba água. Se não passar por completo, encerre o dia.</li>
      </Itens>
      <Typography color="textSecondary" sx={{ mt: 2 }}>
        Conte sobre essas quedas a um médico antes de aumentar a intensidade — principalmente se você toma remédio para pressão, já desmaiou ou sente dor no peito.
      </Typography>
    </>
  ) },
  { id: 'progressao', icone: TrendingUp, titulo: 'Como progredir', corpo: (
    <Itens>
      <li>Comece com uma carga que permita o <b>mínimo da faixa</b> de repetições com boa execução.</li>
      <li>Quando fizer o <b>máximo da faixa em todas as séries</b>, aumente a carga no treino seguinte.</li>
      <li><b>O app avisa</b> no topo de cada exercício: <b>suba</b> (seta verde), <b>mantenha e tente mais uma repetição</b>, ou <b>mantenha</b> se ficou abaixo da faixa. A sugestão já vem preenchida nas séries.</li>
      <li><b>Quanto subir</b>: 2,5 kg nos exercícios de tronco, 5 kg nos de perna e 2 kg por halter. Se a máquina não tiver esse passo, use o próximo peso disponível.</li>
      <li><b>Halteres e exercícios de um lado só</b>: toque em “kg total” acima das séries para trocar para “kg por lado”. Assim as contas de progresso e volume ficam certas.</li>
      <li>Voltando de uma pausa: na <b>primeira semana</b> use cargas mais leves e uma série a menos. A força antiga volta rápido.</li>
      <li>A cada 6–8 semanas, uma semana leve com metade das séries.</li>
    </Itens>
  ) },
  { id: 'peito', icone: Shirt, titulo: 'Peito que não cresce', corpo: (
    <Itens>
      <li><b>Domingo é dia de peito inferior e das bordas</b>, a parte que desenha o contorno: supino declinado na máquina, crossover de cima para baixo e crucifixos (com alongamento para a borda lateral e com aperto no meio para a interna). O peito superior fica na quarta, com o inclinado e o crossover de baixo para cima.</li>
      <li><b>O contorno aparece com menos gordura</b>: o músculo cresce com o treino, mas a linha embaixo do peito e a separação no meio só ficam visíveis conforme o percentual de gordura cai. Dieta e treino andam juntos aqui.</li>
      <li><b>Banco a 30°</b>, não 45°: mais inclinado que isso, quem trabalha é o ombro. A barra ou os halteres descem na parte de cima do peito, perto da clavícula, com os cotovelos a uns 45° do corpo.</li>
      <li>Grave uma série de lado de vez em quando: se a barra está descendo no meio do peito, o inclinado virou supino reto.</li>
      <li><b>Execução vale mais que o exercício</b>: escápulas juntas e peito alto o tempo todo. Se o ombro vai para a frente, quem trabalha é o ombro.</li>
      <li><b>Alongue sob carga</b>: desça devagar e fundo, com pausa de 1 s embaixo. Halteres e máquinas permitem descer mais que a barra.</li>
      <li><b>Chegue perto da falha</b>: termine cada série com 1 ou 2 repetições sobrando, não 5.</li>
      <li><b>Volume</b>: o plano tem 18 séries de peito por semana, em dois dias. Antes de somar mais, garanta que a carga está subindo.</li>
      <li>Parte do volume aparece só com menos gordura: ela esconde o contorno do músculo.</li>
    </Itens>
  ) },
  { id: 'hipdip', icone: Ruler, titulo: 'Hip dip', corpo: (
    <Itens>
      <li>O hip dip é o espaço entre o osso do quadril e o do fêmur. <b>O formato do osso não muda</b> com treino.</li>
      <li>O que dá para fazer é <b>suavizar</b>: desenvolver a lateral e a parte de cima do glúteo e reduzir a gordura da cintura.</li>
      <li>Por isso a <b>cadeira abdutora</b> entra na terça e no sábado, além da elevação pélvica nos dois dias.</li>
      <li>Na abdutora, segure 1 s aberto e volte devagar. Carga que você controla, não tranco.</li>
      <li>Os patins ajudam: o movimento lateral usa justamente esse músculo.</li>
    </Itens>
  ) },
  { id: 'comida', icone: Utensils, titulo: 'Alimentação', corpo: (
    <Itens>
      <li>O plano completo, com porções e trocas, está na aba <b>Dieta</b>.</li>
      <li><b>Resumo</b>: cerca de 2.100 kcal e 160 g de proteína, em três refeições.</li>
      <li><b>Jejum</b>: só segunda, terça e quarta, comendo das 10h30 às 19h.</li>
      <li><b>Livres</b>: fast food duas vezes por semana no lugar da janta; açaí completo a cada duas semanas.</li>
      <li><b>Ritmo</b>: cerca de 0,5 kg por semana.</li>
      <li><b>Sem refrigerante, suco e doce no dia a dia</b>: é onde a conta estoura sem matar a fome.</li>
      <li><b>Água e sono</b>: 3 litros e 7–8 horas por dia.</li>
    </Itens>
  ) },
  { id: 'patins', icone: Wind, titulo: 'Patins', corpo: (
    <Itens>
      <li><b>2 a 3 vezes por semana, 30–45 min</b>, em ritmo de conversa.</li>
      <li>Dias sugeridos: segunda, quinta e sexta (leve). Nesses dias o cardio da academia é opcional. Evite patins forte na véspera do sábado de perna.</li>
      <li><b>Antes de andar</b>: 5 min soltando quadril e tornozelo (na aba Treino, nos dias de patins). <b>Depois</b>: o alongamento do dia (rotina A, B ou C), que fica no fim de todo treino.</li>
      <li><b>O que mais melhora o patins na academia</b>: subida no banco e cadeiras abdutora e adutora, no sábado. Elas treinam o empurrar para o lado e o puxar de volta de cada passada.</li>
      <li>Capacete, munhequeira e joelheira sempre.</li>
    </Itens>
  ) },
  { id: 'esperar', icone: Sparkles, titulo: 'O que esperar', corpo: (
    <Itens>
      <li><b>1 mês</b>: cargas voltando perto do que eram. Músculo que já existiu volta mais rápido do que se constrói.</li>
      <li><b>3 meses</b>: 6–10 kg a menos; peito, ombro e costas aparecendo.</li>
      <li><b>10–12 meses</b>: perto dos 95 kg, no ritmo de meio quilo por semana.</li>
      <li>O que mais atrasa é parar e recomeçar. Semana ruim com 3 treinos vale mais que semana perfeita seguida de pausa.</li>
      <li>Constância vale mais que intensidade.</li>
    </Itens>
  ) },
]

export default function Guia() {
  const [aberto, setAberto] = useState('semana')
  return (
    <>
      <Typography variant="h4">Guia</Typography>
      <Typography color="textSecondary" sx={{ mt: 1, mb: 3 }}>
        Perder gordura devagar enquanto ganha músculo: musculação seis dias por semana, cardio curto no fim e patins como extra.
      </Typography>
      <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        {SECOES.map(({ id, icone: Icone, titulo, corpo }, i) => (
          <Accordion key={id} square expanded={aberto === id} onChange={() => setAberto(aberto === id ? null : id)}
            sx={{ borderBottom: i < SECOES.length - 1 ? 1 : 0, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 2 } }}>
              <Box sx={{ color: 'primary.main', display: 'flex' }}><Icone size={20} /></Box>
              <Typography variant="subtitle1">{titulo}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2.5 }}>{corpo}</AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </>
  )
}
