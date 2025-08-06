USE CATALOG `hive_metastore`;
USE SCHEMA `default`;

WITH notificacoes_deduplicadas AS (
  SELECT *,
         get_json_object(ClientExtraData, '$.InvoiceCode') AS codigo_fatura,
         date_trunc('month', data_de_envio) AS mes_envio
  FROM dw.tabelas_plataforma.notificacoes
  WHERE Categoria = 'Cobrança de faturas atrasadas'
    AND data_de_envio >= DATE '2025-01-01'
),


faturas AS (
  SELECT f.id AS id_fatura, f.codigo AS codigo_fatura, f.data_de_vencimento
  FROM dw.relatorios.faturas f
  INNER JOIN (
    SELECT DISTINCT codigo_fatura FROM notificacoes_deduplicadas
  ) nf ON f.codigo = nf.codigo_fatura
),



acordos AS (
  SELECT
    id_acordo,
    codigo_acordo,
    data_de_criacao,
    cpf,
    id_da_fatura,
    codigo_fatura
  FROM (
    SELECT 
      a.id               AS id_acordo,
      a.data_de_criacao AS data_de_criacao,
      a.codigo           AS codigo_acordo,
      a.cpf_do_rf        AS cpf,
      af.id_da_fatura,
      f.codigo_fatura,
      ROW_NUMBER() OVER (
        PARTITION BY a.id 
        ORDER BY f.data_de_vencimento ASC
      ) AS rn
    FROM dw.relatorios.acordosfaturas af
    INNER JOIN faturas f 
      ON af.id_da_fatura = f.id_fatura
    Inner JOIN dw.relatorios.acordos a 
      ON a.id = af.id_do_acordo
  ) t
  WHERE rn = 1  
),



notificacoes_acordos AS (
  SELECT 
    n.cpf_do_destinatario AS cpf,
    n.Canal AS canal,
    date_format(n.mes_envio,'yyyy-MMMM') AS mes,
    COUNT(*) AS total,
    SUM(CASE WHEN n.Enviado = 'Sim' THEN 1 ELSE 0 END) AS enviados,
    SUM(CASE WHEN n.Entregue = 'Sim' THEN 1 ELSE 0 END) AS entregues,
    SUM(CASE WHEN n.Lido = 'Sim' THEN 1 ELSE 0 END) AS lidos,
    SUM(CASE WHEN n.Falhou = 'Sim' THEN 1 ELSE 0 END) AS falhas,
    COALESCE(count(distinct a.id_acordo), 0) AS total_acordos
  FROM notificacoes_deduplicadas n
  LEFT JOIN acordos a ON n.cpf_do_destinatario = a.cpf 
  and n.codigo_fatura = a.codigo_fatura 
  AND n.data_de_envio BETWEEN a.data_de_criacao AND DATE_ADD(a.data_de_criacao, 7)
  GROUP BY 1, 2, 3
)
select * from notificacoes_acordos
