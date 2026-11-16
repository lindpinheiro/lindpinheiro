import React, { useState } from 'react'
import { Box, Button, Collapse, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { ChevronDown, Dumbbell, Wind } from 'lucide-react'
import { DIAS, planoDe } from './plan.js'
import { INTENSIDADES, consumo, diaSemana, gastoBase, gastoTreino, kcalPatins, pesoEm } from './gasto.js'
import { PERFIL_PADRAO, hojeISO, num, semana } from './store.js'

const fmt = (n) => Math.round(n).toLocaleString('pt-BR')
const kg = (v) => `${v > 0 ? '−' : '+'} ${num(Math.abs(v).toFixed(1))} kg`

export function Perfil({ perfil, onSalvar }) {
  const [altura, setAltura] = useState(perfil?.altura ?? ''), [idade, setIdade] = useState(perfil?.idade ?? '')
  const ok = altura > 100 && altura < 250 && idade > 10 && idade < 110
  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Altura e idade entram na estimativa de quanto seu corpo gasta por dia.</Typography>
      <Stack direction="row" spacing={1}>
        <TextField size="small" type="number" label="Altura, cm" value={altura} onChange={(e) => setAltura(e.target.value)} sx={{ flex: 1 }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
        <TextField size="small" type="number" label="Idade" value={idade} onChange={(e) => setIdade(e.target.value)} sx={{ flex: 1 }} slotProps={{ htmlInput: { inputMode: 'numeric' } }} />
        <Button variant="contained" disabled={!ok} onClick={() => onSalvar({ altura: +altura, idade: +idade })}>Salvar</Button>
      </Stack>
    </>
  )
}

const Linha = ({ rotulo, valor, forte }) => (
  <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', py: 0.5 }}>
    <Typography color={forte ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: forte ? 600 : 400 }}>{rotulo}</Typography>
    <Typography noWrap sx={{ fontWeight: forte ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>{valor}</Typography>
  </Stack>
)

// Cartão "Esta semana": previsão de perda em destaque, três números e a conta escondida até ser pedida.
export default function Balanco({ s }) {
  const hoje = hojeISO()
  const [conta, setConta] = useState(false)
  const perfil = s.perfil || PERFIL_PADRAO
  const sem = semana()

  const dias = sem.filter((d) => d.date <= hoje).map((d) => {
    const peso = pesoEm(s, d.date), pat = s.patins.find((p) => p.date === d.date)
    return { ...d, c: consumo(s, d.date), base: gastoBase(peso, perfil), treino: gastoTreino(s, d.date, peso), pat, patins: pat ? kcalPatins(pat, peso) : 0 }
  })
  const atividades = dias.flatMap((d) => [
    d.treino.total > 0 && { id: `t${d.date}`, icone: Dumbbell, dia: DIAS[d.wd], nome: planoDe(s.logs, d.date).titulo,
      detalhe: [d.treino.series && `${d.treino.series} ${d.treino.series === 1 ? 'série' : 'séries'}`, d.treino.volume && `${fmt(d.treino.volume)} kg levantados`, d.treino.cardio && `cardio ${d.treino.cardio} kcal`].filter(Boolean).join(' · '), kcal: d.treino.total },
    d.pat && { id: `p${d.date}`, icone: Wind, dia: DIAS[d.wd], nome: 'Patins', detalhe: `${d.pat.min} min · ${(INTENSIDADES[d.pat.int] || INTENSIDADES.leve).nome.toLowerCase()}`, kcal: d.patins },
  ]).filter(Boolean)
  const totalExercicio = atividades.reduce((t, a) => t + a.kcal, 0)
  const treinos = sem.filter((d) => s.logs[d.date]?.feito).length
  const diasDieta = dias.filter((d) => d.c.completa).length

  // A previsão só usa os dias com as três refeições marcadas: refeição não marcada contaria como zero.
  const cont = dias.filter((d) => d.c.completa)
  const soma = (f) => cont.reduce((t, d) => t + f(d), 0)
  const comido = soma((d) => d.c.kcal), base = soma((d) => d.base), treino = soma((d) => d.treino.total), patins = soma((d) => d.patins)
  const deficit = base + treino + patins - comido
  const porSemana = (v) => ((v / cont.length) * 7) / 7700
  const ritmo = cont.length ? porSemana(deficit) : 0, soDieta = cont.length ? porSemana(base - comido) : 0
  const ini = new Date(`${sem[0].date}T12:00:00`), fim = new Date(`${sem[6].date}T12:00:00`)
  const periodo = `${ini.getDate()}${ini.getMonth() !== fim.getMonth() ? ` de ${ini.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}` : ''} a ${fim.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')}`

  const Metrica = ({ v, de, label }) => (
    <Box sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 2, bgcolor: 'action.hover' }}>
      <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
        {v}{de != null && <Typography component="span" variant="body2" color="text.secondary">/{de}</Typography>}
      </Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
  )

  return (
    <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="subtitle1">Esta semana</Typography>
        <Typography variant="body2" color="text.secondary">{periodo}</Typography>
      </Stack>

      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">Previsão de perda</Typography>
        {cont.length ? (
          <>
            <Typography variant="h4" component="div" color={ritmo > 0 ? 'success.main' : 'warning.main'}>{kg(ritmo)}</Typography>
            <Typography variant="body2" color="text.secondary">Treino e patins somam {kg(ritmo - soDieta).replace(/^[−+] /, '')} a isso.</Typography>
          </>
        ) : (
          <Typography sx={{ mt: 0.5 }}>Aparece quando você marcar as três refeições de um dia na aba Dieta.</Typography>
        )}
      </Box>

      <Stack direction="row" spacing={1}>
        <Metrica v={treinos} de={6} label="treinos" />
        <Metrica v={diasDieta} de={7} label="dieta" />
        <Metrica v={fmt(totalExercicio)} label="kcal gastas" />
      </Stack>

      <Button size="small" sx={{ mt: 1.5, ml: -0.5 }} endIcon={<ChevronDown size={16} style={{ transform: conta ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
        onClick={() => setConta(!conta)}>{conta ? 'Esconder a conta' : 'Ver a conta'}</Button>
      <Collapse in={conta}>
        {cont.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Linha rotulo="Gasto do corpo" valor={`${fmt(base)} kcal`} />
            <Linha rotulo="Treinos" valor={`+ ${fmt(treino)} kcal`} />
            <Linha rotulo="Patins" valor={`+ ${fmt(patins)} kcal`} />
            <Linha rotulo="Comido" valor={`− ${fmt(comido)} kcal`} />
            <Divider sx={{ my: 1 }} />
            <Linha forte rotulo={deficit >= 0 ? 'Déficit' : 'Excesso'} valor={`${fmt(Math.abs(deficit))} kcal`} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Só com a dieta seria {kg(soDieta)}.</Typography>
          </Box>
        )}
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>Gasto com exercício</Typography>
        {atividades.length ? atividades.map((a) => (
          <Stack key={a.id} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><a.icone size={20} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ lineHeight: 1.3 }}>{a.dia} · {a.nome}</Typography>
              {a.detalhe && <Typography variant="body2" color="text.secondary">{a.detalhe}</Typography>}
            </Box>
            <Typography noWrap sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.kcal} kcal</Typography>
          </Stack>
        )) : <Typography variant="body2" color="text.secondary">Nenhum treino ou patins registrado ainda.</Typography>}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Estimativa com {cont.length} de {dias.length} {dias.length === 1 ? 'dia' : 'dias'}, projetada para a semana. Só contam os dias com as três refeições marcadas; cada 7.700 kcal de déficit dão cerca de 1 kg.
        </Typography>
      </Collapse>
    </Paper>
  )
}
