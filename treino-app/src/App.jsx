import React, { useEffect, useRef, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, BottomNavigation, BottomNavigationAction, Box, Button,
  ButtonBase, Chip, Collapse, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  InputAdornment, LinearProgress, List, ListItem, ListItemText, Paper, Stack, TextField, Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  BookOpen, Check, ChevronDown, Clock, Download, Dumbbell, HeartPulse, History, Moon, Plus, Target, Trash2,
  TrendingUp, TriangleAlert, Upload, Utensils, Wind, X,
} from 'lucide-react'
import { CARDIO, DIAS, PLAN, duracao, fmtDesc } from './plan.js'
import { br, hojeISO, num, semana, ultima, useStore } from './store.js'
import Guia from './Guia.jsx'
import Dieta from './Dieta.jsx'
import { REFEICOES } from './dieta.js'

const CUIDADOS = [
  'Coma 1–2 h antes: carboidrato e um pouco de sal.',
  'Beba água antes e durante.',
  'Solte o ar na subida; não prenda a respiração.',
  'Descanse o tempo todo do cronômetro e deixe 2–3 repetições sobrando.',
  'Depois da série, ande devagar ou sente. Não fique parado em pé.',
  'Tontura ou visão escura: pare, deite e eleve as pernas.',
]

const Card = ({ sx, ...p }) => <Paper sx={{ p: 2, border: 1, borderColor: 'divider', ...sx }} {...p} />
const Titulo = (p) => <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }} {...p} />

export default function App() {
  const [s, update, replace] = useStore()
  const [aba, setAba] = useState(0)
  const [timer, setTimer] = useState(null) // { fim, total }

  return (
    <Box sx={{ pb: `calc(${aba === 0 && timer ? 160 : 88}px + env(safe-area-inset-bottom))` }}>
      <Container maxWidth="sm" sx={{ pt: 3 }}>
        {aba === 0 && <Treino s={s} update={update} onDescanso={(seg) => setTimer(seg ? { fim: Date.now() + seg * 1000, total: seg } : null)} />}
        {aba === 1 && <Dieta s={s} update={update} />}
        {aba === 2 && <Progresso s={s} update={update} replace={replace} />}
        {aba === 3 && <Guia />}
      </Container>
      {aba === 0 && timer && <Descanso timer={timer} setTimer={setTimer} />}
      <Paper square sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: 1, borderColor: 'divider', pb: 'env(safe-area-inset-bottom)', zIndex: 10 }}>
        <BottomNavigation showLabels value={aba} onChange={(_, v) => { setAba(v); window.scrollTo(0, 0) }} sx={{ height: 68, maxWidth: 600, mx: 'auto', '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0.5 } }}>
          <BottomNavigationAction label="Treino" icon={<Dumbbell size={22} />} />
          <BottomNavigationAction label="Dieta" icon={<Utensils size={22} />} />
          <BottomNavigationAction label="Progresso" icon={<TrendingUp size={22} />} />
          <BottomNavigationAction label="Guia" icon={<BookOpen size={22} />} />
        </BottomNavigation>
      </Paper>
    </Box>
  )
}

/* ---------- Treino ---------- */

