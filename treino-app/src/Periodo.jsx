import React, { useState } from 'react'
import { Box, IconButton, LinearProgress, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { ChevronLeft, ChevronRight, Dumbbell, Scale, TrendingDown, TrendingUp, CalendarCheck } from 'lucide-react'
import { EXERCICIOS, NOMES, kgTotal, modoLado, progressao } from './exercicios.js'
import { consumo, diaSemana, gastoTreino, kcalPatins, pesoEm } from './gasto.js'
import { hojeISO, iso, num, ultima } from './store.js'

const fmt = (n) => Math.round(n).toLocaleString('pt-BR')
const kg1 = (v) => num(Math.abs(v).toFixed(1))
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const RITMO = 0.5 // kg por semana, o ritmo do plano

// Números de um intervalo de datas (até hoje).
function resumir(s, ini, fim) {
  const hoje = hojeISO(), r = { treinos: 0, previstos: 0, dieta: 0, dias: 0, patins: 0, patinsMin: 0, kcal: 0, pesagens: 0 }
  const cargas = {} // exercício → maior carga (total) de cada sessão, em ordem
  // Dias antes do primeiro registro não contam como treino ou dieta perdidos.
  const primeiro = [...Object.keys(s.logs), ...Object.keys(s.dieta || {}), ...s.peso.map((x) => x.date), ...s.patins.map((x) => x.date)].sort()[0] || hoje
  for (let d = new Date(`${ini}T12:00:00`); iso(d) <= fim && iso(d) <= hoje; d.setDate(d.getDate() + 1)) {
    const date = iso(d), kg = pesoEm(s, date), log = s.logs[date], pat = s.patins.find((p) => p.date === date)
    if (date >= primeiro) { r.dias++; if (diaSemana(date) !== 0) r.previstos++ }
    if (log?.feito) r.treinos++
    if (consumo(s, date).completa) r.dieta++
    if (pat) { r.patins++; r.patinsMin += pat.min; r.kcal += kcalPatins(pat, kg) }
    if (s.peso.some((p) => p.date === date)) r.pesagens++
    r.kcal += gastoTreino(s, date, kg).total
    for (const id in log?.ex || {}) {
      const max = Math.max(0, ...log.ex[id].filter((x) => x?.kg).map((x) => kgTotal(x, id)))
      if (max && NOMES[id]) (cargas[id] ??= []).push(max)
    }
  }
  const antes = new Date(`${ini}T12:00:00`); antes.setDate(antes.getDate() - 1)
  r.pesoIni = pesoEm(s, iso(antes)); r.pesoFim = pesoEm(s, fim < hoje ? fim : hoje)
  r.cargas = Object.entries(cargas).filter(([, v]) => v.length > 1).map(([id, v]) => ({ id, de: v[0], para: v.at(-1), dif: v.at(-1) - v[0] }))
  return r
}

const Card = ({ icone: Icone, titulo, extra, children }) => (
  <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}><Icone size={18} /></Box>
      <Typography variant="subtitle1" sx={{ flex: 1 }}>{titulo}</Typography>
      {extra && <Typography variant="body2" color="textSecondary">{extra}</Typography>}
    </Stack>
    {children}
  </Paper>
)

