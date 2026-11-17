import React, { useEffect, useRef, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, BottomNavigation, BottomNavigationAction, Box, Button,
  ButtonBase, Chip, Collapse, Container, IconButton,
  InputAdornment, LinearProgress, List, ListItem, ListItemText, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  BookOpen, Check, ChevronDown, CirclePlay, Clock, Download, Dumbbell, Flame, HeartPulse, History, Moon, Plus, Trash2,
  TrendingUp, TriangleAlert, Upload, Utensils, Wind, X,
} from 'lucide-react'
import { CARDIO, DIAS, PLAN, duracao, fmtDesc, foto, video, planoDe } from './plan.js'
import { META, PESO_INICIAL, br, hojeISO, iso, num, semana, ultima, useStore } from './store.js'
import Guia from './Guia.jsx'
import Dieta from './Dieta.jsx'
import Progresso from './Progresso.jsx'
import Aquecimento, { AlongamentoFim, RotinaPatins } from './Aquecimento.jsx'
import { aquecDoDia } from './aquecimento.js'
import { INTENSIDADES, gastoTreino, intensidadeCardio, kcalCardio, kcalPatins, pesoEm } from './gasto.js'
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

// Domingo: escolher um treino da semana para repor.
// Segunda é peito: repor no domingo um treino de peito colocaria o mesmo músculo dois dias seguidos.
const AMANHA = PLAN[1]
const GRUPO = { peito: 'peito', costas: 'costas', perna: 'perna' }
const NOME_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const conflita = (wd) => PLAN[wd].grupo === AMANHA.grupo

function Reposicao({ s, dias, hoje, onEscolher }) {
  const semana = dias.filter((d) => d.wd !== 0)
  const faltou = semana.filter((d) => !s.logs[d.date]?.feito && d.date < hoje)
  const boas = faltou.filter((d) => !conflita(d.wd)), evitar = faltou.filter((d) => conflita(d.wd))
  const [todos, setTodos] = useState(false)
  const lista = todos ? [...boas, ...semana.filter((d) => !boas.includes(d))] : boas
  const escolher = (d) => {
    if (conflita(d.wd) && !confirm(`Amanhã é treino de ${GRUPO[AMANHA.grupo]}. Fazer ${PLAN[d.wd].titulo.toLowerCase()} hoje põe o mesmo músculo dois dias seguidos, sem tempo de recuperar. Fazer mesmo assim?`)) return
    onEscolher(d.wd)
  }
  const titulo = boas.length ? 'Faltou algum treino?' : faltou.length ? 'Melhor descansar hoje' : 'Semana completa'
  const texto = boas.length
    ? `Você pode repor um hoje.${evitar.length ? ` ${evitar.length > 1 ? 'Os' : 'O'} de ${evitar.map((d) => NOME_DIA[d.wd]).join(' e ')} não ${evitar.length > 1 ? 'entram' : 'entra'}: amanhã já é ${GRUPO[AMANHA.grupo]}.` : ''}`
    : faltou.length
      ? `${faltou.length > 1 ? 'Os treinos que ficaram para trás são' : 'O treino que ficou para trás é'} de ${GRUPO[AMANHA.grupo]}, e amanhã você treina ${GRUPO[AMANHA.grupo]} de novo. Não precisa repor: a semana segue normal a partir de segunda.`
      : 'Nenhum treino ficou para trás. Se quiser, dá para fazer um extra.'
  return (
    <Card sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{titulo}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{texto}</Typography>
      {lista.map((d) => {
        const plano = PLAN[d.wd], feito = !!s.logs[d.date]?.feito, ruim = conflita(d.wd)
        return (
          <Stack key={d.date} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Typography color="primary" sx={{ width: 36, fontWeight: 600 }}>{DIAS[d.wd]}</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ lineHeight: 1.3 }}>{plano.titulo}</Typography>
              <Typography variant="body2" color={ruim ? 'warning.main' : feito ? 'success.main' : 'text.secondary'}>
                {ruim ? `Amanhã já é ${GRUPO[AMANHA.grupo]}` : `${feito ? 'Feito' : d.date < hoje ? 'Faltou' : 'Ainda não'} · ${duracao(plano)} min`}
              </Typography>
            </Box>
            <Button size="small" variant={ruim || feito ? 'text' : 'outlined'} color={ruim ? 'inherit' : 'primary'} onClick={() => escolher(d)}>Fazer</Button>
          </Stack>
        )
      })}
      {!todos && (
        <Button size="small" sx={{ mt: 0.5, ml: -0.5 }} onClick={() => setTodos(true)}>{faltou.length ? 'Ver todos os treinos' : 'Escolher um treino extra'}</Button>
      )}
    </Card>
  )
}