function Treino({ s, update, onDescanso }) {
  const hoje = hojeISO()
  const dias = semana()
  const [date, setDate] = useState(hoje)
  const wd = dias.find((d) => d.date === date).wd
  const p = PLAN[wd]
  const log = s.logs[date] || {}
  const feitas = p.ex.reduce((t, e) => t + (log.ex?.[e.id] || []).filter((x) => x?.ok).length, 0)
  const total = p.ex.reduce((t, e) => t + e.series, 0)
  const completo = (e) => (log.ex?.[e.id] || []).filter((x) => x?.ok).length >= e.series
  const [aberto, setAberto] = useState(null)
  const [cuidados, setCuidados] = useState(false)
  useEffect(() => { setAberto(p.ex.find((e) => !completo(e))?.id ?? null) }, [date]) // eslint-disable-line

  const editar = (fn) => update((n) => { const l = (n.logs[date] ??= { ex: {} }); l.ex ??= {}; fn(l) })
  const marcar = (e, k, sugestao) => {
    const ligando = !log.ex?.[e.id]?.[k]?.ok
    editar((l) => {
      const set = ((l.ex[e.id] ??= [])[k] ??= {})
      set.ok = ligando
      if (ligando) { set.kg ??= sugestao.kg; set.reps ??= sugestao.reps }
    })
    if (!ligando) return
    const ultimaSerie = (log.ex?.[e.id] || []).filter((x, i) => x?.ok && i !== k).length + 1 >= e.series
    if (ultimaSerie) {
      const prox = p.ex.find((x) => x.id !== e.id && !completo(x))
      setAberto(prox?.id ?? null)
    }
    onDescanso(e.desc)
  }

  return (
    <>
      <Typography color="text.secondary" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-between', my: 2 }}>
        {dias.map((d) => {
          const sel = d.date === date, ok = s.logs[d.date]?.feito
          return (
            <ButtonBase key={d.date} onClick={() => { setDate(d.date); onDescanso(0) }} aria-pressed={sel} aria-label={`${DIAS[d.wd]} ${br(d.date)}`}
              sx={{ flexDirection: 'column', gap: 0.5, borderRadius: 3, py: 0.5, flex: 1 }}>
              <Typography variant="caption" color={d.date === hoje ? 'primary' : 'text.secondary'} sx={{ fontWeight: d.date === hoje ? 600 : 400 }}>{DIAS[d.wd]}</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 500,
                bgcolor: sel ? 'primary.main' : 'transparent', color: sel ? 'primary.contrastText' : ok ? 'success.main' : 'text.primary',
                border: ok && !sel ? 2 : 0, borderColor: 'success.main' }}>
                {ok && !sel ? <Check size={18} /> : +d.date.slice(8)}
              </Box>
            </ButtonBase>
          )
        })}
      </Stack>

      <Typography variant="h4" sx={{ mt: 3 }}>{p.titulo}</Typography>

      {p.descanso ? (
        <Card sx={{ mt: 2, textAlign: 'center', py: 5 }}>
          <Box sx={{ color: 'text.secondary', mb: 1 }}><Moon size={32} /></Box>
          <Typography variant="subtitle1">Hoje o corpo se recupera</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Se der vontade, 30–40 min de patins em ritmo leve.</Typography>
        </Card>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 2, alignItems: 'center', '& .MuiChip-icon': { ml: 1 } }}>
            <Chip size="small" variant="outlined" icon={<Clock size={15} />} label={`${duracao(p)} min`} />
            <Chip size="small" variant="outlined" icon={<Dumbbell size={15} />} label={`${p.ex.length} exercícios`} />
            {p.patins && <Chip size="small" variant="outlined" icon={<Wind size={15} />} label="Patins" />}
          </Stack>
          <LinearProgress variant="determinate" value={(feitas / total) * 100} sx={{ height: 6, borderRadius: 3, mb: 2 }} aria-label="Séries concluídas" />

          {p.perna && (
            <Alert severity="warning" icon={<TriangleAlert size={20} />} sx={{ mb: 2, alignItems: 'flex-start' }}
              action={<Button color="inherit" size="small" onClick={() => setCuidados(!cuidados)}>{cuidados ? 'Fechar' : 'Ver'}</Button>}>
              Dia de perna: cuide da pressão
              <Collapse in={cuidados}>
                <Box component="ul" sx={{ pl: 2.5, mb: 0, mt: 1, '& li': { mb: 0.5 } }}>{CUIDADOS.map((c) => <li key={c}>{c}</li>)}</Box>
              </Collapse>
            </Alert>
          )}

          <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
            {p.ex.map((e, i) => (
              <Exercicio key={e.id} e={e} n={i + 1} sets={log.ex?.[e.id] || []} ant={ultima(s.logs, e.id, date)}
                aberto={aberto === e.id} onToggle={() => setAberto(aberto === e.id ? null : e.id)}
                onCampo={(k, campo, v) => editar((l) => { ((l.ex[e.id] ??= [])[k] ??= {})[campo] = v })}
                onMarcar={(k, sug) => marcar(e, k, sug)} ultimo={i === p.ex.length - 1} />
            ))}
          </Paper>

          <Cardio c={p.cardio} log={log.cardio} patins={p.patins} onToggle={() => editar((l) => { l.cardio = l.cardio ? null : { min: p.cardio.min } })} />

          <Button fullWidth size="large" sx={{ mt: 3 }} variant={log.feito ? 'outlined' : 'contained'} color={log.feito ? 'success' : 'primary'}
            startIcon={log.feito && <Check size={20} />}
            onClick={() => { editar((l) => { l.feito = !l.feito }); onDescanso(0) }}>
            {log.feito ? 'Treino concluído' : 'Concluir treino'}
          </Button>
        </>
      )}
    </>
  )
}

