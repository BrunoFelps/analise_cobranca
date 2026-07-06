-- RFs atribuídos com telefone da escola
-- Substitui o join com intelligence_dev.contatos_rf.telefones_consolidado_ouro
-- pelo join com educ_one_prata.clientes.telefones (origem = 'Escola', padrao = 'Sim')

WITH telefones_escola AS (
  SELECT
    cpf,
    FIRST(numero) AS numero
  FROM educ_one_prata.clientes.telefones
  WHERE origem = 'Escola'
    AND padrao  = 'Sim'
  GROUP BY cpf
)

SELECT
  obt.cpf_do_rf,
  split(obt.nome_do_responsavel_financeiro, ' ')[0] AS primeiro_nome,
  obt.nome_do_responsavel_financeiro,
  t.numero,
  obt.valor_base_em_atraso,
  obt.valor_atualizado_em_atraso,
  obt.valor_encargos_em_atraso,
  obt.numero_de_faturas_em_atraso,
  obt.codigo_da_escola,
  obt.nome_da_escola,
  obt.ano_da_matricula

FROM educ_one_ouro.cobranca.obt_rfs_atribuidos obt
LEFT JOIN telefones_escola t ON t.cpf = obt.cpf_do_rf

WHERE obt.ano_da_matricula IN ('2025','2026')
  AND obt.codigo_da_escola NOT IN (
    'CE148','CO135','EDUKI','CODEL','ARTCR','AA583','AA577','ALGTD','AA555','AA111',
    'COVIT','EI796','IS670','COCGA','CLAUT','COLSB','CIESB','CSBCO','CAMVI','ESBAT',
    'CGPI2','CGPI3','CGPI1','CGPI4','COCKI','COCAR','COCBI','ES457','CSAB1','IN487',
    'FELIZ','CE423','MAISP','CO109','CE637','CEESD','AA184','EINST','AA934','AA250',
    'CEADM','CO812','AA591','AA158','CE730','C0076','ES148','CAPOG','AA238','CSAB2',
    'CABC3','CONHZ','NO442','CACAM','CAITP','AA808','AA501','MONCA','AA009','SV009',
    'SVJ10','CO825','ES437','B0015','CAITJ','CE104','AA359','ES352','CO953','CE113',
    'JHPIN','CO111','CO144','CO581','CEDPF','COCAT','B0916','CAURU','ES152','CE775',
    'ES626','AA270','EDIAS','AA731','CSCTR','CO455','REZEN','KADOS','CO799','CCPHA',
    'RUMVI','B0754','ACEED','CO433','ES732','COPCE','CE033','AA784','CR354','CEVOL',
    'AA110','CRESC','EL149','CO101','AA542','CE480','ED136','AA568','SIMGV','SIMDB',
    'GE142','CANBC','CO823','ES112','CMVER','CABC4','AA349','CO272','CESGO','CEESP',
    'AA165','AA231','CO685','AA060','CODAP','EPDCB','CE683','CABC2','CPSEI','OL122',
    'CLSER','CE125','AA862','CB464','ESNEI','CE390','AA005','CO759','B0995','CE852',
    'AA654','CPDSL','AA801','AA661','JA471','CI222','E1697','E1747','E1951','E1994',
    'E1987','AA458','IOBLC','CL919','B0933','CMMM','CDAMT','CDMT2','CE120','DE703',
    'CE484','CO907','AA249','AA405','COCDF','CEDIN','AA598','DI344','L4735','ED102',
    'AA275','AA220','C0286','B0832','B0971','B0639','COFCJ','EMCHR','CE100','B0650',
    'CDAMT'
  )

QUALIFY ROW_NUMBER() OVER (PARTITION BY obt.cpf_do_rf ORDER BY obt.data_atualizacao DESC) = 1

ORDER BY obt.valor_atualizado_em_atraso;
