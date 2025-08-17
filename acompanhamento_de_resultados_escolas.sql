SELECT
  f.id AS _id,
  f.codigo AS Codigo_da_Fatura,
  f.Nome_da_Rede AS Nome_da_Rede,
  date_format(f.Data_de_Vencimento, 'dd/MM/yyyy') AS Data_de_Vencimento,
  date_format(f.Data_de_Pagamento, 'dd/MM/yyyy') AS Data_de_Pagamento,
  f.Valor_Pago AS Valor_Pago,
  f.Valor_Base AS Valor_Base,
  f.CPF_do_RF AS CPF_do_RF,
  f.id_escola AS Codigo_da_Escola,
  f.Nome_da_Escola AS Nome_da_Escola,
  f.Status AS Status,
  date_format(f.`data_do_recebimento_competencia`, 'dd/MM/yyyy') AS `Data do Recebimento Competência`,
  f.Vencido,
  date_format(f.Data_de_Vencimento_Efetiva, 'dd/MM/yyyy'),
  f.Sub_Total,
  (f.Sub_Total - f.Valor_Base) AS Total_de_desconto,

  CASE
    WHEN f.Data_de_Pagamento IS NULL THEN 'Pagamento_Pendente'
    WHEN f.Data_de_Pagamento < f.Data_de_Pagamento THEN 'Pago_Adiantado'
    WHEN f.Data_de_Pagamento = f.Data_de_Pagamento THEN 'Pago_em_Dia'
    WHEN f.Data_de_Pagamento > f.Data_de_Pagamento THEN 'Pago_em_Atraso'
    ELSE 'Indefinido'
  END AS Status_do_pagamento,

  CASE month(f.Data_de_Vencimento)
    WHEN 1 THEN 'Janeiro'
    WHEN 2 THEN 'Fevereiro'
    WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril'
    WHEN 5 THEN 'Maio'
    WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro'
    WHEN 11 THEN 'Novembro'
    WHEN 12 THEN 'Dezembro'
  END AS `Aux_Mês`,

  CASE
    WHEN f.Data_de_Pagamento > f.Data_de_Vencimento
         AND f.Valor_Pago < f.Sub_Total
    THEN 'Desconto_com_atraso'

    WHEN f.Data_de_Pagamento > f.Data_de_Vencimento
         AND f.Valor_Pago >= f.Sub_Total
    THEN 'Atraso_sem_desconto'

    ELSE NULL
  END AS Desconto_concedido
FROM
  dw.relatorios.faturas f
WHERE
  f.codigo_da_Escola IN (
    'B0782', 'B0518', 'B0470', 'B0459', 'CO475', 'CO151', 'CO474', 'B0883', 'B0426', 'AA439',
    'AA235', 'CO158', 'CO699', 'COPSG', 'C0165', 'C0124', 'C0123', 'C0096', 'C0091', 'C0014',
    'B0863', 'B0864', 'B0803', 'B0739', 'B0542', 'B0424', 'B0261', 'B0095', 'AA700', 'AA543',
    'AA460', 'AA312', 'AA129', 'AA119', 'CO190', 'CO133', 'ES108', 'CO910', 'COFK1', 'COFCJ',
    'COFK2', 'CO814', 'CO731', '6HKY2', 'CO403', 'INTER', 'COFT9', 'ES121', 'EMCHR', 'BB999',
    'CO308', 'CO700','CO811'
  )
  AND year(f.Data_de_Vencimento) = 2025
  AND f.Data_de_Vencimento <= current_date()
ORDER BY
  f.cpf_do_rf DESC;