function Exercicio({ e, n, sets, ant, aberto, onToggle, onCampo, onMarcar, ultimo }) {
  const feitas = sets.filter((x) => x?.ok).length
  const ok = feitas >= e.series
  return (
    <Accordion expanded={aberto} onChange={onToggle} sx={{ borderBottom: ultimo ? 0 : 1, borderColor: 'divider' }} square>
      <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.5 } }}>
        <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 600,
          bgcolor: ok ? 'success.main' : 'action.hover', color: ok ? 'success.contrastText' : 'text.secondary' }}>
          {ok ? <Check size={18} /> : n}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{e.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{e.series} × {e.reps} · descanso {fmtDesc(e.desc)}</Typography>
        </Box>
        {feitas > 0 && !ok && <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{feitas}/{e.series}</Typography>}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
        {e.nota && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{e.nota}</Typography>}
        {ant && (
          <Stack direction="row" spacing={1} sx={{ mb: 1.5, color: 'text.secondary', alignItems: 'center' }}>
            <History size={16} style={{ flexShrink: 0 }} />
            <Typography variant="body2">{br(ant.d)}: {ant.sets.map((x) => `${num(x.kg ?? '–')} kg × ${x.reps ?? '–'}`).join(' · ')}</Typography>
          </Stack>
        )}
        <Stack spacing={1}>
          {Array.from({ length: e.series }, (_, k) => {
            const set = sets[k] || {}
            const base = sets[k - 1] || ant?.sets[Math.min(k, (ant?.sets.length || 1) - 1)] || {}
            const sug = { kg: base.kg, reps: base.reps }
            const campo = (nome, sufixo, modo) => (
              <TextField size="small" type="number" value={set[nome] ?? ''} placeholder={sug[nome] != null ? String(sug[nome]) : ''}
                onChange={(ev) => onCampo(k, nome, ev.target.value === '' ? undefined : +ev.target.value)}
                slotProps={{ htmlInput: { inputMode: modo, 'aria-label': `${sufixo}, série ${k + 1}`, step: nome === 'kg' ? 0.5 : 1 },
                  input: { endAdornment: <InputAdornment position="end">{sufixo}</InputAdornment> } }} sx={{ flex: 1 }} />
            )
            return (
              <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography color="text.secondary" sx={{ width: 20, textAlign: 'center' }}>{k + 1}</Typography>
                {campo('kg', 'kg', 'decimal')}
                {campo('reps', 'reps', 'numeric')}
                <IconButton onClick={() => onMarcar(k, sug)} aria-label={`Série ${k + 1} feita`} aria-pressed={!!set.ok}
                  sx={{ width: 44, height: 44, border: 1, borderColor: set.ok ? 'success.main' : 'divider', borderRadius: 3,
                    bgcolor: set.ok ? 'success.main' : 'transparent', color: set.ok ? 'success.contrastText' : 'text.disabled',
                    '&:hover': { bgcolor: set.ok ? 'success.main' : 'action.hover' } }}>
                  <Check size={20} />
                </IconButton>
              </Stack>
            )
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

function Cardio({ c, log, patins, onToggle }) {
  const info = CARDIO[c.tipo]
  return (
    <Card sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
          bgcolor: log ? 'success.main' : 'action.hover', color: log ? 'success.contrastText' : 'text.secondary' }}>
          {log ? <Check size={18} /> : <HeartPulse size={18} />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{info.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{c.min} min · para fechar o treino</Typography>
        </Box>
        <Button variant={log ? 'text' : 'outlined'} color={log ? 'success' : 'primary'} onClick={onToggle}>{log ? 'Feito' : 'Marcar'}</Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {info.como}{patins && c.tipo !== 'caminhada' ? ' Vai andar de patins hoje? Pode pular.' : ''}
      </Typography>
    </Card>
  )
}

function Descanso({ timer, setTimer }) {
  const [agora, setAgora] = useState(Date.now())
  const vibrou = useRef(false)
  useEffect(() => { vibrou.current = false; const i = setInterval(() => setAgora(Date.now()), 250); return () => clearInterval(i) }, [timer])
  const resta = Math.ceil((timer.fim - agora) / 1000)
  useEffect(() => {
    if (resta > 0) return
    if (!vibrou.current) { vibrou.current = true; navigator.vibrate?.([200, 100, 200]) }
    if (resta < -6) setTimer(null)
  }, [resta]) // eslint-disable-line
  const fim = resta <= 0
  return (
    <Paper elevation={6} role="timer" sx={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(80px + env(safe-area-inset-bottom))', maxWidth: 568, mx: 'auto',
      zIndex: 11, overflow: 'hidden', bgcolor: fim ? 'success.main' : (t) => (t.palette.mode === 'dark' ? '#f4f5f7' : '#1c1f26'), color: fim ? 'success.contrastText' : (t) => (t.palette.mode === 'dark' ? '#111' : '#fff') }}>
      <Stack direction="row" sx={{ alignItems: 'center', pl: 2, pr: 1, py: 1 }} spacing={1}>
        <Typography sx={{ flex: 1, fontWeight: 500 }}>
          {fim ? 'Próxima série' : <>Descanso <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, ml: 0.5 }}>{Math.floor(resta / 60)}:{String(resta % 60).padStart(2, '0')}</Box></>}
        </Typography>
        {!fim && <Button size="small" color="inherit" onClick={() => setTimer({ fim: timer.fim + 30000, total: timer.total + 30 })}>+30 s</Button>}
        <IconButton color="inherit" aria-label="Fechar cronômetro" onClick={() => setTimer(null)}><X size={20} /></IconButton>
      </Stack>
      {!fim && <LinearProgress variant="determinate" value={100 - (resta / timer.total) * 100} color="inherit" sx={{ height: 3, opacity: 0.5 }} />}
    </Paper>
  )
}

/* ---------- Progresso ---------- */

function Progresso({ s, update, replace }) {
  const hoje = hojeISO()
  const dias = semana()
  const naSemana = (d) => dias.some((x) => x.date === d)
  const treinos = dias.filter((d) => s.logs[d.date]?.feito).length
  const patinsSem = s.patins.filter((p) => naSemana(p.date))
  const cardioMin = dias.reduce((t, d) => t + (s.logs[d.date]?.cardio?.min || 0), 0) + patinsSem.reduce((t, p) => t + p.min, 0)
  const dieta = dias.filter((d) => REFEICOES.every((r) => s.dieta?.[d.date]?.m?.[r.id])).length
  const pesos = [...s.peso].sort((a, b) => (a.date < b.date ? -1 : 1))
  const atual = pesos.at(-1), dif = pesos.length > 1 ? atual.kg - pesos[0].kg : null
  const [kg, setKg] = useState(''), [min, setMin] = useState(''), [km, setKm] = useState('')
  const [dlgMeta, setDlgMeta] = useState(false), [meta, setMeta] = useState('')
  const arquivo = useRef()

  const nomes = {}, best = {}
  for (const k in PLAN) for (const e of PLAN[k].ex) nomes[e.id] = e.nome
  for (const d in s.logs) for (const id in s.logs[d].ex || {}) for (const x of s.logs[d].ex[id] || [])
    if (x?.kg && nomes[id] && (!best[id] || x.kg > best[id].kg)) best[id] = { ...x, d }

  const salvarPeso = () => { const v = parseFloat(kg); if (!(v > 30 && v < 400)) return
    update((n) => { n.peso = n.peso.filter((p) => p.date !== hoje); n.peso.push({ date: hoje, kg: v }) }); setKg('') }
  const salvarPatins = () => { const m = parseInt(min); if (!(m > 0)) return; const k = parseFloat(km)
    update((n) => { n.patins = n.patins.filter((p) => p.date !== hoje); n.patins.push({ date: hoje, min: m, km: k > 0 ? k : null }) }); setMin(''); setKm('') }
  const exportar = () => { const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' })); a.download = `treino-backup-${hoje}.json`; a.click() }
  const importar = (ev) => { const f = ev.target.files[0]; if (!f) return; const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(r.result); if (!d || typeof d.logs !== 'object') throw 0
      if (confirm('Substituir os dados deste aparelho pelo backup?')) replace(d) } catch { alert('Arquivo de backup inválido.') } }
    r.readAsText(f); ev.target.value = '' }

  const Stat = ({ v, de, label }) => (
    <Card sx={{ flex: 1, textAlign: 'center', px: 1 }}>
      <Typography variant="h4" component="div">{v}{de && <Typography component="span" color="text.secondary">/{de}</Typography>}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Card>
  )

  return (
    <>
      <Typography variant="h4">Progresso</Typography>
      <Titulo>Esta semana</Titulo>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Stat v={treinos} de={6} label="treinos" />
        <Stat v={dieta} de={7} label="dias de dieta" />
        <Stat v={cardioMin} label="min de cardio" />
        <Stat v={patinsSem.length} de={3} label="patins" />
      </Box>

      <Titulo>Peso</Titulo>
      <Card>
        {atual ? (
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h4" component="div">{num(atual.kg)} <Typography component="span" color="text.secondary">kg</Typography></Typography>
            {dif !== null && <Typography color={dif <= 0 ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 500 }}>{dif > 0 ? '+' : ''}{num(dif.toFixed(1))} kg</Typography>}
          </Stack>
        ) : <Typography color="text.secondary" sx={{ mb: 2 }}>Registre seu peso para acompanhar a evolução.</Typography>}
        {pesos.length > 1 && <Grafico pesos={pesos} meta={s.meta} />}
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField size="small" type="number" label="Peso de hoje" value={kg} onChange={(e) => setKg(e.target.value)} sx={{ flex: 1 }}
            slotProps={{ htmlInput: { inputMode: 'decimal', step: 0.1 }, input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } }} />
          <Button variant="contained" onClick={salvarPeso}>Salvar</Button>
        </Stack>
        <Button size="small" startIcon={<Target size={16} />} sx={{ mt: 1 }} onClick={() => { setMeta(s.meta ?? ''); setDlgMeta(true) }}>
          {s.meta ? `Meta: ${num(s.meta)} kg` : 'Definir meta'}
        </Button>
        <Lista itens={[...pesos].reverse().slice(0, 5)} texto={(p) => `${num(p.kg)} kg`} onDel={(p) => update((n) => { n.peso = n.peso.filter((x) => x.date !== p.date) })} />
      </Card>

      <Titulo>Patins</Titulo>
      <Card>
        <Stack direction="row" spacing={1}>
          <TextField size="small" type="number" label="Minutos" value={min} onChange={(e) => setMin(e.target.value)} sx={{ flex: 1 }}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
          <TextField size="small" type="number" label="Km" value={km} onChange={(e) => setKm(e.target.value)} sx={{ flex: 1 }}
            slotProps={{ htmlInput: { inputMode: 'decimal', step: 0.1 } }} />
          <IconButton color="primary" aria-label="Adicionar patins" onClick={salvarPatins} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}><Plus size={20} /></IconButton>
        </Stack>
        <Lista itens={[...s.patins].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5)} texto={(p) => `${p.min} min${p.km ? ` · ${num(p.km)} km` : ''}`}
          onDel={(p) => update((n) => { n.patins = n.patins.filter((x) => x.date !== p.date) })} />
      </Card>

      <Titulo>Maiores cargas</Titulo>
      <Card sx={{ py: Object.keys(best).length ? 0.5 : 2 }}>
        {Object.keys(best).length ? (
          <List disablePadding>
            {Object.entries(best).map(([id, b], i, a) => (
              <ListItem key={id} disableGutters divider={i < a.length - 1} secondaryAction={<Typography sx={{ fontWeight: 600 }}>{num(b.kg)} kg{b.reps ? ` × ${b.reps}` : ''}</Typography>}>
                <ListItemText primary={nomes[id]} secondary={br(b.d)} sx={{ pr: 10 }} />
              </ListItem>
            ))}
          </List>
        ) : <Typography color="text.secondary">Anote as cargas nos treinos e elas aparecem aqui.</Typography>}
      </Card>

      <Titulo>Backup</Titulo>
      <Card>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Os dados ficam salvos só neste aparelho.</Typography>
        <Stack direction="row" spacing={1}>
          <Button fullWidth variant="outlined" startIcon={<Download size={18} />} onClick={exportar}>Baixar</Button>
          <Button fullWidth variant="outlined" startIcon={<Upload size={18} />} onClick={() => arquivo.current.click()}>Restaurar</Button>
        </Stack>
        <input ref={arquivo} type="file" accept="application/json" hidden onChange={importar} />
      </Card>

      <Dialog open={dlgMeta} onClose={() => setDlgMeta(false)} fullWidth maxWidth="xs">
        <DialogTitle>Meta de peso</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth type="number" value={meta} onChange={(e) => setMeta(e.target.value)} sx={{ mt: 1 }}
            slotProps={{ htmlInput: { inputMode: 'decimal', 'aria-label': 'Meta de peso' }, input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlgMeta(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => { const v = parseFloat(meta); update((n) => { n.meta = v > 30 && v < 400 ? v : null }); setDlgMeta(false) }}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function Lista({ itens, texto, onDel }) {
  if (!itens.length) return null
  return (
    <List disablePadding sx={{ mt: 1.5 }}>
      {itens.map((p) => (
        <ListItem key={p.date} disableGutters sx={{ py: 0.25 }}
          secondaryAction={<IconButton edge="end" size="small" aria-label={`Apagar registro de ${br(p.date)}`} onClick={() => confirm('Apagar este registro?') && onDel(p)}><Trash2 size={16} /></IconButton>}>
          <Typography variant="body2" color="text.secondary" sx={{ width: 64 }}>{br(p.date)}</Typography>
          <Typography variant="body2">{texto(p)}</Typography>
        </ListItem>
      ))}
    </List>
  )
}

function Grafico({ pesos, meta }) {
  const t = useTheme()
  const W = 560, H = 180, L = 8, R = 8, T = 12, B = 28
  const vals = pesos.map((p) => p.kg).concat(meta ? [meta] : [])
  const mn = Math.min(...vals) - 1, mx = Math.max(...vals) + 1
  const t0 = +new Date(pesos[0].date), t1 = +new Date(pesos.at(-1).date)
  const X = (d) => L + (W - L - R) * ((+new Date(d) - t0) / Math.max(1, t1 - t0))
  const Y = (k) => T + (H - T - B) * (1 - (k - mn) / (mx - mn))
  const pts = pesos.map((p) => `${X(p.date)},${Y(p.kg)}`).join(' ')
  const cor = t.palette.primary.main, sec = t.palette.text.secondary
  return (
    <Box component="svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolução do peso" sx={{ width: '100%', display: 'block', fontFamily: 'inherit' }}>
      <polygon points={`${L},${H - B} ${pts} ${W - R},${H - B}`} fill={cor} opacity="0.1" />
      {meta && <>
        <line x1={L} x2={W - R} y1={Y(meta)} y2={Y(meta)} stroke={t.palette.success.main} strokeDasharray="6 6" strokeWidth="2" />
        <text x={W - R} y={Y(meta) - 8} fill={t.palette.success.main} fontSize="20" textAnchor="end">meta</text>
      </>}
      <polyline points={pts} fill="none" stroke={cor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={X(pesos.at(-1).date)} cy={Y(pesos.at(-1).kg)} r="6" fill={cor} stroke={t.palette.background.paper} strokeWidth="3" />
      <text x={L} y={H - 6} fill={sec} fontSize="20">{br(pesos[0].date)}</text>
      <text x={W - R} y={H - 6} fill={sec} fontSize="20" textAnchor="end">{br(pesos.at(-1).date)}</text>
    </Box>
  )
}