function Treino({ s, update, onDescanso }) {
  const hoje = hojeISO()
  const dias = semana()
  const [sel, setDate] = useState(hoje)
  const date = dias.some((d) => d.date === sel) ? sel : hoje // se a semana virar com o app aberto
  const wd = dias.find((d) => d.date === date).wd
  const p = planoDe(s.logs, date)
  const log = s.logs[date] || {}
  const feitas = p.ex.reduce((t, e) => t + (log.ex?.[e.id] || []).filter((x) => x?.ok).length, 0)
  const total = p.ex.reduce((t, e) => t + e.series, 0)
  const completo = (e) => (log.ex?.[e.id] || []).filter((x) => x?.ok).length >= e.series
  const [aberto, setAberto] = useState(null)
  const [cuidados, setCuidados] = useState(false)
  const gasto = gastoTreino(s, date, pesoEm(s, date))
  useEffect(() => { setAberto(p.ex.find((e) => !completo(e))?.id ?? null) }, [date, p.repoe]) // eslint-disable-line

  const editar = (fn) => update((n) => { const l = (n.logs[date] ??= { ex: {} }); l.ex ??= {}; fn(l) })
  const marcar = (e, k, sugestao) => {
    const ligando = !log.ex?.[e.id]?.[k]?.ok
    editar((l) => {
      const set = ((l.ex[e.id] ??= [])[k] ??= {})
      set.ok = ligando
      if (ligando) { set.kg ??= sugestao.kg; set.reps ??= sugestao.reps }
      // Última série do treino marcada: conclui o treino sem precisar de outro toque.
      if (ligando && p.ex.every((x) => (l.ex[x.id] || []).filter((y) => y?.ok).length >= x.series)) l.feito = true
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

      {p.repoe && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
          <Typography color="text.secondary" sx={{ flex: 1 }}>Reposição do treino de {DIAS[p.repoe].toLowerCase()}</Typography>
          <Button size="small" onClick={() => {
            if (feitas && !confirm('Trocar o treino de hoje? As séries já marcadas ficam salvas, mas deixam de aparecer aqui.')) return
            editar((l) => { delete l.repoe; l.feito = false }); onDescanso(0)
          }}>Trocar</Button>
        </Stack>
      )}

      {p.descanso ? (
        <>
        <Reposicao s={s} dias={dias} hoje={hoje} onEscolher={(d) => editar((l) => { l.repoe = d })} />
        <Card sx={{ mt: 2, textAlign: 'center', py: 5 }}>
          <Box sx={{ color: 'text.secondary', mb: 1 }}><Moon size={32} /></Box>
          <Typography variant="subtitle1">Hoje o corpo se recupera</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Se der vontade, 30–40 min de patins em ritmo leve.</Typography>
        </Card>
        <RotinaPatins sx={{ mt: 2 }} />
        </>
      ) : (
        <>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 2, alignItems: 'center', '& .MuiChip-icon': { ml: 1 } }}>
            <Chip size="small" variant="outlined" icon={<Clock size={15} />} label={`${duracao(p)} min`} />
            <Chip size="small" variant="outlined" icon={<Dumbbell size={15} />} label={`${p.ex.length} exercícios`} />
            {p.patins && <Chip size="small" variant="outlined" icon={<Wind size={15} />} label="Patins" />}
            {gasto.total > 0 && <Chip size="small" color="primary" icon={<Flame size={15} />} label={`${gasto.total} kcal`} />}
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

          <Aquecimento key={`aq-${date}`} itens={aquecDoDia(p)} feitos={log.aq} onMarcar={(id, v) => editar((l) => { (l.aq ??= {})[id] = v })} />

          <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
            {p.ex.map((e, i) => (
              <Exercicio key={e.id} e={e} n={i + 1} sets={log.ex?.[e.id] || []} ant={ultima(s.logs, e.id, date)}
                aberto={aberto === e.id} onToggle={() => setAberto(aberto === e.id ? null : e.id)}
                onCampo={(k, campo, v) => editar((l) => { ((l.ex[e.id] ??= [])[k] ??= {})[campo] = v })}
                onMarcar={(k, sug) => marcar(e, k, sug)} ultimo={i === p.ex.length - 1} />
            ))}
          </Paper>

          <Cardio key={`cardio-${date}`} c={p.cardio} log={log.cardio} patins={p.patins} kg={pesoEm(s, date)} onSalvar={(v) => editar((l) => { l.cardio = v })} />

          {p.perna ? <AlongamentoFim sx={{ mt: 2 }} /> : p.patins && <RotinaPatins sx={{ mt: 2 }} />}

          <Button fullWidth size="large" sx={{ mt: 3 }} variant={log.feito ? 'outlined' : 'contained'} color={log.feito ? 'success' : 'primary'}
            startIcon={log.feito && <Check size={20} />}
            onClick={() => { editar((l) => { l.feito = !l.feito }); onDescanso(0) }}>
            {log.feito ? 'Treino concluído' : feitas ? 'Concluir agora' : 'Concluir treino'}
          </Button>
          {gasto.total > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'center' }}>
              Gasto estimado: {gasto.total} kcal{gasto.series ? ` · ${gasto.series} ${gasto.series === 1 ? 'série' : 'séries'}` : ''}{gasto.volume ? ` · ${Math.round(gasto.volume).toLocaleString('pt-BR')} kg levantados` : ''}
            </Typography>
          )}
        </>
      )}
    </>
  )
}

