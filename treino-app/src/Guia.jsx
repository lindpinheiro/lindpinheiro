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
              <Typography variant="body2" color="text.secondary">
                {[p.cardio && `${CARDIO[p.cardio.tipo].nome} ${p.cardio.min} min`, p.patins && 'Patins'].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Stack>
        )
      })}
    </Stack>
  ) },
  { id: 'hora', icone: Clock, titulo: 'Treino em 1 hora', corpo: (
    <Itens>
      <li><b>5 min de aquecimento</b> na esteira ou bicicleta, leve.</li>
      <li><b>35–45 min de musculação</b>: 5 ou 6 exercícios. Respeite o cronômetro de descanso — é ele que mantém o treino dentro do tempo.</li>
      <li><b>6–12 min de cardio</b> para fechar.</li>
      <li>Cada dia leva de {Math.min(...ORDEM.filter((d) => d).map((d) => duracao(PLAN[d])))} a {Math.max(...ORDEM.map((d) => duracao(PLAN[d])))} minutos. Com a academia cheia, troque o aparelho ocupado pelo próximo da lista e volte depois.</li>
      <li>Sem tempo? Corte o último exercício, nunca o primeiro.</li>
    </Itens>
  ) },
  { id: 'cardio', icone: HeartPulse, titulo: 'Cardio na academia', corpo: (
    <Itens>
      <li><b>Esteira inclinada</b> (segunda e sexta): 5–6 km/h com 8–12% de inclinação. Gasta bastante e poupa o joelho.</li>
      <li><b>Escada</b> (terça e quinta): nível 4–6. Trabalha glúteo e panturrilha. Diminua o ritmo nos 2 últimos minutos; parar de uma vez pode derrubar a pressão.</li>
      <li><b>Caminhada leve</b> (quarta e sábado): só para a circulação voltar ao normal depois da perna. Nada de escada nesses dias.</li>
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
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Conte sobre essas quedas a um médico antes de aumentar a intensidade — principalmente se você toma remédio para pressão, já desmaiou ou sente dor no peito.
      </Typography>
    </>
  ) },
  { id: 'progressao', icone: TrendingUp, titulo: 'Como progredir', corpo: (
    <Itens>
      <li>Comece com uma carga que permita o <b>mínimo da faixa</b> de repetições com boa execução.</li>
      <li>Quando fizer o <b>máximo da faixa em todas as séries</b>, aumente a carga no treino seguinte.</li>
      <li>O app mostra o que você fez da última vez. Tente ganhar por uma repetição ou um pouco de carga.</li>
      <li>Voltando de uma pausa: na <b>primeira semana</b> use cargas mais leves e uma série a menos. A força antiga volta rápido.</li>
      <li>A cada 6–8 semanas, uma semana leve com metade das séries.</li>
    </Itens>
  ) },
  { id: 'peito', icone: Shirt, titulo: 'Peito que não cresce', corpo: (
    <Itens>
      <li><b>Crossover de baixo para cima</b> (quinta): trabalha a parte de cima do peito, a que dá volume perto da clavícula. Ajuda, mas como complemento do supino inclinado.</li>
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
      <li>Por isso a <b>cadeira abdutora</b> entra na quarta e no sábado, além da elevação pélvica nos dois dias.</li>
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
      <li>Dias sugeridos: terça, quinta e domingo. Nesses dias o cardio da academia é opcional.</li>
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
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
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
