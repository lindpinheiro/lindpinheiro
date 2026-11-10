import React, { useState } from 'react'
import { Box, ButtonBase, Dialog, DialogContent, DialogTitle, Divider, IconButton, Paper, Stack, Typography } from '@mui/material'
import { Check, ChevronLeft, ChevronRight, Minus, X } from 'lucide-react'
import { CARDIO, PLAN, duracao } from './plan.js'
import { LIVRE, REFEICOES, opcao, valores } from './dieta.js'
import { hojeISO, num } from './store.js'
import { INTENSIDADES, consumo, diaSemana, intensidadeCardio, kcalCardio, kcalPatins, kcalTreino, pesoEm } from './gasto.js'

const SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']
const pad = (n) => String(n).padStart(2, '0')
const horas = (min) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? pad(min % 60) : ''}` : `${min}min`)

// Tudo o que foi registrado em um dia, já resumido.
function resumo(s, date) {
  const log = s.logs[date], d = s.dieta?.[date], pat = s.patins.find((p) => p.date === date)
  const plano = PLAN[diaSemana(date)]
  const treino = !!log?.feito
  const { refeicoes, extras, kcal, prot } = consumo(s, date)
  const kg = pesoEm(s, date)
  const gasto = kcalTreino(s, date, kg) + (pat ? kcalPatins(pat, kg) : 0)
  const minutos = (treino ? duracao(plano) : log?.cardio?.min || 0) + (pat?.min || 0)
  return { log, d, pat, plano, treino, refeicoes, extras, kcal, prot, minutos, kg, gasto, ativo: minutos > 0,
    temDieta: refeicoes.length > 0 || extras.length > 0 || !!d?.agua, dietaCompleta: refeicoes.length === REFEICOES.length }
}

export default function Historico({ s }) {
  const hoje = hojeISO()
  const [mes, setMes] = useState(() => ({ y: +hoje.slice(0, 4), m: +hoje.slice(5, 7) - 1 }))
  const [aberto, setAberto] = useState(null)
  const total = new Date(mes.y, mes.m + 1, 0).getDate()
  const recuo = (new Date(mes.y, mes.m, 1).getDay() + 6) % 7
  const datas = Array.from({ length: total }, (_, i) => `${mes.y}-${pad(mes.m + 1)}-${pad(i + 1)}`)
  const dias = datas.map((date) => ({ date, ...resumo(s, date) }))
  const mesAtual = hoje.startsWith(`${mes.y}-${pad(mes.m + 1)}`)
  const mudar = (n) => setMes(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  const nomeMes = new Date(mes.y, mes.m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const Stat = ({ v, label }) => (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>{v}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  )

  return (
    <>
      <Stack direction="row" sx={{ mt: 3, mb: 2 }}>
        <Stat v={dias.filter((d) => d.treino).length} label="Treinos" />
        <Stat v={dias.filter((d) => d.ativo).length} label="Dias ativos" />
        <Stat v={horas(dias.reduce((t, d) => t + d.minutos, 0))} label="Tempo ativo" />
      </Stack>

      <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }}>
          <IconButton aria-label="Mês anterior" onClick={() => mudar(-1)}><ChevronLeft size={20} /></IconButton>
          <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', '&::first-letter': { textTransform: 'uppercase' } }}>{nomeMes}</Typography>
          <IconButton aria-label="Próximo mês" disabled={mesAtual} onClick={() => mudar(1)}><ChevronRight size={20} /></IconButton>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 0.5 }}>
          {SEMANA.map((d) => <Typography key={d} variant="caption" color="text.secondary" sx={{ textAlign: 'center', pb: 0.5 }}>{d}</Typography>)}
          {Array.from({ length: recuo }, (_, i) => <span key={`v${i}`} />)}
          {dias.map((d) => {
            const futuro = d.date > hoje
            return (
              <ButtonBase key={d.date} disabled={futuro} onClick={() => setAberto(d.date)}
                aria-label={`Dia ${+d.date.slice(8)}${d.treino ? ', treino feito' : ''}${d.dietaCompleta ? ', dieta completa' : ''}`}
                sx={{ flexDirection: 'column', py: 0.5, borderRadius: 2, opacity: futuro ? 0.35 : 1 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: d.date === hoje ? 600 : 400,
                  bgcolor: d.treino ? 'primary.main' : 'transparent', color: d.treino ? 'primary.contrastText' : d.date === hoje ? 'primary.main' : 'text.primary',
                  border: !d.treino && d.ativo ? 2 : 0, borderColor: 'primary.main' }}>
                  {+d.date.slice(8)}
                </Box>
                <Box sx={{ width: 6, height: 6, mt: 0.5, borderRadius: '50%', bgcolor: d.dietaCompleta ? 'success.main' : 'transparent',
                  border: !d.dietaCompleta && d.temDieta ? 1.5 : 0, borderColor: 'success.main' }} />
              </ButtonBase>
            )
          })}
        </Box>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 1, color: 'text.secondary' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} /><Typography variant="caption">Treino</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} /><Typography variant="caption">Dieta completa</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Dia s={s} date={aberto} onClose={() => setAberto(null)} />
    </>
  )
}

const Linha = ({ ok, titulo, detalhe }) => (
  <Stack direction="row" spacing={1.5} sx={{ py: 0.75, alignItems: 'flex-start' }}>
    <Box sx={{ color: ok ? 'success.main' : 'text.disabled', display: 'flex', mt: '3px' }}>{ok ? <Check size={18} /> : <Minus size={18} />}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography color={ok ? 'text.primary' : 'text.secondary'}>{titulo}</Typography>
      {detalhe && <Typography variant="body2" color="text.secondary">{detalhe}</Typography>}
    </Box>
  </Stack>
)
const Secao = (p) => <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 2, lineHeight: 2 }} {...p} />

function Dia({ s, date, onClose }) {
  const [ultima, setUltima] = useState(date)
  if (date && date !== ultima) setUltima(date) // mantém o conteúdo durante a animação de fechar
  const dt = date || ultima
  if (!dt) return null
  const r = resumo(s, dt)
  const feitos = r.plano.ex.map((e) => ({ e, sets: (r.log?.ex?.[e.id] || []).filter((x) => x && (x.ok || x.kg || x.reps)) })).filter((x) => x.sets.length)
  const vazio = !r.ativo && !r.temDieta && !feitos.length
  return (
    <Dialog open={!!date} onClose={onClose} fullWidth maxWidth="xs" scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1.5, fontSize: '1.15rem', lineHeight: 1.3 }}>
        <Box component="span" sx={{ flex: 1, '&::first-letter': { textTransform: 'uppercase' } }}>
          {new Date(`${dt}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Box>
        <IconButton aria-label="Fechar" onClick={onClose}><X size={20} /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {vazio ? <Typography color="text.secondary" sx={{ py: 2 }}>Nada registrado neste dia.</Typography> : (
          <>
            <Secao sx={{ display: 'block', mt: 0, lineHeight: 2 }}>Treino</Secao>
            {r.plano.descanso
              ? <Linha ok={false} titulo="Dia de descanso" />
              : <Linha ok={r.treino} titulo={r.plano.titulo} detalhe={r.treino ? `Concluído · cerca de ${duracao(r.plano)} min` : feitos.length ? 'Começou, mas não marcou como concluído' : 'Não registrado'} />}
            {feitos.map(({ e, sets }) => (
              <Stack key={e.id} direction="row" spacing={1.5} sx={{ py: 0.5, pl: 4.25 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2">{e.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{sets.map((x) => `${x.kg != null ? num(x.kg) : '–'} kg × ${x.reps ?? '–'}`).join(' · ')}</Typography>
                </Box>
              </Stack>
            ))}
            {r.log?.cardio && <Linha ok titulo={CARDIO[r.plano.cardio?.tipo]?.nome || 'Cardio'} detalhe={`${r.log.cardio.min} min${r.plano.cardio ? ` · ${INTENSIDADES[intensidadeCardio(r.plano.cardio.tipo, r.log.cardio)].nome.toLowerCase()} · cerca de ${kcalCardio(r.plano.cardio.tipo, r.log.cardio, r.kg)} kcal` : ''}`} />}
            {r.pat && <Linha ok titulo="Patins" detalhe={`${r.pat.min} min${r.pat.km ? ` · ${num(r.pat.km)} km` : ''}${` · ${(INTENSIDADES[r.pat.int] || INTENSIDADES.leve).nome.toLowerCase()} · cerca de ${kcalPatins(r.pat, r.kg)} kcal`}`} />}
            {r.gasto > 0 && <Typography variant="body2" color="text.secondary" sx={{ pl: 4.25, pt: 0.5 }}>Gasto estimado no dia: {r.gasto} kcal</Typography>}

            <Divider sx={{ mt: 2 }} />
            <Secao>Dieta</Secao>
            {REFEICOES.map((m) => {
              const v = r.d?.m?.[m.id]
              const op = opcao(m, r.d), val = valores(m, r.d)
              return <Linha key={m.id} ok={!!v} titulo={v && v !== 'livre' && op ? `${m.nome} · ${op.nome.toLowerCase()}` : m.nome} detalhe={v === 'livre' ? `Refeição livre · cerca de ${LIVRE.kcal} kcal` : v ? `${val.kcal} kcal · ${val.prot} g de proteína` : 'Não registrada'} />
            })}
            {r.extras.map((x) => <Linha key={x.id} ok titulo={`${x.nome}${x.n > 1 ? ` × ${x.n}` : ''}`} detalhe={`cerca de ${x.n * x.kcal} kcal`} />)}
            {!!r.d?.agua && <Linha ok titulo="Água" detalhe={`${num(r.d.agua / 2)} litros`} />}

            {r.kcal > 0 && (
              <Paper sx={{ mt: 2, p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">Consumo estimado</Typography>
                <Typography variant="h6" component="div">{r.kcal.toLocaleString('pt-BR')} kcal · {r.prot} g de proteína</Typography>
                <Typography variant="body2" color="text.secondary">Conta só o que foi marcado, pelas porções do plano.</Typography>
              </Paper>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
