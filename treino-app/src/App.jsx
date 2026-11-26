import React, { useEffect, useRef, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, BottomNavigation, BottomNavigationAction, Box, Button,
  ButtonBase, Chip, Collapse, Container, Dialog, DialogContent, DialogTitle, IconButton,
  InputAdornment, LinearProgress, List, ListItem, ListItemText, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { keyframes } from '@emotion/react'
import {
  ArrowLeftRight, BookOpen, Check, ChevronDown, CirclePlay, Clock, Download, Dumbbell, Flame, HeartPulse, History, Minus, Moon, Plus, Repeat, Trash2,
  TrendingUp, TriangleAlert, Upload, Utensils, Volume2, VolumeX, Wind, X,
} from 'lucide-react'
import { CARDIO, DIAS, OPCIONAL, PLAN, duracao, fmtDesc, foto, previstoEm, video, planoDe } from './plan.js'
import { agendarBip, cancelarBip, testarBip } from './bip.js'
import { ALTERNATIVAS, kgNoModo, modoLado, progressao, treinoDe } from './exercicios.js'
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

const ABAS = 4
const entraDireita = keyframes`from { opacity: 0; transform: translateX(28px) } to { opacity: 1; transform: none }`
const entraEsquerda = keyframes`from { opacity: 0; transform: translateX(-28px) } to { opacity: 1; transform: none }`

export default function App() {
  const [s, update, replace] = useStore()
  const [aba, setAba] = useState(0)
  const [dir, setDir] = useState(0) // direção da última troca de aba, para a animação
  const [timer, setTimer] = useState(null) // { fim, total }
  const som = s.som !== false
  // Inicia (ou encerra, com 0) o descanso e agenda o bipe do fim.
  const descanso = (seg) => {
    setTimer(seg ? { fim: Date.now() + seg * 1000, total: seg } : null)
    if (seg && som) agendarBip(seg); else cancelarBip()
  }
  const toque = useRef(null)

  const ir = (v) => {
    if (v < 0 || v >= ABAS || v === aba) return
    setDir(v > aba ? 1 : -1); setAba(v); window.scrollTo(0, 0)
  }
  // Arrastar para o lado troca de aba. Ignora toques perto das bordas (gesto de voltar do Android),
  // em campos, botões de opção e janelas, e movimentos mais verticais que horizontais.
  const inicioToque = (e) => {
    toque.current = null
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    if (t.clientX < 24 || t.clientX > window.innerWidth - 24) return
    if (e.target.closest?.('input, textarea, select, .MuiToggleButtonGroup-root, .MuiModal-root, [data-sem-arrasto]')) return
    toque.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const fimToque = (e) => {
    const i = toque.current; toque.current = null
    if (!i || window.getSelection?.().toString()) return
    const t = e.changedTouches[0], dx = t.clientX - i.x, dy = t.clientY - i.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy) && Date.now() - i.t < 700) ir(aba + (dx < 0 ? 1 : -1))
  }

  return (
    <Box onTouchStart={inicioToque} onTouchEnd={fimToque} onTouchCancel={() => { toque.current = null }}
      sx={{ minHeight: '100vh', overflowX: 'clip', pb: `calc(${aba === 0 && timer ? 160 : 88}px + env(safe-area-inset-bottom))` }}>
      <Container key={aba} maxWidth="sm" sx={{ pt: 3, animation: dir ? `${dir > 0 ? entraDireita : entraEsquerda} .22s ease-out` : 'none',
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}>
        {aba === 0 && <Treino s={s} update={update} onDescanso={descanso} />}
        {aba === 1 && <Dieta s={s} update={update} />}
        {aba === 2 && <Progresso s={s} update={update} replace={replace} />}
        {aba === 3 && <Guia />}
      </Container>
      {aba === 0 && timer && <Descanso timer={timer} setTimer={setTimer} som={som}
        onMais30={() => { const fim = timer.fim + 30000; setTimer({ fim, total: timer.total + 30 }); if (som) agendarBip((fim - Date.now()) / 1000) }}
        onFechar={() => { setTimer(null); cancelarBip() }}
        onSom={() => {
          const ligar = !som
          update((n) => { n.som = ligar })
          if (ligar) { agendarBip(Math.max(0, (timer.fim - Date.now()) / 1000)); if (timer.fim <= Date.now()) testarBip() } else cancelarBip()
        }} />}
      <Paper square sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: 1, borderColor: 'divider', pb: 'env(safe-area-inset-bottom)', zIndex: 10 }}>
        <BottomNavigation showLabels value={aba} onChange={(_, v) => ir(v)} sx={{ height: 68, maxWidth: 600, mx: 'auto', '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0.5 } }}>
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

// Dia de descanso: escolher um treino da semana para repor.
// Não sugere treinar um grupo que foi treinado ontem ou que volta amanhã ou depois de amanhã.
const NOME_DIA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const somaDias = (date, n) => { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate() + n); return iso(d) }
const diaDe = (date) => new Date(`${date}T12:00:00`).getDay()

function Reposicao({ s, dias, data, temOpcional, onEscolher }) {
  const ontem = somaDias(data, -1)
  const proximos = [1, 2].map((n) => ({ n, date: somaDias(data, n), g: previstoEm(somaDias(data, n)).grupo }))
  const grupoOntem = s.logs[ontem]?.feito ? planoDe(s.logs, ontem).grupo : null
  // Motivo para não repor um treino hoje, ou null se pode.
  const motivo = (d) => {
    const g = previstoEm(d.date).grupo, prox = proximos.find((x) => x.g === g)
    if (prox) return `${prox.n === 1 ? 'Amanhã' : NOME_DIA[diaDe(prox.date)].replace(/^./, (c) => c.toUpperCase())} já é ${g}`
    if (g === grupoOntem) return `Você treinou ${g} ontem`
    return null
  }
  // Só os treinos que já passaram nesta semana; os seguintes ainda vão acontecer.
  const semana = dias.filter((d) => d.date < data && !previstoEm(d.date).descanso)
  const faltou = semana.filter((d) => !s.logs[d.date]?.feito && d.date < data)
  const boas = faltou.filter((d) => !motivo(d)), evitar = faltou.filter((d) => motivo(d))
  const [todos, setTodos] = useState(false)
  const lista = todos ? [...boas, ...semana.filter((d) => !boas.includes(d))] : boas
  const escolher = (d) => {
    const m = motivo(d)
    if (m && !confirm(`${m}. Fazer ${previstoEm(d.date).titulo.toLowerCase()} hoje tira o tempo de recuperação desse músculo. Fazer mesmo assim?`)) return
    onEscolher(d.date)
  }
  // Semana em dia num dia com treino opcional: o cartão do opcional já basta.
  if (!faltou.length && temOpcional) return null
  const titulo = boas.length ? 'Faltou algum treino?' : faltou.length ? 'Melhor descansar hoje' : 'Semana em dia'
  const texto = boas.length
    ? `Você pode repor um hoje.${evitar.length ? ` ${evitar.length > 1 ? 'Os' : 'O'} de ${evitar.map((d) => NOME_DIA[d.wd]).join(' e ')} não ${evitar.length > 1 ? 'entram' : 'entra'}: ${motivo(evitar[0]).toLowerCase()}.` : ''}`
    : faltou.length
      ? `${motivo(faltou[0])}, então não vale repor. Descanse: o fim de semana já cobre perna e peito.`
      : 'Nenhum treino ficou para trás. Aproveite o descanso.'
  return (
    <Card sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{titulo}</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>{texto}</Typography>
      {lista.map((d) => {
        const plano = previstoEm(d.date), feito = !!s.logs[d.date]?.feito, m = motivo(d)
        return (
          <Stack key={d.date} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Typography color="primary" sx={{ width: 36, fontWeight: 600 }}>{DIAS[d.wd]}</Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ lineHeight: 1.3 }}>{plano.titulo}</Typography>
              <Typography variant="body2" color={m ? 'warning' : feito ? 'success' : 'textSecondary'}>
                {m || `${feito ? 'Feito' : d.date < data ? 'Faltou' : 'Ainda não'} · ${duracao(plano)} min`}
              </Typography>
            </Box>
            <Button size="small" variant={m || feito ? 'text' : 'outlined'} color={m ? 'inherit' : 'primary'} onClick={() => escolher(d)}>Fazer</Button>
          </Stack>
        )
      })}
      {!todos && semana.length > boas.length && (
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
  const p = treinoDe(s, date)
  const [trocando, setTrocando] = useState(null) // exercício aberto na janela de troca
  const [escolhendoCardio, setEscolhendoCardio] = useState(false)
  const log = s.logs[date] || {}
  const feitas = p.ex.reduce((t, e) => t + (log.ex?.[e.id] || []).filter((x) => x?.ok).length, 0)
  const total = p.ex.reduce((t, e) => t + e.series, 0)
  const completo = (e) => (log.ex?.[e.id] || []).filter((x) => x?.ok).length >= e.series
  const [aberto, setAberto] = useState(null)
  const [cuidados, setCuidados] = useState(false)
  const gasto = gastoTreino(s, date, pesoEm(s, date))
  useEffect(() => { setAberto(p.ex.find((e) => !completo(e))?.id ?? null) }, [date, p.repoe, p.extra]) // eslint-disable-line

  const editar = (fn) => update((n) => { const l = (n.logs[date] ??= { ex: {} }); l.ex ??= {}; fn(l) })
  const marcar = (e, k, sugestao) => {
    const ligando = !log.ex?.[e.id]?.[k]?.ok
    editar((l) => {
      const set = ((l.ex[e.id] ??= [])[k] ??= {})
      set.ok = ligando
      if (ligando) { set.kg ??= sugestao.kg; set.reps ??= sugestao.reps; set.lado = modoLado(s, e.id) }
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
      <Typography color="textSecondary" sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-between', my: 2 }}>
        {dias.map((d) => {
          const sel = d.date === date, ok = s.logs[d.date]?.feito
          return (
            <ButtonBase key={d.date} onClick={() => { setDate(d.date); onDescanso(0) }} aria-pressed={sel} aria-label={`${DIAS[d.wd]} ${br(d.date)}`}
              sx={{ flexDirection: 'column', gap: 0.5, borderRadius: 3, py: 0.5, flex: 1 }}>
              <Typography variant="caption" color={d.date === hoje ? 'primary' : 'textSecondary'} sx={{ fontWeight: d.date === hoje ? 600 : 400 }}>{DIAS[d.wd]}</Typography>
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

      {p.soCardio ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
          <Typography color="textSecondary" sx={{ flex: 1 }}>{CARDIO[p.cardio.tipo].nome} · {p.no?.descanso ? 'no dia de descanso' : `no lugar de ${p.no?.titulo.toLowerCase()}`}</Typography>
          <Button size="small" onClick={() => editar((l) => { delete l.soCardio; delete l.cardio; l.feito = false })}>{p.no?.descanso ? 'Voltar ao descanso' : 'Voltar à musculação'}</Button>
        </Stack>
      ) : !p.repoe && !p.extra && (
        <Button size="small" startIcon={<HeartPulse size={16} />} onClick={() => setEscolhendoCardio(true)} sx={{ mt: 0.5, ml: -1 }}>
          {p.descanso ? 'Fazer só cardio hoje' : 'Trocar por cardio hoje'}
        </Button>
      )}
      <EscolherCardio aberto={escolhendoCardio} descanso={!!p.descanso} feitas={feitas} kg={pesoEm(s, date)} onClose={() => setEscolhendoCardio(false)}
        onEscolher={(tipo) => { editar((l) => { l.soCardio = tipo; delete l.cardio; delete l.repoe; delete l.extra; l.feito = false }); setEscolhendoCardio(false); onDescanso(0) }} />

      {(p.repoe || p.extra) && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
          <Typography color="textSecondary" sx={{ flex: 1 }}>{p.extra ? 'Treino opcional · dia de descanso' : `Reposição do treino de ${NOME_DIA[p.repoe]}`}</Typography>
          <Button size="small" onClick={() => {
            if (feitas && !confirm('Voltar ao descanso? As séries já marcadas ficam salvas, mas deixam de aparecer aqui.')) return
            editar((l) => { delete l.repoe; delete l.extra; l.feito = false }); onDescanso(0)
          }}>{p.extra ? 'Voltar ao descanso' : 'Trocar'}</Button>
        </Stack>
      )}

      {p.soCardio ? (
        <>
          <Cardio key={`so-${date}-${p.cardio.tipo}`} principal c={p.cardio} log={log.cardio} kg={pesoEm(s, date)} onSalvar={(v) => editar((l) => { l.cardio = v; l.feito = !!v })} />
          <AlongamentoFim key={`along-${date}`} sx={{ mt: 2 }} date={date} />
        </>
      ) : p.descanso ? (
        <>
        <Reposicao key={date} s={s} dias={dias} data={date} temOpcional={!!p.opcional} onEscolher={(d) => editar((l) => { l.repoe = d; delete l.extra })} />
        {p.opcional && (
          <Card sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'primary.main' }}><Dumbbell size={18} /></Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Treino opcional: {OPCIONAL.titulo.toLowerCase()}</Typography>
                <Typography variant="body2" color="textSecondary">{duracao(OPCIONAL)} min · leve, não atrapalha o fim de semana</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>
              Só se estiver com vontade. Descansar hoje também é treino: é o que te deixa inteiro para o sábado de perna.
            </Typography>
            <Button fullWidth variant="outlined" sx={{ mt: 1.5 }} onClick={() => editar((l) => { l.extra = true; delete l.repoe })}>Fazer o treino opcional</Button>
          </Card>
        )}
        <Card sx={{ mt: 2, textAlign: 'center', py: 5 }}>
          <Box sx={{ color: 'text.secondary', mb: 1 }}><Moon size={32} /></Box>
          <Typography variant="subtitle1">Hoje o corpo se recupera</Typography>
          <Typography color="textSecondary" sx={{ mt: 0.5 }}>Se der vontade, 30–40 min de patins em ritmo leve.</Typography>
        </Card>
        <RotinaPatins sx={{ mt: 2 }} />
        <AlongamentoFim key={`along-${date}`} sx={{ mt: 2 }} date={date} />
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
              <Exercicio key={e.id} e={e} n={i + 1} sets={log.ex?.[e.id] || []} ant={ultima(s.logs, e.id, date)} lado={modoLado(s, e.id)}
                onLado={(v) => update((n) => { (n.lados ??= {})[e.id] = v; for (const x of n.logs[date]?.ex?.[e.id] || []) if (x) x.lado = v })}
                onTrocar={(ALTERNATIVAS[(e.original || e).id]) ? () => setTrocando(e) : null}
                aberto={aberto === e.id} onToggle={() => setAberto(aberto === e.id ? null : e.id)}
                onCampo={(k, campo, v) => editar((l) => { const x = ((l.ex[e.id] ??= [])[k] ??= {}); x[campo] = v; x.lado = modoLado(s, e.id) })}
                onMarcar={(k, sug) => marcar(e, k, sug)} ultimo={i === p.ex.length - 1} />
            ))}
          </Paper>

          <Trocar e={trocando} onClose={() => setTrocando(null)} onEscolher={(orig, altId, sempre) => {
            if (sempre) update((n) => {
              n.trocas ??= {}
              if (altId) n.trocas[orig.id] = { por: altId, desde: date }; else delete n.trocas[orig.id]
              if (n.logs[date]?.troca) delete n.logs[date].troca[orig.id]
            })
            else editar((l) => { (l.troca ??= {})[orig.id] = altId || '' })
            setAberto(altId || orig.id); setTrocando(null)
          }} />

          <Cardio key={`cardio-${date}`} c={p.cardio} log={log.cardio} patins={p.patins} kg={pesoEm(s, date)} onSalvar={(v) => editar((l) => { l.cardio = v })} />

          {p.patins && <RotinaPatins sx={{ mt: 2 }} />}
          <AlongamentoFim key={`along-${date}`} sx={{ mt: 2 }} date={date} />

          <Button fullWidth size="large" sx={{ mt: 3 }} variant={log.feito ? 'outlined' : 'contained'} color={log.feito ? 'success' : 'primary'}
            startIcon={log.feito && <Check size={20} />}
            onClick={() => { editar((l) => { l.feito = !l.feito }); onDescanso(0) }}>
            {log.feito ? 'Treino concluído' : feitas ? 'Concluir agora' : 'Concluir treino'}
          </Button>
          {gasto.total > 0 && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5, textAlign: 'center' }}>
              Gasto estimado: {gasto.total} kcal{gasto.series ? ` · ${gasto.series} ${gasto.series === 1 ? 'série' : 'séries'}` : ''}{gasto.volume ? ` · ${Math.round(gasto.volume).toLocaleString('pt-BR')} kg levantados` : ''}
            </Typography>
          )}
        </>
      )}
    </>
  )
}

