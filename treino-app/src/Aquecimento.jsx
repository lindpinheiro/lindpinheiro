import React, { useState } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Check, ChevronDown, CirclePlay, Flame } from 'lucide-react'
import { video } from './plan.js'
import { AQUEC } from './aquecimento.js'

// Lista de itens de aquecimento/alongamento. Com `feitos`/`onMarcar`, cada item pode ser marcado.
export function ListaAquec({ itens, feitos, onMarcar }) {
  return itens.map((a, i) => {
    const ok = !!feitos?.[a.id]
    return (
      <Stack key={a.id} direction="row" spacing={1.5} sx={{ py: 1.25, borderTop: i ? 1 : 0, borderColor: 'divider', alignItems: 'flex-start' }}>
        {onMarcar && (
          <ButtonBase onClick={() => onMarcar(a.id, !ok)} aria-label={`${a.nome} feito`} aria-pressed={ok}
            sx={{ width: 32, height: 32, flexShrink: 0, mt: 0.25, borderRadius: '50%', border: 1.5, borderColor: ok ? 'success.main' : 'divider',
              bgcolor: ok ? 'success.main' : 'transparent', color: ok ? 'success.contrastText' : 'text.disabled' }}>
            <Check size={16} />
          </ButtonBase>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ lineHeight: 1.35, color: ok ? 'text.secondary' : 'text.primary' }}>
            {a.nome} <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, whiteSpace: 'nowrap' }}>· {a.dose}</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">{a.como}</Typography>
        </Box>
        <IconButton size="small" href={video(a.nome)} target="_blank" rel="noopener" aria-label={`Vídeo: ${a.nome}`} sx={{ color: 'text.secondary', mt: -0.25 }}>
          <CirclePlay size={18} />
        </IconButton>
      </Stack>
    )
  })
}

// Cartão recolhível de aquecimento no topo do treino.
export default function Aquecimento({ itens, feitos, onMarcar }) {
  const n = itens.filter((a) => feitos?.[a.id]).length, completo = n === itens.length
  const [aberto, setAberto] = useState(!completo)
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden', mb: 2 }}>
      <Accordion square expanded={aberto} onChange={() => setAberto(!aberto)}>
        <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.5 } }}>
          <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
            bgcolor: completo ? 'success.main' : 'action.hover', color: completo ? 'success.contrastText' : 'text.secondary' }}>
            {completo ? <Check size={18} /> : <Flame size={18} />}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Aquecimento</Typography>
            <Typography variant="body2" color="text.secondary">5 min · {n}/{itens.length}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pt: 0, pb: 1 }}>
          <ListaAquec itens={itens} feitos={feitos} onMarcar={(id, v) => { onMarcar(id, v); if (v && n + 1 === itens.length) setAberto(false) }} />
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

// Cartão com as rotinas do patins: antes (dinâmico) e depois (estático), cada uma recolhível.
export function RotinaPatins({ sx }) {
  const [aberto, setAberto] = useState(null)
  const secoes = [
    { id: 'antes', titulo: 'Antes do patins', sub: '5 min · solta quadril e tornozelo', itens: AQUEC.antesPatins },
    { id: 'depois', titulo: 'Depois do patins', sub: '5 min · alongamento parado', itens: AQUEC.depois },
  ]
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden', ...sx }}>
      {secoes.map((x, i) => (
        <Accordion key={x.id} square expanded={aberto === x.id} onChange={() => setAberto(aberto === x.id ? null : x.id)}
          sx={{ borderBottom: i < secoes.length - 1 ? 1 : 0, borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { my: 1.5 } }}>
            <Box>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{x.titulo}</Typography>
              <Typography variant="body2" color="text.secondary">{x.sub}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pt: 0, pb: 1 }}><ListaAquec itens={x.itens} /></AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  )
}
