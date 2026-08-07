'use strict';
require('dotenv').config();

// ─────────────────────────────────────────────────────────────────────────────
// COLE AQUI A SUA QUERY DO DATABRICKS
// A query deve retornar exatamente as colunas listadas em COLUNAS_SAIDA abaixo
// (nomes idênticos, sem distinção de maiúscula/minúscula).
// ─────────────────────────────────────────────────────────────────────────────
const SQL_QUERY = `
  -- SUBSTITUA PELO SEU SQL COMPLETO
  SELECT
    codigo_da_fatura,
    cpf_do_rf,
    nome_do_rf,
    telefone_do_rf,
    email_do_rf,
    codigo_da_escola,
    codigo_da_matricula,
    id_da_matricula,
    ano_da_matricula,
    data_de_emissao_original_educbank,
    nome_do_item_da_fatura,
    nome_do_aluno,
    status_da_fatura,
    data_de_vencimento_efetiva,
    rua_do_rf,
    numero_do_rf,
    complemento_do_rf,
    bairro_do_rf,
    cep_do_rf,
    cidade_do_rf,
    estado_do_rf,
    pais_do_rf,
    valor,
    encargos_por_itens,
    valor_atualizado,
    codigo_da_matricula_sufixo,
    id_da_matricula_sufixo,
    grupo_desconto
  FROM seu_schema.sua_tabela
  WHERE status_da_fatura = 'ativo'
`;

// Colunas de saída (A → AB) nos arquivos das assessorias
const COLUNAS_SAIDA = [
  'codigo_da_fatura',
  'cpf_do_rf',
  'nome_do_rf',
  'telefone_do_rf',
  'email_do_rf',
  'codigo_da_escola',
  'codigo_da_matricula',
  'id_da_matricula',
  'ano_da_matricula',
  'data_de_emissao_original_educbank',
  'nome_do_item_da_fatura',
  'nome_do_aluno',
  'status_da_fatura',
  'data_de_vencimento_efetiva',
  'rua_do_rf',
  'numero_do_rf',
  'complemento_do_rf',
  'bairro_do_rf',
  'cep_do_rf',
  'cidade_do_rf',
  'estado_do_rf',
  'pais_do_rf',
  'valor',
  'encargos_por_itens',
  'valor_atualizado',
  'codigo_da_matricula_sufixo',
  'id_da_matricula_sufixo',
  'Grupo Desconto',
];

// Cabeçalhos legíveis para exibição (mesma ordem das COLUNAS_SAIDA)
const CABECALHOS_SAIDA = [
  'codigo_da_fatura',
  'cpf_do_rf',
  'nome_do_rf',
  'telefone_do_rf',
  'email_do_rf',
  'codigo_da_escola',
  'codigo_da_matricula',
  'id_da_matricula',
  'ano_da_matricula',
  'data_de_emissao_original_educbank',
  'nome_do_item_da_fatura',
  'nome_do_aluno',
  'status_da_fatura',
  'data_de_vencimento_efetiva',
  'rua_do_rf',
  'numero_do_rf',
  'complemento_do_rf',
  'bairro_do_rf',
  'cep_do_rf',
  'cidade_do_rf',
  'estado_do_rf',
  'pais_do_rf',
  'valor',
  'encargos_por_itens',
  'valor_atualizado',
  'codigo_da_matricula_sufixo',
  'id_da_matricula_sufixo',
  'Grupo Desconto',
];

const ASSESSORIAS = ['On7', 'Setra', 'AMAIS', 'Localcred'];

module.exports = {
  databricks: {
    host: process.env.DATABRICKS_HOST,
    httpPath: process.env.DATABRICKS_HTTP_PATH,
    token: process.env.DATABRICKS_TOKEN,
  },
  caminhos: {
    excelReferencias: process.env.EXCEL_REFERENCIAS ||
      'C:\\Users\\bruno.santos\\Downloads\\Base para Assessorias.xlsx',
    pastaSaida: process.env.PASTA_SAIDA || './output',
  },
  sql: SQL_QUERY,
  colunasSaida: COLUNAS_SAIDA,
  cabecalhosSaida: CABECALHOS_SAIDA,
  assessorias: ASSESSORIAS,
};
