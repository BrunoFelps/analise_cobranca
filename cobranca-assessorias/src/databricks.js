'use strict';
const { DBSQLClient } = require('@databricks/sql');

async function executarQuery(host, httpPath, token, sql) {
  const client = new DBSQLClient();

  const conexao = await client.connect({ host, path: httpPath, token });
  const sessao = await conexao.openSession();

  console.log('  Executando query no Databricks...');
  const operacao = await sessao.executeStatement(sql, {
    runAsync: true,
    queryTimeout: 0,
  });

  const schema = await operacao.getSchema();
  const colunas = schema.columns.map((c) => c.columnName.toLowerCase());

  const linhas = [];
  while (true) {
    const chunk = await operacao.fetchChunk();
    if (!chunk || chunk.length === 0) break;
    for (const linha of chunk) {
      const obj = {};
      colunas.forEach((col, i) => { obj[col] = linha[i] ?? null; });
      linhas.push(obj);
    }
  }

  await operacao.close();
  await sessao.close();
  await conexao.close();

  return linhas;
}

module.exports = { executarQuery };
