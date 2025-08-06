SELECT
  CAST(n.data_de_envio AS DATE) AS data,
  TO_CHAR(CAST(n.data_de_envio AS DATE), 'MM-yyyy') AS mes_de_envio,
  COUNT(DISTINCT n.cpf_do_destinatario) AS enviados,
  COUNT(DISTINCT CASE WHEN n.data_de_entrega IS NOT NULL THEN n.cpf_do_destinatario END) AS entregues,
  COUNT(DISTINCT CASE WHEN n.data_de_leitura IS NOT NULL THEN n.cpf_do_destinatario END) AS lidos,
  COUNT(DISTINCT CASE WHEN n.data_de_falha IS NOT NULL THEN n.cpf_do_destinatario END) AS falhas
FROM dw.tabelas_plataforma.notificacoes n
WHERE n.cpf_do_destinatario IS NOT NULL
  AND n.data_de_envio >= DATE('2025-01-01')
GROUP BY CAST(n.data_de_envio AS DATE), TO_CHAR(CAST(n.data_de_envio AS DATE), 'MM-yyyy')
ORDER BY data;
