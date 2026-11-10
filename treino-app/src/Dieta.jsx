import React, { useEffect, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, IconButton, LinearProgress, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Apple, Beef, Check, ChevronDown, Cookie, IceCreamBowl, Droplets, Flame, Minus, Pizza, Plus, Timer } from 'lucide-react'
import { AGUA_META, DIAS_JEJUM, EXTRAS, LIVRES_SEMANA, opcao, JANELA, REFEICOES, TOTAL } from './dieta.js'
import { hojeISO, iso, semana } from './store.js'

const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`)

const Itens = ({ children }) => (
  <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', '& li': { mb: 1 }, '& li:last-child': { mb: 0 }, '& b': { color: 'text.primary', fontWeight: 500 } }}>
    {children}
  </Box>
)
const Card = ({ sx, ...p }) => <Paper sx={{ p: 2, border: 1, borderColor: 'divider', ...sx }} {...p} />

const REGRAS = [
  { id: 'jejum', titulo: 'Como funciona o jejum', corpo: (
    <Itens>
      <li><b>Só segunda, terça e quarta</b>: comer das 10h30 às 19h. O primeiro jejum começa depois da janta de domingo.</li>
      <li><b>De quinta a domingo</b>: horário livre, com as mesmas três refeições e porções.</li>
      <li><b>No jejum pode</b>: água, café e chá sem açúcar. Fruta só dentro da janela.</li>
      <li><b>A merenda não é opcional</b>: ela é o seu pré-treino. Treinar em jejum ao meio-dia é o que mais derruba a pressão.</li>
      <li>O jejum não queima gordura sozinho. Ele ajuda porque tira os lanches da noite e da manhã.</li>
    </Itens>
  ) },
  { id: 'livre', titulo: 'Fruta, fast food e doces', corpo: (
    <Itens>
      <li><b>Fast food</b>: duas vezes por semana, em qualquer dia, sempre <b>no lugar da janta</b>. Um lanche com acompanhamento.</li>
      <li><b>Bebida</b>: refrigerante zero ou água. Refrigerante comum e milk-shake viram quase outra refeição.</li>
      <li><b>Açaí completo de 700 ml</b>: um a cada duas semanas. Ele tem as calorias de quase um dia inteiro, então <b>é a janta</b> daquele dia.</li>
      <li>Açaí e fast food em dias diferentes.</li>
      <li><b>Fruta</b>: liberada quando bater a fome, até 2 por dia além da do almoço. Laranja, banana, maçã, mamão, melancia, abacaxi.</li>
      <li><b>Não conta como fruta</b>: suco, fruta seca, abacate e açaí.</li>
      <li><b>Chocolate</b>: um por dia, depois da refeição. Um bombom (Sonho de Valsa, Ouro Branco) ou 2 quadradinhos de meio amargo.</li>
      <li>Fora isso, a margem acabou: outros doces, refrigerante e beliscos ficam de fora.</li>
      <li>Merenda e almoço seguem o plano todos os dias. É isso que mantém a perda em cerca de meio quilo por semana.</li>
    </Itens>
  ) },
  { id: 'carnes', titulo: 'Carnes e preparo', corpo: (
    <Itens>
      <li><b>Dia a dia</b>: frango, patinho, músculo, acém, alcatra, lombo ou pernil de porco, tilápia, sardinha, carne moída magra.</li>
      <li><b>Uma ou duas vezes por semana</b>: costela, cupim, linguiça, bisteca, frituras. Nesses dias, uma palma e meia em vez de duas.</li>
      <li><b>Preparo</b>: cozido, de panela, assado ou grelhado. Uma colher de sopa de óleo para a panela inteira.</li>
      <li><b>Sal</b>: não corte. Com a sua pressão, comida temperada normalmente ajuda.</li>
    </Itens>
  ) },
  { id: 'ajuste', titulo: 'Quando ajustar', corpo: (
    <Itens>
      <li><b>Ritmo esperado</b>: cerca de 0,5 kg por semana, olhando a média de duas semanas.</li>
      <li><b>Perdendo mais de 1 kg por semana</b> depois da segunda semana, ou tonto no treino: some 2 colheres de arroz no almoço e na janta.</li>
      <li><b>Duas semanas sem perder nada</b>: primeiro passe para um fast food por semana; depois chocolate dia sim, dia não e uma fruta extra por dia; por último, tire 2 colheres de arroz da janta.</li>
      <li>Ao chegar perto dos 105 kg, as porções de arroz diminuem um pouco. O app não faz isso sozinho.</li>
    </Itens>
  ) },
]

function Jejum() {
  const [agora, setAgora] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setAgora(new Date()), 30000); return () => clearInterval(i) }, [])
  const m = agora.getHours() * 60 + agora.getMinutes()
  const hoje = DIAS_JEJUM.includes(agora.getDay()), amanha = DIAS_JEJUM.includes((agora.getDay() + 1) % 7)
  const jejumTotal = 1440 - (JANELA.fecha - JANELA.abre)
  let titulo, texto, pct = null, aberta = false
  if (hoje && m >= JANELA.abre && m < JANELA.fecha) {
    aberta = true; titulo = 'Janela aberta'; texto = `Fecha às 19h, em ${dur(JANELA.fecha - m)}`; pct = ((m - JANELA.abre) / (JANELA.fecha - JANELA.abre)) * 100
  } else if ((hoje && m < JANELA.abre) || (hoje && amanha)) {
    const falta = (JANELA.abre - m + 1440) % 1440
    titulo = 'Em jejum'; texto = `Merenda às 10h30, em ${dur(falta)}`; pct = (1 - falta / jejumTotal) * 100
  } else if (hoje) {
    titulo = 'Jejum da semana concluído'; texto = 'Até domingo, horário livre com as mesmas porções.'
  } else if (amanha) {
    titulo = m >= JANELA.fecha ? 'Jejum começou' : 'Hoje sem jejum'; texto = m >= JANELA.fecha ? 'Próxima refeição amanhã, às 10h30.' : 'Amanhã tem: faça a última refeição até as 19h.'
  } else {
    titulo = 'Hoje sem jejum'; texto = 'Horário livre, mesmas porções. Jejum só de segunda a quarta.'
  }
  return (
    <Card>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: aberta ? 'success.main' : pct === null ? 'text.secondary' : 'primary.main', display: 'flex' }}><Timer size={22} /></Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{titulo}</Typography>
          <Typography variant="body2" color="text.secondary">{texto}</Typography>
        </Box>
      </Stack>
      {pct !== null && <LinearProgress variant="determinate" value={pct} color={aberta ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 3, mt: 1.5 }} aria-label={aberta ? 'Tempo da janela' : 'Tempo de jejum'} />}
    </Card>
  )
}

export default function Dieta({ s, update }) {
  const hoje = hojeISO()
  const wd = new Date().getDay()
  const dia = s.dieta?.[hoje] || {}
  const [aberto, setAberto] = useState(null)
  const [regra, setRegra] = useState(null)
  const editar = (fn) => update((n) => { n.dieta ??= {}; fn((n.dieta[hoje] ??= { m: {}, agua: 0 })) })
  const agua = dia.agua || 0
  const emJejum = DIAS_JEJUM.includes(wd)
  const livres = semana().filter((d) => s.dieta?.[d.date]?.livre).length
  // Soma do extra na semana atual (7) ou nos últimos N dias corridos.
  const contar = (x) => {
    const datas = x.dias === 1 ? [hoje] : x.dias === 7 ? semana().map((d) => d.date) : Array.from({ length: x.dias }, (_, i) => iso(new Date(Date.now() - i * 864e5)))
    return datas.reduce((t, d) => t + (s.dieta?.[d]?.[x.id] || 0), 0)
  }
  const marcar = (r, valor) => { editar((d) => { d.m ??= {}; d.m[r.id] = valor; if (valor !== 'livre' && d.livre === r.id) d.livre = null; if (valor === 'livre') d.livre = r.id }); if (valor) setAberto(null) }

  return (
    <>
      <Typography variant="h4">Dieta</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 2, '& .MuiChip-icon': { ml: 1 } }}>
        <Chip size="small" variant="outlined" icon={<Flame size={15} />} label={`${TOTAL.kcal.toLocaleString('pt-BR')} kcal`} />
        <Chip size="small" variant="outlined" icon={<Beef size={15} />} label={`${TOTAL.prot} g de proteína`} />
      </Stack>

      <Jejum />

      <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden', mt: 2 }}>
        {REFEICOES.map((r, i) => {
          const ok = !!dia.m?.[r.id], livre = dia.m?.[r.id] === 'livre'
          const podeLivre = r.podeLivre && livres < LIVRES_SEMANA
          const op = opcao(r, dia), item = op || r
          return (
            <Accordion key={r.id} square expanded={aberto === r.id} onChange={() => setAberto(aberto === r.id ? null : r.id)}
              sx={{ borderBottom: i < REFEICOES.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.5 } }}>
                <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  bgcolor: ok ? 'success.main' : 'action.hover', color: ok ? 'success.contrastText' : 'text.secondary', fontSize: 14, fontWeight: 600 }}>
                  {livre ? <Pizza size={18} /> : ok ? <Check size={18} /> : i + 1}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{r.nome}{emJejum ? ` · ${r.hora}` : ''}</Typography>
                  <Typography variant="body2" color="text.secondary">{livre ? 'Refeição livre' : ok && op ? op.nome : emJejum ? r.jejum : r.livre}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                {op && (
                  <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={op.id} aria-label={`Opção de ${r.nome.toLowerCase()}`} sx={{ mb: 1.5 }}
                    onChange={(_, v) => v && editar((d) => { (d.opc ??= {})[r.id] = v })}>
                    {r.opcoes.map((o) => <ToggleButton key={o.id} value={o.id}>{o.nome}</ToggleButton>)}
                  </ToggleButtonGroup>
                )}
                <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 1.5, '& li': { mb: 0.5 } }}>{item.base.map((b) => <li key={b}>{b}</li>)}</Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Cerca de {item.kcal} kcal · {item.prot} g de proteína</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Pode trocar por</Typography>
                <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 2, color: 'text.secondary', '& li': { mb: 0.5 } }}>{item.trocas.map((t) => <li key={t}>{t}</li>)}</Box>
                <Stack spacing={1}>
                  <Button fullWidth variant={ok ? 'outlined' : 'contained'} color={ok ? 'success' : 'primary'} startIcon={ok && <Check size={18} />} onClick={() => marcar(r, ok ? false : true)}>
                    {livre ? 'Refeição livre feita' : ok ? 'Feito' : 'Marcar como feita'}
                  </Button>
                  {podeLivre && !ok && <Button fullWidth variant="outlined" startIcon={<Pizza size={18} />} onClick={() => marcar(r, 'livre')}>Usar refeição livre ({livres}/{LIVRES_SEMANA} na semana)</Button>}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Paper>

      <Card sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ color: agua >= AGUA_META ? 'success.main' : 'primary.main', display: 'flex' }}><Droplets size={22} /></Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Água</Typography>
            <Typography variant="body2" color="text.secondary">{String(agua / 2).replace('.', ',')} de {AGUA_META / 2} litros</Typography>
          </Box>
          <IconButton aria-label="Tirar 500 ml" disabled={!agua} onClick={() => editar((d) => { d.agua = Math.max(0, (d.agua || 0) - 1) })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Minus size={20} /></IconButton>
          <IconButton aria-label="Somar 500 ml" color="primary" onClick={() => editar((d) => { d.agua = (d.agua || 0) + 1 })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Plus size={20} /></IconButton>
        </Stack>
      </Card>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Extras</Typography>
      <Card sx={{ py: 1 }}>
        {EXTRAS.map((x, i) => {
          const n = contar(x), passou = n > x.limite
          return (
            <Stack key={x.id} direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1.25, borderTop: i ? 1 : 0, borderColor: 'divider' }}>
              <Box sx={{ color: 'text.secondary', display: 'flex' }}>{x.id === 'fruta' ? <Apple size={22} /> : x.id === 'acai' ? <IceCreamBowl size={22} /> : <Cookie size={22} />}</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{x.nome}</Typography>
                <Typography variant="body2" color="text.secondary">{x.porcao}</Typography>
              </Box>
              <Typography color={passou ? 'warning.main' : 'text.primary'} sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{n}/{x.limite}</Typography>
              <IconButton aria-label={`Tirar ${x.nome}`} disabled={!dia[x.id]} onClick={() => editar((d) => { d[x.id] = Math.max(0, (d[x.id] || 0) - 1) })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Minus size={20} /></IconButton>
              <IconButton aria-label={`Somar ${x.nome}`} color="primary" onClick={() => editar((d) => { d[x.id] = (d[x.id] || 0) + 1 })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Plus size={20} /></IconButton>
            </Stack>
          )
        })}
      </Card>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>Regras</Typography>
      <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
        {REGRAS.map((r, i) => (
          <Accordion key={r.id} square expanded={regra === r.id} onChange={() => setRegra(regra === r.id ? null : r.id)}
            sx={{ borderBottom: i < REGRAS.length - 1 ? 1 : 0, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 2 } }}>
              <Typography variant="subtitle1">{r.titulo}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pt: 0, pb: 2.5 }}>{r.corpo}</AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </>
  )
}