function Exercicio({ e, n, sets, ant, aberto, onToggle, onCampo, onMarcar, ultimo }) {
  const feitas = sets.filter((x) => x?.ok).length
  const ok = feitas >= e.series
  const [comoFazer, setComoFazer] = useState(false)
  const campoSx = { flex: 1, '& input': { textAlign: 'center', py: 1.25, fontVariantNumeric: 'tabular-nums' } }
  return (
    <Accordion expanded={aberto} onChange={onToggle} sx={{ borderBottom: ultimo ? 0 : 1, borderColor: 'divider' }} square>
      <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.25 } }}>
        <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600,
          bgcolor: ok ? 'success.main' : 'action.hover', color: ok ? 'success.contrastText' : 'text.secondary' }}>
          {ok ? <Check size={16} /> : n}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{e.nome}</Typography>
          <Typography variant="body2" color="text.secondary">{e.series} × {e.reps} · {fmtDesc(e.desc)} de descanso</Typography>
        </Box>
        {feitas > 0 && !ok && <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{feitas}/{e.series}</Typography>}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
          {ant ? (
            <Stack direction="row" spacing={0.75} sx={{ color: 'text.secondary', alignItems: 'center', minWidth: 0 }}>
              <History size={14} style={{ flexShrink: 0 }} />
              <Typography variant="body2" noWrap>Última vez: {ant.sets.length} {ant.sets.length === 1 ? 'série' : 'séries'}, até {num(Math.max(...ant.sets.map((x) => x.kg || 0)))} kg</Typography>
            </Stack>
          ) : <Typography variant="body2" color="text.secondary">Primeira vez: comece leve</Typography>}
          <Button size="small" onClick={() => setComoFazer(!comoFazer)} sx={{ flexShrink: 0, mr: -1 }}
            endIcon={<ChevronDown size={14} style={{ transform: comoFazer ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}>
            Como fazer
          </Button>
        </Stack>
        <Collapse in={comoFazer} unmountOnExit>
          <Box sx={{ pb: 1.5 }}>
            {foto(e.id) && <Box component="img" src={foto(e.id)} alt={`${e.nome}: posição inicial e final`} sx={{ display: 'block', width: '100%', borderRadius: 2, mb: 1 }} />}
            {e.nota && <Typography variant="body2" color="text.secondary">{e.nota}</Typography>}
            <Button size="small" href={video(e.nome)} target="_blank" rel="noopener" startIcon={<CirclePlay size={16} />} sx={{ mt: 0.5, ml: -1 }}>Ver vídeo</Button>
          </Box>
        </Collapse>

        <Stack direction="row" spacing={1} sx={{ mb: 0.5, color: 'text.secondary' }}>
          <Typography variant="caption" sx={{ width: 20, textAlign: 'center' }}>#</Typography>
          <Typography variant="caption" sx={{ flex: 1, textAlign: 'center' }}>Carga (kg)</Typography>
          <Typography variant="caption" sx={{ flex: 1, textAlign: 'center' }}>Repetições</Typography>
          <Box sx={{ width: 48 }} />
        </Stack>
        <Stack spacing={1}>
          {Array.from({ length: e.series }, (_, k) => {
            const set = sets[k] || {}
            // Sugestão: a mesma série do último treino; sem histórico, a série anterior de hoje.
            const base = ant?.sets[k] || sets[k - 1] || ant?.sets.at(-1) || {}
            const sug = { kg: base.kg, reps: base.reps }
            const campo = (nome, rotulo, modo) => (
              <TextField size="small" type="number" value={set[nome] ?? ''} placeholder={sug[nome] != null ? num(sug[nome]) : '–'}
                onChange={(ev) => onCampo(k, nome, ev.target.value === '' ? undefined : +ev.target.value)}
                slotProps={{ htmlInput: { inputMode: modo, 'aria-label': `${rotulo}, série ${k + 1}`, step: nome === 'kg' ? 0.5 : 1 } }} sx={campoSx} />
            )
            return (
              <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 20, textAlign: 'center' }}>{k + 1}</Typography>
                {campo('kg', 'kg', 'decimal')}
                {campo('reps', 'reps', 'numeric')}
                <IconButton onClick={() => onMarcar(k, sug)} aria-label={`Série ${k + 1} feita`} aria-pressed={!!set.ok}
                  sx={{ width: 48, height: 44, border: 1, borderColor: set.ok ? 'success.main' : 'divider', borderRadius: 2.5,
                    bgcolor: set.ok ? 'success.main' : 'transparent', color: set.ok ? 'success.contrastText' : 'text.secondary',
                    '&:hover': { bgcolor: set.ok ? 'success.main' : 'action.hover' } }}>
                  <Check size={20} />
                </IconButton>
              </Stack>
            )
          })}
        </Stack>
        {feitas === 0 && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Fez o sugerido? Toque só no ✓.</Typography>}
      </AccordionDetails>
    </Accordion>
  )
}

