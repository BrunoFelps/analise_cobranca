-- Databricks notebook source
-- MAGIC %md
-- MAGIC ## Análise de pagamentos das Assessorias de Cobrança Amigaveis
-- MAGIC
-- MAGIC Aqui temos as informações de data de pagamento, data que o acordo foi criado, metodo de pagamento e valor pago.

-- COMMAND ----------

with acordos_base as (
  select
    _id,
    Codigo,
    CPF_do_RF,
    Valor_Acordado,
    Total_Pago,
    cast(Data_de_Criacao as date) as Data_de_Criacao,
    date_format(Data_de_Criacao, 'MM/yyyy') as mes_ano_criacao,
    Data_de_Expiracao,
    Numero_de_Parcelas,
    Status,
    Id_do_Usuario_de_Criacao,
    case 
      when Numero_de_Parcelas = 1 then 'A Vista'
      when Numero_de_Parcelas > 1 then 'Parcelado'
    end as tipo_acordo,   
    case
      when Id_do_Usuario_de_Criacao in (
        '1b61ece1-1f16-4455-bb62-a858d681d11e',
        'b819a0df-e55b-4a20-951e-39ca5922ac5b',
        'cd70edcf-3a4e-486c-9c50-7c0b1af22a94',
        '19f94129-dcb1-41c8-be1c-d8fb24eb126b'
      ) then 'On7'
      when Id_do_Usuario_de_Criacao in (
        'f1ab8af5-ae47-4772-8cf0-733d239b2a49',
        'ca5d9c31-0134-4a28-891d-ec648253a096'
      ) then 'Innovare'
      else 'Outros'
    end as assessoria
  from dw.tabelas_plataforma.acordos
)

select 
  a.assessoria,
  a.Codigo,
  a.CPF_do_RF,
  a.tipo_acordo,     
  a.Data_de_Criacao,
  cast(p.Data_de_Pagamento as date) as Data_de_Pagamento,
  p.Valor_Pago
from acordos_base a
join dw.tabelas_plataforma.pagamentos p 
  on a._id = p.Id_Externo
where a.assessoria in ('On7', 'Innovare')
  and a.Data_de_Criacao >= '2025-01-01'
order by p.Data_de_Pagamento

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## Aqui podemos acompanhar a efetividade das Assessorias de 
-- MAGIC ## Cobrança Amigavel
-- MAGIC
-- MAGIC Consideramos a efetuvadade o total de acordos gerados x o total de acordos pagos,

-- COMMAND ----------

SELECT
    DATE_TRUNC('MONTH', a.Data_de_Criacao) AS `Acordo gerado em`,
    
    CASE 
        WHEN a.Id_do_Usuario_de_Criacao IN ('1b61ece1-1f16-4455-bb62-a858d681d11e', 'b819a0df-e55b-4a20-951e-39ca5922ac5b', 'cd70edcf-3a4e-486c-9c50-7c0b1af22a94', '19f94129-dcb1-41c8-be1c-d8fb24eb126b') THEN 'On7'
        WHEN a.Id_do_Usuario_de_Criacao IN ('f1ab8af5-ae47-4772-8cf0-733d239b2a49', 'ca5d9c31-0134-4a28-891d-ec648253a096') THEN 'Innovare'
        END AS Assessoria,

    SUM(a.Total_Pago) AS `Total Pago`,
    SUM(a.Valor_Acordado) AS `Valor Acordado`,
ROUND((SUM(a.Total_Pago) / NULLIF(SUM(a.Valor_Acordado), 0)) * 100, 2) AS `Efetividade (%)`
FROM dw.tabelas_plataforma.acordos a

WHERE a.Data_de_Criacao >= '2025-01-01'
  AND a.Criado_Por = 'Educbank'
  AND a.Id_do_Usuario_de_Criacao IN (
      -- ON7
      '1b61ece1-1f16-4455-bb62-a858d681d11e',
      'b819a0df-e55b-4a20-951e-39ca5922ac5b',
      'cd70edcf-3a4e-486c-9c50-7c0b1af22a94',
      '19f94129-dcb1-41c8-be1c-d8fb24eb126b',
      -- INNOVARE
      'f1ab8af5-ae47-4772-8cf0-733d239b2a49',
      'ca5d9c31-0134-4a28-891d-ec648253a096'
  )


GROUP BY DATE_TRUNC('MONTH', a.Data_de_Criacao), Assessoria
ORDER BY `Acordo gerado em`, Assessoria;
