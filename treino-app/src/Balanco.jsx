import React, { useState } from 'react'
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { consumo, gastoBase, kcalPatins, kcalTreino, pesoEm } from './gasto.js'
import { PERFIL_PADRAO, hojeISO, num, semana } from './store.js'

const fmt = (n) => Math.round(n).toLocaleString('pt-BR')

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

export default function Balanco({ s, update }) {
  const hoje = hojeISO()
  const [editando, setEditando] = useState(false)
  const card = (conteudo) => <Paper sx={{ p: 2, border: 1, borderColor: 'divider' }}>{conteudo}</Paper>

  const perfil = s.perfil || PERFIL_PADRAO
  if (editando) return card(<Perfil perfil={perfil} onSalvar={(p) => { update((n) => { n.perfil = p }); setEditando(false) }} />)

  // Só entram os dias com as três refeições marcadas: refeição não marcada contaria como zero.
  const dias = semana().filter((d) => d.date <= hoje).map((d) => {
    const kg = pesoEm(s, d.date), c = consumo(s, d.date), pat = s.patins.find((p) => p.date === d.date)
    return { ...d, c, base: gastoBase(kg, perfil), treino: kcalTreino(s, d.date, kg), patins: pat ? kcalPatins(pat.min, kg) : 0 }
  })
  const cont = dias.filter((d) => d.c.completa)
  const soma = (f) => cont.reduce((t, d) => t + f(d), 0)
  const comido = soma((d) => d.c.kcal), base = soma((d) => d.base), treino = soma((d) => d.treino), patins = soma((d) => d.patins)
  const deficit = base + treino + patins - comido
  const ritmo = cont.length ? ((deficit / cont.length) * 7) / 7700 : 0
  const semExercicio = cont.length ? (((base - comido) / cont.length) * 7) / 7700 : 0

  const Linha = ({ rotulo, valor, forte }) => (
    <Stack direction="row" sx={{ justifyContent: 'space-between', py: 0.5 }}>
      <Typography color={forte ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: forte ? 600 : 400 }}>{rotulo}</Typography>
      <Typography sx={{ fontWeight: forte ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>{valor}</Typography>
    </Stack>
  )

  return card(
    <>
      {cont.length === 0 ? (
        <Typography color="text.secondary">Marque as três refeições de um dia na aba Dieta para o balanço aparecer.</Typography>
      ) : (
        <>
          <Linha rotulo="Gasto do corpo" valor={`${fmt(base)} kcal`} />
          <Linha rotulo="Treinos" valor={`+ ${fmt(treino)} kcal`} />
          <Linha rotulo="Patins" valor={`+ ${fmt(patins)} kcal`} />
          <Linha rotulo="Comido" valor={`− ${fmt(comido)} kcal`} />
          <Divider sx={{ my: 1 }} />
          <Linha forte rotulo={deficit >= 0 ? 'Déficit' : 'Excesso'} valor={`${fmt(Math.abs(deficit))} kcal`} />
          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography variant="body2" color="text.secondary">Nesse ritmo, por semana</Typography>
            <Typography variant="h6" component="div" color={ritmo > 0 ? 'success.main' : 'warning.main'}>
              {ritmo > 0 ? `− ${num(ritmo.toFixed(1))} kg` : `+ ${num(Math.abs(ritmo).toFixed(1))} kg`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sem treino e patins seria {semExercicio > 0 ? `− ${num(semExercicio.toFixed(1))}` : `+ ${num(Math.abs(semExercicio).toFixed(1))}`} kg.
            </Typography>
          </Box>
        </>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Conta {cont.length} de {dias.length} {dias.length === 1 ? 'dia' : 'dias'} da semana: só os que têm as três refeições marcadas. Valores estimados.
      </Typography>
      <Button size="small" sx={{ mt: 0.5, ml: -0.5 }} onClick={() => setEditando(true)}>Alterar altura e idade</Button>
    </>,
  )
}