function Cardio({ c, log, patins, kg, onSalvar }) {
  const info = CARDIO[c.tipo]
  const [min, setMin] = useState(c.min), [int, setInt] = useState(intensidadeCardio(c.tipo))
  const m = parseInt(min) > 0 ? parseInt(min) : 0
  return (
    <Card sx={{ mt: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
          bgcolor: log ? 'success.main' : 'action.hover', color: log ? 'success.contrastText' : 'text.secondary' }}>
          {log ? <Check size={18} /> : <HeartPulse size={18} />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{info.nome}</Typography>
          <Typography variant="body2" color="text.secondary">
            {log ? `${log.min} min · ${INTENSIDADES[intensidadeCardio(c.tipo, log)].nome.toLowerCase()} · ${kcalCardio(c.tipo, log, kg)} kcal` : `${c.min} min · para fechar o treino`}
          </Typography>
        </Box>
        {log && <Button color="inherit" onClick={() => onSalvar(null)}>Desfazer</Button>}
      </Stack>
      {!log && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {info.como}{patins && c.tipo !== 'caminhada' ? ' Vai andar de patins hoje? Pode pular.' : ''}
          </Typography>
          <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={int} onChange={(_, v) => v && setInt(v)} aria-label="Intensidade do cardio" sx={{ mt: 1.5 }}>
            {Object.entries(INTENSIDADES).map(([id, i]) => <ToggleButton key={id} value={id}>{i.nome}</ToggleButton>)}
          </ToggleButtonGroup>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
            <TextField size="small" type="number" value={min} onChange={(e) => setMin(e.target.value)} sx={{ width: 120 }}
              slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Minutos de cardio' }, input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{m ? `Cerca de ${kcalCardio(c.tipo, { min: m, int }, kg)} kcal` : ''}</Typography>
            <Button variant="contained" disabled={!m} onClick={() => onSalvar({ min: m, int })}>Marcar</Button>
          </Stack>
        </>
      )}
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
