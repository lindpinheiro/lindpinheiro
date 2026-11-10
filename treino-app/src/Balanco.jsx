import React, { useState } from 'react'
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { Dumbbell, Wind } from 'lucide-react'
import { DIAS, PLAN } from './plan.js'
import { INTENSIDADES, consumo, diaSemana, gastoBase, gastoTreino, kcalPatins, pesoEm } from './gasto.js'
import { PERFIL_PADRAO, hojeISO, num, semana } from './store.js'

const fmt = (n) => Math.round(n).toLocaleString('pt-BR')
const kg = (v) => `${v > 0 ? '−' : '+'} ${num(Math.abs(v).toFixed(1))} kg`

function Perfil({ perfil, onSalvar }) {
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

export default function Balanco({ s, update }) {
  const hoje = hojeISO()
  const [editando, setEditando] = useState(false)
  const perfil = s.perfil || PERFIL_PADRAO
  const Card = (p) => <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }} {...p} />
  if (editando) return <Card><Perfil perfil={perfil} onSalvar={(p) => { update((n) => { n.perfil = p }); setEditando(false) }} /></Card>

  const dias = semana().filter((d) => d.date <= hoje).map((d) => {
    const peso = pesoEm(s, d.date), pat = s.patins.find((p) => p.date === d.date)
    return { ...d, c: consumo(s, d.date), base: gastoBase(peso, perfil), treino: gastoTreino(s, d.date, peso), pat, patins: pat ? kcalPatins(pat, peso) : 0 }
  })
  // Atividades da semana, todas, com o gasto de cada uma.
  const atividades = dias.flatMap((d) => [
    d.treino.total > 0 && { id: `t${d.date}`, icone: Dumbbell, dia: DIAS[d.wd], nome: PLAN[diaSemana(d.date)].titulo,
      detalhe: [d.treino.series && `${d.treino.series} ${d.treino.series === 1 ? 'série' : 'séries'}`, d.treino.volume && `${fmt(d.treino.volume)} kg levantados`, d.treino.cardio && `cardio ${d.treino.cardio} kcal`].filter(Boolean).join(' · '), kcal: d.treino.total },
    d.pat && { id: `p${d.date}`, icone: Wind, dia: DIAS[d.wd], nome: 'Patins', detalhe: `${d.pat.min} min · ${(INTENSIDADES[d.pat.int] || INTENSIDADES.leve).nome.toLowerCase()}`, kcal: d.patins },
  ]).filter(Boolean)
  const totalExercicio = atividades.reduce((t, a) => t + a.kcal, 0)

  // O balanço só usa os dias com as três refeições marcadas: refeição não marcada contaria como zero.
  const cont = dias.filter((d) => d.c.completa)
  const soma = (f) => cont.reduce((t, d) => t + f(d), 0)
  const comido = soma((d) => d.c.kcal), base = soma((d) => d.base), treino = soma((d) => d.treino.total), patins = soma((d) => d.patins)
  const deficit = base + treino + patins - comido
  const porSemana = (v) => ((v / cont.length) * 7) / 7700
  const ritmo = cont.length ? porSemana(deficit) : 0, soDieta = cont.length ? porSemana(base - comido) : 0

  return (
    <Stack spacing={1.5}>
      <Card>
        <Typography variant="body2" color="text.secondary">Previsão para esta semana</Typography>
        {cont.length ? (
          <>
            <Typography variant="h4" component="div" color={ritmo > 0 ? 'success.main' : 'warning.main'} sx={{ my: 0.5 }}>{kg(ritmo)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Só com a dieta seria {kg(soDieta)}. Treino e patins somam {kg(ritmo - soDieta).replace('− ', '').replace('+ ', '')}.
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Linha rotulo="Gasto do corpo" valor={`${fmt(base)} kcal`} />
            <Linha rotulo="Treinos" valor={`+ ${fmt(treino)} kcal`} />
            <Linha rotulo="Patins" valor={`+ ${fmt(patins)} kcal`} />
            <Linha rotulo="Comido" valor={`− ${fmt(comido)} kcal`} />
            <Divider sx={{ my: 1 }} />
            <Linha forte rotulo={deficit >= 0 ? 'Déficit' : 'Excesso'} valor={`${fmt(Math.abs(deficit))} kcal`} />
          </>
        ) : (
          <Typography sx={{ mt: 0.5 }}>Marque as três refeições de um dia na aba Dieta para a previsão aparecer.</Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          Média de {cont.length} de {dias.length} {dias.length === 1 ? 'dia' : 'dias'}, projetada para 7. Só contam os dias com as três refeições marcadas. A cada 7.700 kcal de déficit, cerca de 1 kg.
        </Typography>
        <Button size="small" sx={{ mt: 0.5, ml: -0.5 }} onClick={() => setEditando(true)}>Alterar altura e idade</Button>
      </Card>

      <Card>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: atividades.length ? 1 : 0 }}>
          <Typography variant="subtitle1">Gasto com exercício</Typography>
          <Typography sx={{ fontWeight: 600 }}>{fmt(totalExercicio)} kcal</Typography>
        </Stack>
        {atividades.length ? atividades.map((a) => (
          <Stack key={a.id} direction="row" spacing={1.5} sx={{ py: 1, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}>
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><a.icone size={20} /></Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ lineHeight: 1.3 }}>{a.dia} · {a.nome}</Typography>
              {a.detalhe && <Typography variant="body2" color="text.secondary">{a.detalhe}</Typography>}
            </Box>
            <Typography noWrap sx={{ fontVariantNumeric: 'tabular-nums' }}>{a.kcal} kcal</Typography>
          </Stack>
        )) : <Typography color="text.secondary">Nenhum treino ou patins registrado nesta semana.</Typography>}
      </Card>
    </Stack>
  )
}
