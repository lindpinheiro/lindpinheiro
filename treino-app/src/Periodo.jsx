import React, { useState } from 'react'
import { Box, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PLAN } from './plan.js'
import { consumo, diaSemana, gastoTreino, kcalPatins, pesoEm } from './gasto.js'
import { hojeISO, iso, num } from './store.js'

const fmt = (n) => Math.round(n).toLocaleString('pt-BR')
const sinal = (v, casas = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${num(Math.abs(v).toFixed(casas))}`
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const NOMES = {}
for (const k in PLAN) for (const e of PLAN[k].ex) NOMES[e.id] = e.nome

// Números de um intervalo de datas (até hoje).
function resumir(s, ini, fim) {
  const hoje = hojeISO(), r = { treinos: 0, previstos: 0, dieta: 0, dias: 0, patins: 0, patinsMin: 0, kcal: 0, volume: 0 }
  const cargas = {} // exercício → maior carga de cada sessão, em ordem
  // Dias antes do primeiro registro não contam como treino ou dieta perdidos.
  const primeiro = [...Object.keys(s.logs), ...Object.keys(s.dieta || {}), ...s.peso.map((x) => x.date), ...s.patins.map((x) => x.date)].sort()[0] || hoje
  for (let d = new Date(`${ini}T12:00:00`); iso(d) <= fim && iso(d) <= hoje; d.setDate(d.getDate() + 1)) {
    const date = iso(d), kg = pesoEm(s, date), log = s.logs[date], g = gastoTreino(s, date, kg), pat = s.patins.find((p) => p.date === date)
    if (date >= primeiro) { r.dias++; if (diaSemana(date) !== 0) r.previstos++ }
    if (log?.feito) r.treinos++
    if (consumo(s, date).completa) r.dieta++
    if (pat) { r.patins++; r.patinsMin += pat.min; r.kcal += kcalPatins(pat, kg) }
    r.kcal += g.total; r.volume += g.volume
    for (const id in log?.ex || {}) {
      const max = Math.max(0, ...log.ex[id].filter((x) => x?.kg).map((x) => x.kg))
      if (max && NOMES[id]) (cargas[id] ??= []).push(max)
    }
  }
  const antes = new Date(`${ini}T12:00:00`); antes.setDate(antes.getDate() - 1)
  r.pesoIni = pesoEm(s, iso(antes)); r.pesoFim = pesoEm(s, fim < hoje ? fim : hoje)
  r.cargas = Object.entries(cargas).filter(([, v]) => v.length > 1).map(([id, v]) => ({ id, de: v[0], para: v.at(-1), dif: v.at(-1) - v[0] }))
    .filter((c) => c.dif !== 0).sort((a, b) => b.dif - a.dif).slice(0, 5)
  return r
}

export default function Periodo({ s }) {
  const [tipo, setTipo] = useState('mes'), [recuo, setRecuo] = useState(0)
  const agora = new Date(), n = tipo === 'mes' ? 1 : 3
  const m0 = (tipo === 'mes' ? agora.getMonth() : Math.floor(agora.getMonth() / 3) * 3) + recuo * n
  const inicio = new Date(agora.getFullYear(), m0, 1, 12), final = new Date(agora.getFullYear(), m0 + n, 0, 12)
  const r = resumir(s, iso(inicio), iso(final))
  const titulo = tipo === 'mes'
    ? inicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : `${Math.floor(inicio.getMonth() / 3) + 1}º trimestre de ${inicio.getFullYear()}`
  const meses = tipo === 'tri' && Array.from({ length: 3 }, (_, i) => {
    const a = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1, 12), b = new Date(inicio.getFullYear(), inicio.getMonth() + i + 1, 0, 12)
    return { nome: MESES[a.getMonth()], futuro: iso(a) > hojeISO(), ...resumir(s, iso(a), iso(b)) }
  })
  const difPeso = r.pesoFim - r.pesoIni

  const Stat = ({ v, sub, label }) => (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
      <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>{v}{sub && <Typography component="span" variant="body2" color="text.secondary"> {sub}</Typography>}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  )

  return (
    <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={tipo} onChange={(_, v) => { if (v) { setTipo(v); setRecuo(0) } }} aria-label="Período">
        <ToggleButton value="mes">Mês</ToggleButton>
        <ToggleButton value="tri">Trimestre</ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" sx={{ alignItems: 'center', my: 1 }}>
        <IconButton aria-label="Período anterior" onClick={() => setRecuo(recuo - 1)}><ChevronLeft size={20} /></IconButton>
        <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', '&::first-letter': { textTransform: 'uppercase' } }}>{titulo}</Typography>
        <IconButton aria-label="Próximo período" disabled={recuo >= 0} onClick={() => setRecuo(recuo + 1)}><ChevronRight size={20} /></IconButton>
      </Stack>

      <Box sx={{ textAlign: 'center', py: 1.5 }}>
        <Typography variant="h4" component="div" color={difPeso < 0 ? 'success.main' : 'text.primary'}>{difPeso === 0 ? '0 kg' : `${sinal(difPeso)} kg`}</Typography>
        <Typography variant="body2" color="text.secondary">Peso: de {num(r.pesoIni)} para {num(r.pesoFim)} kg</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <Stat v={r.treinos} sub={`de ${r.previstos}`} label="Treinos" />
        <Stat v={r.dieta} sub={`de ${r.dias}`} label="Dieta completa" />
        <Stat v={r.patins} sub={r.patinsMin ? `· ${r.patinsMin} min` : ''} label="Patins" />
        <Stat v={fmt(r.kcal)} sub="kcal" label="Gasto com exercício" />
      </Box>
      {r.volume > 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{fmt(r.volume)} kg levantados no período.</Typography>}

      {meses && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Mês a mês</Typography>
          {meses.map((m) => (
            <Stack key={m.nome} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', opacity: m.futuro ? 0.4 : 1 }}>
              <Typography sx={{ width: 40, fontWeight: 600, textTransform: 'capitalize' }}>{m.nome}</Typography>
              <Typography color="text.secondary" sx={{ flex: 1 }}>{m.futuro ? '–' : `${m.treinos} treinos · ${m.dieta} de dieta`}</Typography>
              {!m.futuro && <Typography noWrap sx={{ fontVariantNumeric: 'tabular-nums' }}>{sinal(m.pesoFim - m.pesoIni)} kg</Typography>}
            </Stack>
          ))}
        </Box>
      )}

      <Typography variant="subtitle1" sx={{ mt: 2, mb: 0.5 }}>Cargas que mais mudaram</Typography>
      {r.cargas.length ? r.cargas.map((c) => (
        <Stack key={c.id} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ lineHeight: 1.3 }}>{NOMES[c.id]}</Typography>
            <Typography variant="body2" color="text.secondary">{num(c.de)} → {num(c.para)} kg</Typography>
          </Box>
          <Typography noWrap color={c.dif > 0 ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>{sinal(c.dif)} kg</Typography>
        </Stack>
      )) : <Typography variant="body2" color="text.secondary">Aparece quando um exercício tiver dois treinos registrados no período, com cargas diferentes.</Typography>}
    </Paper>
  )
}
