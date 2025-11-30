WITH base_negativacao AS (
    SELECT 
        ne.id_do_responsavel_financeiro,
        r._id,
        r.Nome AS Escola,
        ne.status,
        ne.data_do_evento,
        DATE_FORMAT(CAST(ne.data_do_evento AS DATE), 'MM/yyyy') AS mes_ano_negativacao,
        rf.Nome_do_RF,
        rf.CPF_do_RF
    FROM dw.tabelas_plataforma.redes r
    INNER JOIN dw.tabelas_plataforma.negativacaoeventos ne
        ON r._id = ne.id_da_rede
    INNER JOIN dw.tabelas_plataforma.responsaveisfinanceiros rf
        ON ne.id_do_responsavel_financeiro = rf._id
),
-- Seleciona somente o status mais recente por CPF
ultima_negativacao AS (
    SELECT *
    FROM (
        SELECT 
            bn.*,
            ROW_NUMBER() OVER (
                PARTITION BY CPF_do_RF 
                ORDER BY data_do_evento DESC
            ) AS rn
        FROM base_negativacao bn
    ) u
    WHERE rn = 1
)
SELECT 
    u.id_do_responsavel_financeiro,
    u._id,
    u.Escola,
    u.status,
    u.data_do_evento,
    u.mes_ano_negativacao,
    u.Nome_do_RF,
    u.CPF_do_RF,
    CASE WHEN status = 'Negativado' THEN 1 ELSE 0 END AS Negativado,
    CASE WHEN status = 'Apto para negativação' THEN 1 ELSE 0 END AS `Apto para negativação`,
    CASE WHEN status = 'Não apto para negativação' THEN 1 ELSE 0 END AS `Não apto para negativação`,
    CASE WHEN status = 'Negativação solicitada' THEN 1 ELSE 0 END AS `Negativação solicitada`,
    CASE WHEN status = 'Desnegativado' THEN 1 ELSE 0 END AS Desnegativado,
    CASE WHEN status NOT IN (
        'Negativado',
        'Apto para negativação',
        'Não apto para negativação',
        'Negativação solicitada',
        'Desnegativado'
    ) THEN 1 ELSE 0 END AS `Outros Status`
FROM ultima_negativacao u;
