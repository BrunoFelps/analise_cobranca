select 
  fr.Id_da_escola,
  e.Nome as nome_escola,
  fr.status,
  fr.data_de_vencimento_base_efetiva,
  fr.valor_base,
  fr.valor_pago,
  fr.data_de_pagamento,
  fr.motivo_de_liquidacao as motivo_da_retencao,
  fr.data_de_liquidacao as data_de_retencao
from dw.tabelas_plataforma.faturasrepasse fr
left join dw.tabelas_plataforma.escolas e
  on fr.Id_da_escola = e._id
where Nome in (
  'EDUCARPE - COLEGIO CARPE DIEM MACEIO',
  'EDUCARPE - ESCOLA CASA DO SOL',
  'EDUCARPE - COLEGIO CARPE DIEM CACULE',
  'EDUCARPE - COLEGIO CARPE DIEM FEIRA DE SANTANA',
  'EDUCARPE - COLEGIO CARPE DIEM DIAS DAVILA',
  'EDUCARPE - COLEGIO CARPE DIEM ONDINA'
  'EDUCARPE - CENTRO EDUCACIONAL CARPE DIEM KIDS',
  'EDUCARPE - CENTRO EDUCACIONAL CARPE DIEM MONTE GORDO',
  'EDUCARPE - CENTRO EDUCACIONAL CARPE DIEM MANGABAS',
  'EDUCARPE - COLEGIO CARPE DIEM CAMACARI',
  'EDUCARPE - COLEGIO CARPE DIEM VILAS',
  'EDUCARPE - COLEGIO CARPE DIEM ITABERA'
)