// Linha de orientação de carga, a partir do último treino.
function Orientacao({ prog, ant, e, lado }) {
  const un = lado ? ' kg cada' : ' kg'
  const ultimaTxt = ant && `Última vez: ${ant.sets.length} ${ant.sets.length === 1 ? 'série' : 'séries'}, até ${num(Math.max(...ant.sets.map((x) => kgNoModo(x, e.id, lado) || 0)))}${un}`
  const cfg = !prog
    ? { cor: 'text.secondary', icone: History, titulo: ant ? 'Repita a carga da última vez' : 'Primeira vez: comece leve', sub: ant ? ultimaTxt : 'Escolha uma carga que permita fazer as repetições com boa execução.' }
    : prog.tipo === 'subir'
      ? { cor: 'success.main', icone: TrendingUp, titulo: `Suba para ${num(prog.kg)}${un}`, sub: `Você fez ${prog.f.max} repetições em todas as séries com ${num(prog.de)}${un}. Comece com ${prog.reps} e vá subindo.` }
      : prog.tipo === 'pesado'
        ? { cor: 'warning.main', icone: TriangleAlert, titulo: `Mantenha ${num(prog.kg)}${un}`, sub: `Ficou abaixo de ${prog.f.min} repetições. Repita até fazer ${prog.f.min} em todas; se não passar disso em 2 treinos, baixe um pouco.` }
        : { cor: 'primary.main', icone: Repeat, titulo: `Mantenha ${num(prog.kg)}${un}, tente ${prog.reps} repetições`, sub: `Quando fizer ${prog.f.max} em todas as séries, o app avisa para subir.` }
  const Icone = cfg.icone
  return (
    <Stack direction="row" spacing={1.25} sx={{ mb: 1.5, alignItems: 'flex-start' }}>
      <Box sx={{ color: cfg.cor, display: 'flex', mt: '2px' }}><Icone size={18} /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ color: cfg.cor === 'text.secondary' ? 'text.primary' : cfg.cor }}>{cfg.titulo}</Typography>
        <Typography variant="body2" color="textSecondary">{cfg.sub}</Typography>
      </Box>
    </Stack>
  )
}

