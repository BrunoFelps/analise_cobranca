'use strict';
const path = require('path');
const config = require('../config');
const { executarQuery } = require('./databricks');
const { lerListasReferencia, gerarArquivosAssessorias, atualizarBaseCongelada } = require('./excel');
const { filtrarLinhas } = require('./filter');
const { distribuir } = require('./distribute');

// ─── Utilitário: data no formato DDMMAAAA ────────────────────────────────────
function dataSufixo() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const aaaa = d.getFullYear();
  return `${dd}${mm}${aaaa}`;
}

// ─── Utilitário: imprime tabela de resumo ─────────────────────────────────────
function imprimirResumo(resumo, totalExcluidos) {
  const linha = '─'.repeat(68);
  console.log('\n' + linha);
  console.log('RESUMO DA DISTRIBUIÇÃO');
  console.log(linha);
  console.log(
    padR('Assessoria', 12) +
    padL('CPFs únicos', 14) +
    padL('Faturas', 10) +
    padL('Valor Atualizado', 20)
  );
  console.log(linha);
  let totalCpfs = 0, totalFaturas = 0, totalValor = 0;
  for (const r of resumo) {
    console.log(
      padR(r.assessoria, 12) +
      padL(r.cpfs_unicos.toLocaleString('pt-BR'), 14) +
      padL(r.faturas.toLocaleString('pt-BR'), 10) +
      padL('R$ ' + r.valor_atualizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 20)
    );
    totalCpfs += r.cpfs_unicos;
    totalFaturas += r.faturas;
    totalValor += r.valor_atualizado;
  }
  console.log(linha);
  console.log(
    padR('TOTAL', 12) +
    padL(totalCpfs.toLocaleString('pt-BR'), 14) +
    padL(totalFaturas.toLocaleString('pt-BR'), 10) +
    padL('R$ ' + totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }), 20)
  );
  console.log(linha);
  console.log(`\nFaturas excluídas do envio:`);
  console.log(`  Por Acordo SLN         : ${totalExcluidos.acordo_sln}`);
  console.log(`  Por Ajuizado/Protesto  : ${totalExcluidos.ajuizado}`);
  console.log(`  Por Escola excluída    : ${totalExcluidos.escola}`);
  console.log(linha + '\n');
}

function padR(s, n) { return String(s).padEnd(n); }
function padL(s, n) { return String(s).padStart(n); }

// ─── Fluxo principal ─────────────────────────────────────────────────────────
async function main() {
  console.log('════════════════════════════════════════════════════');
  console.log('  GERADOR DE BASES PARA ASSESSORIAS');
  console.log('════════════════════════════════════════════════════\n');

  // 1. Valida configuração
  const { host, httpPath, token } = config.databricks;
  if (!host || !httpPath || !token) {
    console.error('ERRO: Credenciais do Databricks não configuradas.');
    console.error('  Copie .env.example para .env e preencha DATABRICKS_HOST,');
    console.error('  DATABRICKS_HTTP_PATH e DATABRICKS_TOKEN.\n');
    process.exit(1);
  }

  // 2. Lê listas de referência do Excel
  console.log('1/5  Lendo listas de referência...');
  console.log(`     Arquivo: ${config.caminhos.excelReferencias}`);
  const { acordosSLN, ajuizados, escolasExcluir, baseCongelada } =
    lerListasReferencia(config.caminhos.excelReferencias);

  // 3. Busca dados do Databricks
  console.log('\n2/5  Conectando ao Databricks...');
  const linhas = await executarQuery(host, httpPath, token, config.sql);
  console.log(`     ${linhas.length.toLocaleString('pt-BR')} faturas recebidas da query`);

  // 4. Filtra registros excluídos
  console.log('\n3/5  Aplicando filtros de exclusão...');
  const { linhas: linhasFiltradas, contadores } = filtrarLinhas(
    linhas, acordosSLN, ajuizados, escolasExcluir
  );
  console.log(`     Mantidos para envio : ${linhasFiltradas.length.toLocaleString('pt-BR')} faturas`);
  console.log(`     Excluídos (total)   : ${(linhas.length - linhasFiltradas.length).toLocaleString('pt-BR')} faturas`);

  // 5. Distribui entre assessorias
  console.log('\n4/5  Distribuindo CPFs entre assessorias...');
  const { linhasPorAssessoria, resumo, novasCpfAssessoria, totalExistentes, totalNovos } =
    distribuir(linhasFiltradas, baseCongelada, config.assessorias);
  console.log(`     CPFs já atribuídos (Base Congelada) : ${totalExistentes.toLocaleString('pt-BR')}`);
  console.log(`     CPFs novos distribuídos             : ${totalNovos.toLocaleString('pt-BR')}`);

  // 6. Gera arquivos Excel por assessoria
  console.log('\n5/5  Gerando arquivos de saída...');
  const sufixo = dataSufixo();
  const arquivos = gerarArquivosAssessorias(
    linhasPorAssessoria,
    config.cabecalhosSaida,
    config.colunasSaida,
    config.caminhos.pastaSaida,
    sufixo
  );
  for (const arq of arquivos) {
    console.log(`     ✓ ${path.basename(arq.arquivo)}  (${arq.qtd.toLocaleString('pt-BR')} faturas)`);
  }

  // 7. Atualiza Base Congelada no Excel de referências
  // Filtra apenas as linhas dos CPFs novos para adicionar à Base Congelada
  const linhasNovasPorAssessoria = {};
  for (const [assessoria, linhasAss] of Object.entries(linhasPorAssessoria)) {
    linhasNovasPorAssessoria[assessoria] = linhasAss.filter((l) => {
      const cpf = String(l['cpf_do_rf'] || '').replace(/\D/g, '');
      return novasCpfAssessoria.has(cpf);
    });
  }
  atualizarBaseCongelada(config.caminhos.excelReferencias, linhasNovasPorAssessoria);

  // 8. Imprime resumo final
  imprimirResumo(resumo, {
    acordo_sln: contadores.excluidos_acordo_sln,
    ajuizado: contadores.excluidos_ajuizado,
    escola: contadores.excluidos_escola,
  });

  console.log(`Arquivos salvos em: ${path.resolve(config.caminhos.pastaSaida)}`);
  console.log('Processo concluído com sucesso!\n');
}

main().catch((err) => {
  console.error('\nERRO FATAL:', err.message || err);
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
