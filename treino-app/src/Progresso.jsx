import React, { useRef, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, InputAdornment, LinearProgress, List, ListItem, ListItemText, Paper, Stack, Switch, Tab, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ChevronDown, Download, Plus, Scale, Settings, Trash2, Trophy, Upload, Wind } from 'lucide-react'
import { NOMES, kgNoModo, kgTotal, modoLado, progressao } from './exercicios.js'
import { META, PERFIL_PADRAO, PESO_INICIAL, br, hojeISO, iso, num, semana } from './store.js'
import { INTENSIDADES, kcalPatins, pesoEm } from './gasto.js'
import Historico from './Historico.jsx'
import Balanco, { Perfil } from './Balanco.jsx'
import Periodo from './Periodo.jsx'
import { testarBip } from './bip.js'

const Card = ({ sx, ...p }) => <Paper sx={{ p: 2, border: 1, borderColor: 'divider', ...sx }} {...p} />
const ABAS = ['resumo', 'calendario', 'evolucao']
const lerAba = () => { try { return Math.max(0, ABAS.indexOf(localStorage.getItem('treino-aba-progresso'))) } catch { return 0 } }

export default function Progresso({ s, update, replace }) {
  const [aba, setAba] = useState(lerAba)
  const mudar = (v) => { setAba(v); try { localStorage.setItem('treino-aba-progresso', ABAS[v]) } catch {} }
  return (
    <>
      <Typography variant="h4">Progresso</Typography>
      <Tabs value={aba} onChange={(_, v) => mudar(v)} variant="fullWidth" sx={{ mt: 1.5, mb: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Resumo" />
        <Tab label="Calendário" />
        <Tab label="Evolução" />
      </Tabs>
      {aba === 0 && (
        <Stack spacing={2}>
          <Peso s={s} update={update} />
          <Balanco s={s} />
          <Patins s={s} update={update} />
          <Ajustes s={s} update={update} replace={replace} />
        </Stack>
      )}
      {aba === 1 && <Historico s={s} />}
      {aba === 2 && (
        <Stack spacing={2}>
          <Periodo s={s} />
          <Recordes s={s} />
        </Stack>
      )}
    </>
  )
}

/* ---------- Peso ---------- */

function Peso({ s, update }) {
  const hoje = hojeISO()
  const pesos = [...s.peso].sort((a, b) => (a.date < b.date ? -1 : 1))
  const atual = pesos.at(-1)?.kg ?? PESO_INICIAL, dif = atual - PESO_INICIAL
  const andado = Math.min(100, Math.max(0, ((PESO_INICIAL - atual) / (PESO_INICIAL - META)) * 100))
  const [dlg, setDlg] = useState(false), [kg, setKg] = useState(''), [hist, setHist] = useState(false)
  const ultimo = pesos.at(-1)
  const dias = ultimo ? Math.round((new Date(`${hoje}T12:00:00`) - new Date(`${ultimo.date}T12:00:00`)) / 864e5) : null
  const salvar = () => {
    const v = parseFloat(String(kg).replace(',', '.')); if (!(v > 30 && v < 400)) return
    update((n) => { n.peso = n.peso.filter((p) => p.date !== hoje); n.peso.push({ date: hoje, kg: v }) }); setKg(''); setDlg(false)
  }
  return (
    <Card>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="textSecondary">Peso atual</Typography>
          <Typography variant="h4" component="div">{num(atual)} <Typography component="span" color="textSecondary">kg</Typography></Typography>
          <Typography variant="body2" color={dif < 0 ? 'success' : 'textSecondary'} sx={{ fontWeight: dif < 0 ? 500 : 400 }}>
            {dif === 0 ? 'Ponto de partida' : `${dif > 0 ? '+' : '−'} ${num(Math.abs(dif).toFixed(1))} kg no total`}
          </Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<Scale size={16} />} onClick={() => setDlg(true)} sx={{ flexShrink: 0 }}>Registrar</Button>
      </Stack>

      <LinearProgress variant="determinate" value={andado} color="success" sx={{ height: 8, borderRadius: 4, mt: 2 }} aria-label="Caminho até a meta" />
      <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.75 }}>
        <Typography variant="caption" color="textSecondary">{PESO_INICIAL} kg</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{atual > META ? `Faltam ${num((atual - META).toFixed(1))} kg` : 'Meta atingida'}</Typography>
        <Typography variant="caption" color="textSecondary">Meta {META} kg</Typography>
      </Stack>
      {dias != null && dias >= 7 && <Typography variant="body2" color="warning" sx={{ mt: 1 }}>Último registro há {dias} dias. Que tal se pesar?</Typography>}
      {!ultimo && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Registre seu peso uma vez por semana, de manhã e em jejum.</Typography>}

      {pesos.length > 0 && (
        <>
          <Box sx={{ mt: 2 }}><Grafico pesos={pesos} meta={META} /></Box>
          <Button size="small" sx={{ ml: -0.5 }} onClick={() => setHist(!hist)}
            endIcon={<ChevronDown size={16} style={{ transform: hist ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}>
            {hist ? 'Esconder registros' : `Ver registros (${pesos.length})`}
          </Button>
          <Collapse in={hist}>
            <Lista itens={[...pesos].reverse()} texto={(p) => `${num(p.kg)} kg`} onDel={(p) => update((n) => { n.peso = n.peso.filter((x) => x.date !== p.date) })} />
          </Collapse>
        </>
      )}

      <Dialog open={dlg} onClose={() => setDlg(false)} fullWidth maxWidth="xs">
        <DialogTitle>Peso de hoje</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth value={kg} onChange={(e) => setKg(e.target.value)} placeholder={num(atual)} sx={{ mt: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); salvar() } }}
            slotProps={{ htmlInput: { inputMode: 'decimal', step: 0.1, 'aria-label': 'Peso de hoje' }, input: { endAdornment: <InputAdornment position="end">kg</InputAdornment> } }} />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>De manhã, em jejum, depois do banheiro. Se já registrou hoje, o valor é substituído.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlg(false)}>Cancelar</Button>
          <Button variant="contained" onClick={salvar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

/* ---------- Patins ---------- */

function Patins({ s, update }) {
  const hoje = hojeISO()
  const [dlg, setDlg] = useState(false), [hist, setHist] = useState(false)
  const [min, setMin] = useState(''), [km, setKm] = useState(''), [int, setInt] = useState('leve')
  const sem = semana(), naSemana = s.patins.filter((p) => sem.some((d) => d.date === p.date))
  const kcalSem = naSemana.reduce((t, p) => t + kcalPatins(p, pesoEm(s, p.date)), 0)
  const m = parseInt(min) > 0 ? parseInt(min) : 0
  const lista = [...s.patins].sort((a, b) => (a.date < b.date ? 1 : -1))
  const salvar = () => {
    if (!m) return; const k = parseFloat(String(km).replace(',', '.'))
    update((n) => { n.patins = n.patins.filter((p) => p.date !== hoje); n.patins.push({ date: hoje, min: m, km: k > 0 ? k : null, int }) })
    setMin(''); setKm(''); setDlg(false)
  }
  return (
    <Card>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}><Wind size={22} /></Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Patins</Typography>
          <Typography variant="body2" color="textSecondary">
            {naSemana.length}/3 na semana{kcalSem ? ` · ${kcalSem.toLocaleString('pt-BR')} kcal` : ''}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={() => setDlg(true)} sx={{ flexShrink: 0 }}>Registrar</Button>
      </Stack>
      {lista.length > 0 && (
        <>
          <Button size="small" sx={{ mt: 1, ml: -0.5 }} onClick={() => setHist(!hist)}
            endIcon={<ChevronDown size={16} style={{ transform: hist ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}>
            {hist ? 'Esconder registros' : `Ver registros (${lista.length})`}
          </Button>
          <Collapse in={hist}>
            <Lista itens={lista}
              texto={(p) => `${p.min} min · ${(INTENSIDADES[p.int] || INTENSIDADES.leve).nome.toLowerCase()} · ${kcalPatins(p, pesoEm(s, p.date))} kcal`}
              onDel={(p) => update((n) => { n.patins = n.patins.filter((x) => x.date !== p.date) })} />
          </Collapse>
        </>
      )}

      <Dialog open={dlg} onClose={() => setDlg(false)} fullWidth maxWidth="xs">
        <DialogTitle>Patins de hoje</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField autoFocus type="number" label="Minutos" value={min} onChange={(e) => setMin(e.target.value)} sx={{ flex: 1 }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
            <TextField label="Km (opcional)" value={km} onChange={(e) => setKm(e.target.value)} sx={{ flex: 1 }} slotProps={{ htmlInput: { inputMode: 'decimal', step: 0.1 } }} />
          </Stack>
          <ToggleButtonGroup exclusive fullWidth color="primary" value={int} onChange={(_, v) => v && setInt(v)} aria-label="Intensidade" sx={{ mt: 2 }}>
            {Object.entries(INTENSIDADES).map(([id, i]) => <ToggleButton key={id} value={id}>{i.nome}</ToggleButton>)}
          </ToggleButtonGroup>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1.5 }}>
            {INTENSIDADES[int].como}.{m ? ` Cerca de ${kcalPatins({ min: m, int }, pesoEm(s, hoje))} kcal.` : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDlg(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!m} onClick={salvar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

/* ---------- Ajustes e backup ---------- */

function Ajustes({ s, update, replace }) {
  const hoje = hojeISO()
  const arquivo = useRef()
  const perfil = s.perfil || PERFIL_PADRAO
  const [editando, setEditando] = useState(false)
  const exportar = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' })); a.download = `treino-backup-${hoje}.json`; a.click()
  }
  const importar = (ev) => {
    const f = ev.target.files[0]; if (!f) return; const r = new FileReader()
    r.onload = () => { try { const d = JSON.parse(r.result); if (!d || typeof d.logs !== 'object') throw 0
      if (confirm('Substituir os dados deste aparelho pelo backup?')) replace(d) } catch { alert('Arquivo de backup inválido.') } }
    r.readAsText(f); ev.target.value = ''
  }
  return (
    <Paper sx={{ border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Accordion square>
        <AccordionSummary expandIcon={<ChevronDown size={20} />} sx={{ px: 2, '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1.5, my: 1.5 } }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}><Settings size={20} /></Box>
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>Ajustes e backup</Typography>
            <Typography variant="body2" color="textSecondary">Bipe, altura, idade e cópia dos dados</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography>Bipe no fim do descanso</Typography>
              <Typography variant="body2" color="textSecondary">Toca no fone, se estiver conectado</Typography>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center' }}>
              <Button size="small" onClick={testarBip}>Testar</Button>
              <Switch checked={s.som !== false} onChange={(e) => update((n) => { n.som = e.target.checked })} slotProps={{ input: { 'aria-label': 'Bipe no fim do descanso' } }} />
            </Stack>
          </Stack>
          {editando ? (
            <Perfil perfil={perfil} onSalvar={(p) => { update((n) => { n.perfil = p }); setEditando(false) }} />
          ) : (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography>{num(perfil.altura / 100)} m · {perfil.idade} anos</Typography>
              <Button size="small" onClick={() => setEditando(true)}>Alterar</Button>
            </Stack>
          )}
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 1.5 }}>
            Os dados ficam só neste aparelho. Baixe uma cópia de vez em quando, para não perder nada se trocar de celular ou limpar o navegador.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" startIcon={<Download size={18} />} onClick={exportar}>Baixar cópia</Button>
            <Button fullWidth variant="outlined" startIcon={<Upload size={18} />} onClick={() => arquivo.current.click()}>Restaurar</Button>
          </Stack>
          <input ref={arquivo} type="file" accept="application/json" hidden onChange={importar} />
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}

/* ---------- Recordes ---------- */

function Recordes({ s }) {
  const nomes = NOMES, best = {}
  for (const d in s.logs) for (const id in s.logs[d].ex || {}) for (const x of s.logs[d].ex[id] || [])
    if (x?.kg && nomes[id] && (!best[id] || kgTotal(x, id) > kgTotal(best[id], id))) best[id] = { ...x, d }
  const itens = Object.entries(best)
  return (
    <Card sx={{ py: itens.length ? 1.5 : 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: itens.length ? 0.5 : 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}><Trophy size={20} /></Box>
        <Typography variant="subtitle1">Maiores cargas</Typography>
      </Stack>
      {itens.length ? (
        <List disablePadding>
          {itens.map(([id, b], i) => (
            <ListItem key={id} disableGutters divider={i < itens.length - 1} secondaryAction={<Typography sx={{ fontWeight: 600 }}>{num(kgNoModo(b, id, modoLado(s, id)))} kg{modoLado(s, id) ? ' cada' : ''}{b.reps ? ` × ${b.reps}` : ''}</Typography>}>
              <ListItemText primary={nomes[id]} secondary={br(b.d)} sx={{ pr: 10 }} />
            </ListItem>
          ))}
        </List>
      ) : <Typography color="textSecondary">Anote as cargas nos treinos e elas aparecem aqui.</Typography>}
    </Card>
  )
}

function Lista({ itens, texto, onDel }) {
  if (!itens.length) return null
  return (
    <List disablePadding sx={{ mt: 0.5 }}>
      {itens.map((p) => (
        <ListItem key={p.date} disableGutters sx={{ py: 0.25 }}
          secondaryAction={<IconButton edge="end" size="small" aria-label={`Apagar registro de ${br(p.date)}`} onClick={() => confirm('Apagar este registro?') && onDel(p)}><Trash2 size={16} /></IconButton>}>
          <Typography variant="body2" color="textSecondary" sx={{ width: 64 }}>{br(p.date)}</Typography>
          <Typography variant="body2">{texto(p)}</Typography>
        </ListItem>
      ))}
    </List>
  )
}

function Grafico({ pesos: registros, meta }) {
  // O primeiro ponto é o peso inicial, um dia antes do primeiro registro.
  const d0 = new Date(`${registros[0].date}T12:00:00`); d0.setDate(d0.getDate() - 1)
  const pesos = registros[0].kg === PESO_INICIAL && registros.length > 1 ? registros : [{ date: iso(d0), kg: PESO_INICIAL }, ...registros]
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