function Exercicio({ e, n, sets, ant, lado, onLado, onTrocar, aberto, onToggle, onCampo, onMarcar, ultimo }) {
  const feitas = sets.filter((x) => x?.ok).length
  const ok = feitas >= e.series
  const [comoFazer, setComoFazer] = useState(false)
  const prog = progressao(e, ant, lado)
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
          <Typography variant="body2" color="textSecondary">
            {e.series} × {e.reps} · {fmtDesc(e.desc)} de descanso{e.original ? ` · no lugar de ${e.original.nome.toLowerCase()}` : ''}
          </Typography>
        </Box>
        {feitas > 0 && !ok ? <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{feitas}/{e.series}</Typography>
          : prog?.tipo === 'subir' && !ok ? <Box sx={{ color: 'success.main', display: 'flex' }} aria-label="Pronto para subir carga"><TrendingUp size={18} /></Box> : null}
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
        <Orientacao prog={prog} ant={ant} e={e} lado={lado} />

        <Stack direction="row" spacing={0.5} sx={{ mb: 1, ml: -1 }}>
          <Button size="small" onClick={() => setComoFazer(!comoFazer)}
            endIcon={<ChevronDown size={14} style={{ transform: comoFazer ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}>
            Como fazer
          </Button>
          {onTrocar && <Button size="small" startIcon={<ArrowLeftRight size={14} />} onClick={onTrocar}>Trocar exercício</Button>}
        </Stack>
        <Collapse in={comoFazer} unmountOnExit>
          <Box sx={{ pb: 1.5 }}>
            {foto(e.id) && <Box component="img" src={foto(e.id)} alt={`${e.nome}: posição inicial e final`} sx={{ display: 'block', width: '100%', borderRadius: 2, mb: 1 }} />}
            {e.nota && <Typography variant="body2" color="textSecondary">{e.nota}</Typography>}
            <Button size="small" href={video(e.nome)} target="_blank" rel="noopener" startIcon={<CirclePlay size={16} />} sx={{ mt: 0.5, ml: -1 }}>Ver vídeo</Button>
          </Box>
        </Collapse>

        <Stack direction="row" spacing={1} sx={{ mb: 0.5, color: 'text.secondary', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ width: 20, textAlign: 'center' }}>#</Typography>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <ButtonBase onClick={() => onLado(!lado)} aria-label={`Carga ${lado ? 'por lado' : 'total'}. Tocar para trocar`}
              sx={{ borderRadius: 1, px: 0.75, py: 0.25, typography: 'caption', color: 'primary.main', fontWeight: 600, gap: 0.5 }}>
              kg {lado ? 'por lado' : 'total'} <ArrowLeftRight size={12} />
            </ButtonBase>
          </Box>
          <Typography variant="caption" sx={{ flex: 1, textAlign: 'center' }}>Repetições</Typography>
          <Box sx={{ width: 48 }} />
        </Stack>
        <Stack spacing={1}>
          {Array.from({ length: e.series }, (_, k) => {
            const set = sets[k] || {}
            // Sugestão: se é hora de subir, a carga nova; senão a mesma série do último treino (ou a anterior de hoje).
            const base = ant?.sets[k] || ant?.sets.at(-1)
            const sug = prog?.tipo === 'subir' ? { kg: prog.kg, reps: prog.reps }
              : base ? { kg: kgNoModo(base, e.id, lado), reps: base.reps }
              : { kg: sets[k - 1]?.kg, reps: sets[k - 1]?.reps }
            const campo = (nome, rotulo, modo) => (
              <TextField size="small" type="number" value={set[nome] ?? ''} placeholder={sug[nome] != null ? num(sug[nome]) : '–'}
                onChange={(ev) => onCampo(k, nome, ev.target.value === '' ? undefined : +ev.target.value)}
                slotProps={{ htmlInput: { inputMode: modo, 'aria-label': `${rotulo}, série ${k + 1}`, step: nome === 'kg' ? 0.5 : 1 } }} sx={campoSx} />
            )
            return (
              <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" color="textSecondary" sx={{ width: 20, textAlign: 'center' }}>{k + 1}</Typography>
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
        {feitas === 0 && <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>Fez o sugerido? Toque só no ✓.</Typography>}
      </AccordionDetails>
    </Accordion>
  )
}

// Janela para trocar o treino do dia por uma sessão de cardio.
function EscolherCardio({ aberto, descanso, feitas, kg, onClose, onEscolher }) {
  const opcoes = ['bike', 'esteira', 'escada']
  return (
    <Dialog open={aberto} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1 }}>
        {descanso ? 'Cardio no dia de descanso' : 'Trocar por cardio hoje'}
        <Typography variant="body2" color="textSecondary">Cerca de 1 hora. Tempo e intensidade você ajusta na tela do dia.</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {opcoes.map((t) => (
          <ButtonBase key={t} onClick={() => {
            if (feitas && !confirm('Já há séries marcadas hoje. Elas ficam salvas, mas o dia passa a contar como cardio. Continuar?')) return
            onEscolher(t)
          }} sx={{ display: 'flex', width: '100%', textAlign: 'left', gap: 1.5, py: 1.25, borderTop: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'flex-start' }}>
            <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'primary.main' }}><HeartPulse size={18} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{CARDIO[t].nome}</Typography>
              <Typography variant="body2" color="textSecondary">1 h moderada · cerca de {kcalCardio(t, { min: 60, int: 'moderada' }, kg)} kcal</Typography>
            </Box>
          </ButtonBase>
        ))}
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1.5 }}>
          {descanso ? 'Dica: prefira bicicleta ou esteira na sexta, para chegar com as pernas inteiras no sábado.'
            : 'Dica: troque no máximo 2 treinos por semana e prefira os dias de costas. Perna e peito são os que mais mudam o seu formato.'}
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

// Janela para trocar um exercício por outro parecido, só hoje ou daqui em diante.
function Trocar({ e, onClose, onEscolher }) {
  const [sempre, setSempre] = useState(false)
  const [ultimo, setUltimo] = useState(e)
  if (e && e !== ultimo) setUltimo(e) // mantém o conteúdo durante a animação de fechar
  const atual = e || ultimo
  if (!atual) return null
  const orig = atual.original || atual
  const opcoes = [...(atual.original ? [{ id: null, nome: orig.nome, nota: 'Voltar ao exercício do plano' }] : []), ...(ALTERNATIVAS[orig.id] || []).filter((a) => a.id !== atual.id)]
  return (
    <Dialog open={!!e} onClose={onClose} fullWidth maxWidth="xs" scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        Trocar {atual.nome.toLowerCase()}
        <Typography variant="body2" color="textSecondary">Mesmo músculo, mesmas séries e repetições.</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={sempre ? 'sempre' : 'hoje'} onChange={(_, v) => v && setSempre(v === 'sempre')}
          aria-label="Por quanto tempo" sx={{ mb: 1.5 }}>
          <ToggleButton value="hoje">Só hoje</ToggleButton>
          <ToggleButton value="sempre">Sempre</ToggleButton>
        </ToggleButtonGroup>
        {opcoes.map((a) => (
          <ButtonBase key={a.id ?? 'original'} onClick={() => onEscolher(orig, a.id, sempre)}
            sx={{ display: 'flex', width: '100%', textAlign: 'left', gap: 1.5, py: 1.25, borderTop: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'flex-start' }}>
            {foto(a.id ?? orig.id)
              ? <Box component="img" src={foto(a.id ?? orig.id)} alt="" sx={{ width: 96, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />
              : <Box sx={{ width: 96, height: 48, borderRadius: 1, bgcolor: 'action.hover', flexShrink: 0, display: 'grid', placeItems: 'center', color: 'text.secondary' }}><Dumbbell size={18} /></Box>}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>{a.nome}</Typography>
              {a.nota && <Typography variant="body2" color="textSecondary">{a.nota}</Typography>}
            </Box>
          </ButtonBase>
        ))}
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1.5 }}>
          Cada exercício guarda o próprio histórico de cargas.
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

function Cardio({ c, log, patins, kg, onSalvar, principal }) {
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
          <Typography variant="body2" color="textSecondary">
            {log ? `${log.min} min · ${INTENSIDADES[intensidadeCardio(c.tipo, log)].nome.toLowerCase()} · ${kcalCardio(c.tipo, log, kg)} kcal` : principal ? 'Sessão de cardio de hoje' : `${c.min} min · para fechar o treino`}
          </Typography>
        </Box>
        {log && <Button color="inherit" onClick={() => onSalvar(null)}>Desfazer</Button>}
      </Stack>
      {!log && (
        <>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>
            {info.como}{patins && !principal && c.tipo !== 'caminhada' ? ' Vai andar de patins hoje? Pode pular.' : ''}
          </Typography>
          <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={int} onChange={(_, v) => v && setInt(v)} aria-label="Intensidade do cardio" sx={{ mt: 1.5 }}>
            {Object.entries(INTENSIDADES).map(([id, i]) => <ToggleButton key={id} value={id}>{i.nome}</ToggleButton>)}
          </ToggleButtonGroup>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
            <TextField size="small" type="number" value={min} onChange={(e) => setMin(e.target.value)} sx={{ width: 120 }}
              slotProps={{ htmlInput: { inputMode: 'numeric', 'aria-label': 'Minutos de cardio' }, input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }} />
            <Typography variant="body2" color="textSecondary" sx={{ flex: 1 }}>{m ? `Cerca de ${kcalCardio(c.tipo, { min: m, int }, kg)} kcal` : ''}</Typography>
            <Button variant="contained" disabled={!m} onClick={() => onSalvar({ min: m, int })}>{principal ? 'Concluir' : 'Marcar'}</Button>
          </Stack>
        </>
      )}
    </Card>
  )
}

function Descanso({ timer, setTimer, som, onMais30, onFechar, onSom }) {
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
        {!fim && <Button size="small" color="inherit" onClick={onMais30}>+30 s</Button>}
        <IconButton color="inherit" aria-label={som ? 'Desligar bipe' : 'Ligar bipe'} aria-pressed={som} onClick={onSom}>{som ? <Volume2 size={20} /> : <VolumeX size={20} />}</IconButton>
        <IconButton color="inherit" aria-label="Fechar cronômetro" onClick={onFechar}><X size={20} /></IconButton>
      </Stack>
      {!fim && <LinearProgress variant="determinate" value={100 - (resta / timer.total) * 100} color="inherit" sx={{ height: 3, opacity: 0.5 }} />}
    </Paper>
  )
}
