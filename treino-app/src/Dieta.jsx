import React, { useEffect, useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Chip, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { Beef, Check, ChevronDown, Droplets, Flame, Minus, Plus, Timer } from 'lucide-react'
import { AGUA_META, JANELA, REFEICOES, TOTAL } from './dieta.js'
import { hojeISO } from './store.js'

const dur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`)

const Itens = ({ children }) => (
  <Box component="ul" sx={{ pl: 2.5, m: 0, color: 'text.secondary', '& li': { mb: 1 }, '& li:last-child': { mb: 0 }, '& b': { color: 'text.primary', fontWeight: 500 } }}>
    {children}
  </Box>
)

const REGRAS = [
  { id: 'jejum', titulo: 'Como funciona o jejum', corpo: (
    <Itens>
      <li><b>Janela para comer</b>: das 10h30 às 19h. Fora dela, cerca de 15 horas e meia de jejum.</li>
      <li><b>No jejum pode</b>: água, café e chá sem açúcar.</li>
      <li><b>A merenda não é opcional</b>: ela é o seu pré-treino. Treinar em jejum ao meio-dia é o que mais derruba a pressão.</li>
      <li>O jejum não queima gordura sozinho. Ele ajuda porque tira os lanches da noite e da manhã.</li>
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
      <li><b>Ritmo certo</b>: de 0,5 a 1 kg por semana, olhando a média de duas semanas.</li>
      <li><b>Perdendo mais de 1 kg por semana</b> depois da segunda semana, ou tonto no treino: some 2 colheres de arroz no almoço e na janta.</li>
      <li><b>Duas semanas sem perder nada</b>: tire 2 colheres de arroz da janta e confira a manteiga e o óleo.</li>
      <li><b>Uma refeição livre por semana</b>, dentro da janela. Uma refeição, não um dia.</li>
      <li>Ao chegar perto dos 105 kg, as porções de arroz diminuem um pouco. O app não faz isso sozinho.</li>
    </Itens>
  ) },
]

function Jejum() {
  const [agora, setAgora] = useState(new Date())
  useEffect(() => { const i = setInterval(() => setAgora(new Date()), 30000); return () => clearInterval(i) }, [])
  const m = agora.getHours() * 60 + agora.getMinutes()
  const aberta = m >= JANELA.abre && m < JANELA.fecha
  const jejumTotal = 1440 - (JANELA.fecha - JANELA.abre)
  const falta = aberta ? JANELA.fecha - m : (JANELA.abre - m + 1440) % 1440
  const pct = aberta ? ((m - JANELA.abre) / (JANELA.fecha - JANELA.abre)) * 100 : (1 - falta / jejumTotal) * 100
  return (
    <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ color: aberta ? 'success.main' : 'primary.main', display: 'flex' }}><Timer size={22} /></Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{aberta ? 'Janela aberta' : 'Em jejum'}</Typography>
          <Typography variant="body2" color="text.secondary">{aberta ? `Fecha às 19h, em ${dur(falta)}` : `Merenda às 10h30, em ${dur(falta)}`}</Typography>
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={pct} color={aberta ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 3 }} aria-label={aberta ? 'Tempo da janela' : 'Tempo de jejum'} />
    </Paper>
  )
}

export default function Dieta({ s, update }) {
  const hoje = hojeISO()
  const dia = s.dieta?.[hoje] || {}
  const [aberto, setAberto] = useState(null)
  const [regra, setRegra] = useState(null)
  const editar = (fn) => update((n) => { n.dieta ??= {}; fn((n.dieta[hoje] ??= { m: {}, agua: 0 })) })
  const agua = dia.agua || 0

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
          const ok = !!dia.m?.[r.id]
          return (
            <Accordion key={r.id} square expanded={aberto === r.id} onChange={() => setAberto(aberto === r.id ? null : r.id)}
              sx={{ borderBottom: i < REFEICOES.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.5 } }}>
                <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  bgcolor: ok ? 'success.main' : 'action.hover', color: ok ? 'success.contrastText' : 'text.secondary', fontSize: 12, fontWeight: 600 }}>
                  {ok ? <Check size={18} /> : r.hora.replace(/h.*/, 'h')}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{r.nome} · {r.hora}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.papel}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
                <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 1.5, '& li': { mb: 0.5 } }}>{r.base.map((b) => <li key={b}>{b}</li>)}</Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Cerca de {r.kcal} kcal · {r.prot} g de proteína</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>Pode trocar por</Typography>
                <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 2, color: 'text.secondary', '& li': { mb: 0.5 } }}>{r.trocas.map((t) => <li key={t}>{t}</li>)}</Box>
                <Button fullWidth variant={ok ? 'outlined' : 'contained'} color={ok ? 'success' : 'primary'} startIcon={ok && <Check size={18} />}
                  onClick={() => { editar((d) => { d.m ??= {}; d.m[r.id] = !ok }); if (!ok) setAberto(null) }}>
                  {ok ? 'Feito' : 'Marcar como feita'}
                </Button>
              </AccordionDetails>
            </Accordion>
          )
        })}
      </Paper>

      <Paper sx={{ p: 2, border: 1, borderColor: 'divider', mt: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ color: agua >= AGUA_META ? 'success.main' : 'primary.main', display: 'flex' }}><Droplets size={22} /></Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Água</Typography>
            <Typography variant="body2" color="text.secondary">{String(agua / 2).replace('.', ',')} de {AGUA_META / 2} litros</Typography>
          </Box>
          <IconButton aria-label="Tirar 500 ml" disabled={!agua} onClick={() => editar((d) => { d.agua = Math.max(0, (d.agua || 0) - 1) })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Minus size={20} /></IconButton>
          <IconButton aria-label="Somar 500 ml" color="primary" onClick={() => editar((d) => { d.agua = (d.agua || 0) + 1 })} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Plus size={20} /></IconButton>
        </Stack>
      </Paper>

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