// Linha com rótulo, barra de progresso e "x de y".
const Barra = ({ rotulo, feito, alvo, unidade }) => {
  const pct = alvo ? Math.min(100, (feito / alvo) * 100) : 0
  return (
    <Box sx={{ mb: 1.75 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{rotulo}</Typography>
        <Typography variant="body2" color="textSecondary"><Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{feito}</Box> de {alvo} {unidade}</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} color={pct >= 80 ? 'success' : 'primary'} sx={{ height: 8, borderRadius: 4 }} aria-label={rotulo} />
    </Box>
  )
}

export default function Periodo({ s }) {
  const [tipo, setTipo] = useState('mes'), [recuo, setRecuo] = useState(0)
  const hoje = hojeISO()
  const agora = new Date(), n = tipo === 'mes' ? 1 : 3
  const m0 = (tipo === 'mes' ? agora.getMonth() : Math.floor(agora.getMonth() / 3) * 3) + recuo * n
  const inicio = new Date(agora.getFullYear(), m0, 1, 12), final = new Date(agora.getFullYear(), m0 + n, 0, 12)
  const r = resumir(s, iso(inicio), iso(final))
  const noMes = tipo === 'mes' ? `em ${MESES[inicio.getMonth()]}` : 'no trimestre'
  const titulo = tipo === 'mes'
    ? inicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : `${MESES[inicio.getMonth()]} a ${MESES[final.getMonth()]} de ${inicio.getFullYear()}`
  const meses = tipo === 'tri' && Array.from({ length: 3 }, (_, i) => {
    const a = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1, 12), b = new Date(inicio.getFullYear(), inicio.getMonth() + i + 1, 0, 12)
    return { nome: MESES[a.getMonth()], futuro: iso(a) > hoje, ...resumir(s, iso(a), iso(b)) }
  })

  // Peso: comparado com o ritmo do plano no mesmo número de dias.
  const dif = r.pesoFim - r.pesoIni
  const esperado = (r.dias / 7) * RITMO
  const pesoTxt = !r.dias ? 'Nada registrado neste período.'
    : !r.pesagens ? 'Nenhuma pesagem neste período. Registre o peso uma vez por semana na aba Resumo.'
    : dif < 0 && -dif >= esperado * 0.8 ? `No ritmo do plano (meio quilo por semana) seriam ${kg1(esperado)} kg a menos. Você está dentro ou acima do ritmo.`
    : dif < 0 ? `No ritmo do plano (meio quilo por semana) seriam ${kg1(esperado)} kg a menos. Está perdendo, um pouco abaixo do ritmo.`
    : `No ritmo do plano seriam ${kg1(esperado)} kg a menos. Vale revisar a dieta da semana.`

  // Força: exercícios que subiram ou caíram de carga, e os prontos para subir no próximo treino.
  const subiram = r.cargas.filter((c) => c.dif > 0).sort((a, b) => b.dif / b.de - a.dif / a.de)
  const cairam = r.cargas.filter((c) => c.dif < 0)
  const prontos = Object.keys(NOMES).filter((id) => {
    const e = EXERCICIOS[id], ant = e && ultima(s.logs, id, '9999-12-31')
    return ant && progressao(e, ant, modoLado(s, id))?.tipo === 'subir'
  })
  const carga = (v, id) => `${num(v / (modoLado(s, id) ? 2 : 1))} kg${modoLado(s, id) ? ' cada' : ''}`

  return (
    <Stack spacing={2}>
      <Box>
        <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={tipo} onChange={(_, v) => { if (v) { setTipo(v); setRecuo(0) } }} aria-label="Período">
          <ToggleButton value="mes">Mês</ToggleButton>
          <ToggleButton value="tri">Trimestre</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" sx={{ alignItems: 'center', mt: 1 }}>
          <IconButton aria-label="Período anterior" onClick={() => setRecuo(recuo - 1)}><ChevronLeft size={20} /></IconButton>
          <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', '&::first-letter': { textTransform: 'uppercase' } }}>{titulo}</Typography>
          <IconButton aria-label="Próximo período" disabled={recuo >= 0} onClick={() => setRecuo(recuo + 1)}><ChevronRight size={20} /></IconButton>
        </Stack>
      </Box>

      <Card icone={Scale} titulo="Peso" extra={r.pesagens ? `${num(r.pesoIni)} → ${num(r.pesoFim)} kg` : null}>
        {r.pesagens > 0 && (
          <Typography variant="h5" component="div" color={dif < 0 ? 'success' : 'textPrimary'}>
            {dif < 0 ? `Perdeu ${kg1(dif)} kg` : dif > 0 ? `Ganhou ${kg1(dif)} kg` : 'Peso estável'} <Typography component="span" variant="body2" color="textSecondary">{noMes}</Typography>
          </Typography>
        )}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>{pesoTxt}</Typography>
      </Card>

      <Card icone={CalendarCheck} titulo="Constância" extra={r.kcal ? `${fmt(r.kcal)} kcal gastas` : null}>
        {r.dias ? (
          <>
            <Barra rotulo="Treinos feitos" feito={r.treinos} alvo={r.previstos} unidade="previstos" />
            <Barra rotulo="Dias com a dieta completa" feito={r.dieta} alvo={r.dias} unidade="dias" />
            <Barra rotulo="Patins" feito={r.patins} alvo={Math.max(1, Math.round((r.dias / 7) * 2))} unidade="(meta: 2 por semana)" />
          </>
        ) : <Typography variant="body2" color="textSecondary">Nada registrado neste período.</Typography>}
        {meses && r.dias > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {meses.map((m) => (
              <Stack key={m.nome} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', opacity: m.futuro ? 0.45 : 1 }}>
                <Typography variant="body2" sx={{ width: 32, fontWeight: 600, textTransform: 'capitalize' }}>{m.nome}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>{m.futuro ? 'ainda não começou' : `${m.treinos} treinos · ${m.dieta} dias de dieta`}</Typography>
                {!m.futuro && m.pesagens > 0 && <Typography variant="body2" color={m.pesoFim < m.pesoIni ? 'success' : 'textSecondary'} sx={{ fontWeight: 600 }}>{m.pesoFim < m.pesoIni ? '−' : m.pesoFim > m.pesoIni ? '+' : ''}{kg1(m.pesoFim - m.pesoIni)} kg</Typography>}
              </Stack>
            ))}
          </Box>
        )}
      </Card>

      <Card icone={Dumbbell} titulo="Força">
        {r.cargas.length ? (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <b>{subiram.length} {subiram.length === 1 ? 'exercício subiu' : 'exercícios subiram'}</b> de carga {noMes}
            {cairam.length ? `, ${cairam.length} ${cairam.length === 1 ? 'caiu' : 'caíram'}` : ''}.
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Aparece quando um exercício tiver pelo menos dois treinos registrados no período.</Typography>
        )}
        {subiram.slice(0, 5).map((c) => (
          <Stack key={c.id} direction="row" spacing={1.25} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ color: 'success.main', display: 'flex' }}><TrendingUp size={16} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{NOMES[c.id]}</Typography>
              <Typography variant="caption" color="textSecondary">{carga(c.de, c.id)} → {carga(c.para, c.id)}</Typography>
            </Box>
            <Typography variant="body2" color="success" sx={{ fontWeight: 600 }}>+{Math.round((c.dif / c.de) * 100)}%</Typography>
          </Stack>
        ))}
        {cairam.map((c) => (
          <Stack key={c.id} direction="row" spacing={1.25} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ color: 'warning.main', display: 'flex' }}><TrendingDown size={16} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{NOMES[c.id]}</Typography>
              <Typography variant="caption" color="textSecondary">{carga(c.de, c.id)} → {carga(c.para, c.id)}</Typography>
            </Box>
            <Typography variant="body2" color="warning" sx={{ fontWeight: 600 }}>{Math.round((c.dif / c.de) * 100)}%</Typography>
          </Stack>
        ))}
        {recuo === 0 && prontos.length > 0 && (
          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2">Prontos para subir carga no próximo treino</Typography>
            <Typography variant="body2" color="textSecondary">{prontos.map((id) => NOMES[id]).join(', ')}.</Typography>
          </Box>
        )}
      </Card>
    </Stack>
  )
}
