WITH DadosComPrioridade AS (
    SELECT
        ach.cpf_rf,
        p.Data_de_Pagamento,
        a.Data_de_Vencimento,
        p.Valor_Pago,
        ach.numero_parcelas,
        ach.tipo_acordo,
        a.Status,
        ach.codigo_da_escola,
        ach.ano_matricula,
        ach.maior_atraso_fatura,
        ach.status_novo,
        ach.atraso_fatura_range,
        a.Id_do_Usuario_de_Criacao,
        CASE
            WHEN a.Id_do_Usuario_de_Criacao IN (
                '8d2e087a-9e7f-4bd4-bb62-fd6bc6fee49e', 
                'c1743508-819a-499e-bdfd-687bb38650d2',
                'b8924e08-f507-41c5-b485-cdc95180f076', 
                'af54a851-ea67-4fe2-8438-079d2fb24b40',
                '9483e9b9-672a-4079-87f7-6cbbd9003b09'
            ) THEN 'Educbank'
            WHEN a.Id_do_Usuario_de_Criacao IN (
                '1b61ece1-1f16-4455-bb62-a858d681d11e', 
                'b819a0df-e55b-4a20-951e-39ca5922ac5b',
                'cd70edcf-3a4e-486c-9c50-7c0b1af22a94', 
                '19f94129-dcb1-41c8-be1c-d8fb24eb126b'
            ) THEN 'On7'
            WHEN a.Id_do_Usuario_de_Criacao IN (
                'f1ab8af5-ae47-4772-8cf0-733d239b2a49', 
                'ca5d9c31-0134-4a28-891d-ec648253a096'
            ) THEN 'Innovare'
        END AS criador,
                
           ROW_NUMBER() OVER (
            PARTITION BY
                ach.cpf_rf,
                p.Data_de_Pagamento,
                a.Data_de_Vencimento,
                p.Valor_Pago
            ORDER BY
                CASE WHEN a.Status = 'Pago' THEN 1 ELSE 2 END
        ) AS rn 
        
    FROM
        intelligence_dev.business_analytics.acordos_consolidado_historico AS ach
    LEFT JOIN
        dw.tabelas_plataforma.acordos AS a ON a.Codigo = ach.codigo_acordo
    INNER JOIN
        dw.tabelas_plataforma.pagamentos AS p ON ach.id_acordo = p.Id_Externo
    WHERE
        a.Id_do_Usuario_de_Criacao IN (
            '8d2e087a-9e7f-4bd4-bb62-fd6bc6fee49e', 
            'c1743508-819a-499e-bdfd-687bb38650d2',
            'b8924e08-f507-41c5-b485-cdc95180f076', 
            'af54a851-ea67-4fe2-8438-079d2fb24b40',
            '9483e9b9-672a-4079-87f7-6cbbd9003b09', 
            '1b61ece1-1f16-4455-bb62-a858d681d11e',
            'b819a0df-e55b-4a20-951e-39ca5922ac5b', 
            'cd70edcf-3a4e-486c-9c50-7c0b1af22a94',
            '19f94129-dcb1-41c8-be1c-d8fb24eb126b', 
            'f1ab8af5-ae47-4772-8cf0-733d239b2a49',
            'ca5d9c31-0134-4a28-891d-ec648253a096'
        )
)
SELECT
    cpf_rf,
    Data_de_Pagamento,
    Data_de_Vencimento,
    Valor_Pago,
    numero_parcelas,
    tipo_acordo,
    Status,
    codigo_da_escola,
    ano_matricula,
    maior_atraso_fatura,
    status_novo,
    atraso_fatura_range,
    Id_do_Usuario_de_Criacao,
    criador
FROM
    DadosComPrioridade
WHERE
    rn = 1
and Data_de_Pagamento >= '2025-01-01';
