import React, { useEffect, useRef, useState } from 'react'
import { Box, Button, LinearProgress, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { Pause, Play, Square, Volume2 } from 'lucide-react'
import { agendarSequencia, cancelarSequencia, tocarSinal } from './bip.js'

const NOMES = { leve: 'Leve', moderada: 'Moderado', forte: 'Forte' }
const COMO = {
  leve: 'Ritmo de passeio, conversa fácil.',
  moderada: 'Dá para falar frases inteiras.',
  forte: 'Só frases curtas. Não é tiro máximo.',
}
const COR = { leve: 'info', moderada: 'primary', forte: 'warning' }

// Fases da sessão, em segundos. Intervalado: aquecimento, blocos de 1 min forte + 2 min moderado, volta à calma.
export function montarFases(modo, minutos) {
  const total = Math.max(10, Math.round(minutos)) * 60
  const borda = total >= 30 * 60 ? 5 * 60 : 3 * 60
  const meio = total - 2 * borda
  const fases = [{ int: 'leve', seg: borda, nome: 'Aquecimento' }]
  if (modo === 'intervalado') {
    const blocos = Math.floor(meio / 180)
    for (let i = 0; i < blocos; i++) fases.push({ int: 'forte', seg: 60, nome: `Forte ${i + 1} de ${blocos}` }, { int: 'moderada', seg: 120, nome: 'Moderado' })
    const sobra = meio - blocos * 180
    if (sobra) fases.push({ int: 'moderada', seg: sobra, nome: 'Moderado' })
  } else fases.push({ int: 'moderada', seg: meio, nome: 'Moderado' })
  fases.push({ int: 'leve', seg: borda, nome: 'Volta à calma' })
  return fases
}

// Sinais a partir de `decorrido` segundos: troca de fase (sobe ou desce), aviso 5 s antes e fim.
function eventos(fases, decorrido) {
  const ordem = { leve: 0, moderada: 1, forte: 2 }
  const ev = []
  let t = 0
  fases.forEach((f, i) => {
    t += f.seg
    const prox = fases[i + 1]
    if (prox) {
      ev.push({ em: t - 5 - decorrido, tipo: 'aviso' })
      ev.push({ em: t - decorrido, tipo: ordem[prox.int] > ordem[f.int] ? 'subir' : 'descer' })
    } else ev.push({ em: t - decorrido, tipo: 'fim' })
  })
  return ev
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

// Sessão guiada de cardio com sinais sonoros. Ao terminar (ou encerrar), devolve os minutos feitos.
export default function SessaoCardio({ minutos, onConcluir, onRodando }) {
  const [modo, setModo] = useState('intervalado')
  const [estado, setEstado] = useState(null) // { fases, inicio, pausadoEm, pausado }
  const [agora, setAgora] = useState(Date.now())
  const fim = useRef(false)

  useEffect(() => {
    if (!estado || estado.pausadoEm) return
    const i = setInterval(() => setAgora(Date.now()), 500)
    const vis = () => setAgora(Date.now())
    document.addEventListener('visibilitychange', vis)
    return () => { clearInterval(i); document.removeEventListener('visibilitychange', vis) }
  }, [estado])
  useEffect(() => () => cancelarSequencia(), [])
  useEffect(() => { onRodando?.(!!estado) }, [!!estado]) // eslint-disable-line

  const fases = montarFases(modo, minutos)
  const duracao = fases.reduce((t, f) => t + f.seg, 0)

  if (!estado) {
    const fortes = fases.filter((f) => f.int === 'forte').length
    return (
      <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Sessão guiada com sinais sonoros</Typography>
        <ToggleButtonGroup exclusive fullWidth size="small" color="primary" value={modo} onChange={(_, v) => v && setModo(v)} aria-label="Tipo de sessão">
          <ToggleButton value="intervalado">Intervalado</ToggleButton>
          <ToggleButton value="continuo">Contínuo</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {modo === 'intervalado'
            ? `${fases[0].seg / 60} min leve, ${fortes} vezes 1 min forte + 2 min moderado, ${fases.at(-1).seg / 60} min leve. Um sinal subindo pede para acelerar; descendo, para aliviar.`
            : `${fases[0].seg / 60} min leve, ${fases[1].seg / 60} min moderado e ${fases.at(-1).seg / 60} min leve, com sinal em cada troca.`}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button variant="contained" startIcon={<Play size={16} />} sx={{ flex: 1 }} onClick={() => {
            fim.current = false
            agendarSequencia(eventos(fases, 0))
            setEstado({ fases, inicio: Date.now(), pausadoEm: null })
          }}>Iniciar {mmss(duracao).replace(':00', ' min')}</Button>
          <Button aria-label="Ouvir os sinais" startIcon={<Volume2 size={16} />} onClick={() => { tocarSinal('subir'); setTimeout(() => tocarSinal('descer'), 900) }}>Ouvir</Button>
        </Stack>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>Os sinais tocam no fone, mesmo com o app minimizado. Deixe a tela ligada se o celular costuma fechar apps em segundo plano.</Typography>
      </Box>
    )
  }

  const total = estado.fases.reduce((t, f) => t + f.seg, 0)
  const decorrido = Math.max(0, Math.min(total, ((estado.pausadoEm || Math.max(agora, estado.inicio)) - estado.inicio) / 1000))
  let acum = 0, idx = 0
  while (idx < estado.fases.length - 1 && acum + estado.fases[idx].seg <= decorrido) { acum += estado.fases[idx].seg; idx++ }
  const fase = estado.fases[idx], resta = acum + fase.seg - decorrido, prox = estado.fases[idx + 1]
  const terminou = decorrido >= total

  const encerrar = () => {
    cancelarSequencia()
    const min = Math.max(1, Math.round(decorrido / 60))
    setEstado(null)
    onConcluir(min)
  }
  if (terminou && !fim.current) { fim.current = true; setTimeout(encerrar, 0) }

  return (
    <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: 2, borderColor: `${COR[fase.int]}.main` }} role="timer" aria-live="polite">
      <Typography variant="overline" color="textSecondary">{fase.nome}</Typography>
      <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="div" color={COR[fase.int]}>{NOMES[fase.int]}</Typography>
        <Typography variant="h4" component="div" sx={{ fontVariantNumeric: 'tabular-nums' }}>{mmss(Math.max(0, resta))}</Typography>
      </Stack>
      <Typography variant="body2" color="textSecondary">{COMO[fase.int]}</Typography>
      {prox && <Typography variant="body2" sx={{ mt: 0.5 }}>Depois: {NOMES[prox.int].toLowerCase()}{prox.int === 'forte' ? ' (1 min)' : ''}</Typography>}
      <LinearProgress variant="determinate" value={(decorrido / total) * 100} color={COR[fase.int]} sx={{ height: 6, borderRadius: 3, mt: 1.5 }} aria-label="Progresso da sessão" />
      <Typography variant="caption" color="textSecondary">{mmss(decorrido)} de {mmss(total)}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        {estado.pausadoEm ? (
          <Button variant="contained" startIcon={<Play size={16} />} sx={{ flex: 1 }} onClick={() => {
            const inicio = estado.inicio + (Date.now() - estado.pausadoEm)
            agendarSequencia(eventos(estado.fases, decorrido))
            setEstado({ ...estado, inicio, pausadoEm: null })
          }}>Retomar</Button>
        ) : (
          <Button variant="outlined" startIcon={<Pause size={16} />} sx={{ flex: 1 }} onClick={() => { cancelarSequencia(); setEstado({ ...estado, pausadoEm: Date.now() }) }}>Pausar</Button>
        )}
        <Button color="inherit" startIcon={<Square size={14} />} onClick={encerrar}>Encerrar</Button>
      </Stack>
    </Box>
  )
}
