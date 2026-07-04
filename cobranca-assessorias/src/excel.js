'use strict';
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ─── Leitura das listas de referência ────────────────────────────────────────

function lerListasReferencia(caminhoExcel) {
  if (!fs.existsSync(caminhoExcel)) {
    throw new Error(`Arquivo de referências não encontrado: ${caminhoExcel}`);
  }

  const wb = XLSX.readFile(caminhoExcel, { cellDates: true });

  const acordosSLN = lerAcordosSLN(wb);
  const ajuizados = lerAjuizadosProtesto(wb);
  const escolasExcluir = lerEscolas(wb);
  const baseCongelada = lerBaseCongelada(wb);

  return { acordosSLN, ajuizados, escolasExcluir, baseCongelada };
}

function lerAcordosSLN(wb) {
  const aba = wb.Sheets['Acordos SLN'];
  if (!aba) throw new Error('Aba "Acordos SLN" não encontrada no Excel de referências.');
  const dados = XLSX.utils.sheet_to_json(aba, { defval: null });
  // Coluna: cpf_rf
  const cpfs = new Set();
  for (const linha of dados) {
    const cpf = normalizarCPF(linha['cpf_rf'] || linha['CPF_RF'] || linha['cpf do rf']);
    if (cpf) cpfs.add(cpf);
  }
  console.log(`  Acordos SLN: ${cpfs.size} CPFs carregados`);
  return cpfs;
}

function lerAjuizadosProtesto(wb) {
  // Tenta "AjuizadosProtesto" ou variações
  const nomeAba = wb.SheetNames.find((n) =>
    n.replace(/\s/g, '').toLowerCase().startsWith('ajuizados')
  );
  if (!nomeAba) throw new Error('Aba "AjuizadosProtesto" não encontrada no Excel de referências.');
  const aba = wb.Sheets[nomeAba];
  const dados = XLSX.utils.sheet_to_json(aba, { defval: null });
  // Coluna: CPF
  const cpfs = new Set();
  for (const linha of dados) {
    const cpf = normalizarCPF(linha['CPF'] || linha['cpf'] || linha['cpf_do_rf']);
    if (cpf) cpfs.add(cpf);
  }
  console.log(`  Ajuizados/Protesto: ${cpfs.size} CPFs carregados`);
  return cpfs;
}

function lerEscolas(wb) {
  const nomeAba = wb.SheetNames.find((n) =>
    n.toLowerCase().includes('escolas') && n.toLowerCase().includes('não')
  ) || wb.SheetNames.find((n) => n.toLowerCase().startsWith('escolas'));
  if (!nomeAba) throw new Error('Aba "Escolas que não devem..." não encontrada.');
  const aba = wb.Sheets[nomeAba];
  const dados = XLSX.utils.sheet_to_json(aba, { header: 1, defval: null });
  // Primeira coluna, pular cabeçalho
  const escolas = new Set();
  for (let i = 1; i < dados.length; i++) {
    const val = dados[i][0];
    if (val != null && String(val).trim() !== '') {
      escolas.add(String(val).trim().toLowerCase());
    }
  }
  console.log(`  Escolas excluídas: ${escolas.size} escolas carregadas`);
  return escolas;
}

function lerBaseCongelada(wb) {
  const aba = wb.Sheets['Base congelada'];
  if (!aba) {
    console.warn('  AVISO: Aba "Base congelada" não encontrada. Todos os CPFs serão tratados como novos.');
    return new Map();
  }
  const dados = XLSX.utils.sheet_to_json(aba, { defval: null });
  // Colunas: codigo_da_fatura, cpf_do_rf, Assessoria
  // Chave: cpf_do_rf → assessoria (usa o primeiro encontrado por CPF)
  const mapa = new Map();
  for (const linha of dados) {
    const cpf = normalizarCPF(linha['cpf_do_rf'] || linha['CPF_DO_RF']);
    const assessoria = linha['Assessoria'] || linha['assessoria'];
    if (cpf && assessoria && !mapa.has(cpf)) {
      mapa.set(cpf, String(assessoria).trim());
    }
  }
  console.log(`  Base congelada: ${mapa.size} CPFs únicos com assessoria`);
  return mapa;
}

// ─── Escrita dos arquivos de saída ───────────────────────────────────────────

function gerarArquivosAssessorias(
  linhasPorAssessoria,
  cabecalhos,
  colunasSaida,
  pastaSaida,
  dataSufixo
) {
  if (!fs.existsSync(pastaSaida)) fs.mkdirSync(pastaSaida, { recursive: true });

  const arquivosGerados = [];

  for (const [assessoria, linhas] of Object.entries(linhasPorAssessoria)) {
    const nomeArquivo = `Base_${assessoria}_${dataSufixo}.xlsx`;
    const caminhoCompleto = path.join(pastaSaida, nomeArquivo);

    const dadosPlanilha = [cabecalhos];
    for (const linha of linhas) {
      const rowValores = colunasSaida.map((col) => {
        const val = linha[col] ?? linha[col.toLowerCase()] ?? null;
        return val;
      });
      dadosPlanilha.push(rowValores);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(dadosPlanilha);
    XLSX.utils.book_append_sheet(wb, ws, assessoria);
    XLSX.writeFile(wb, caminhoCompleto);

    arquivosGerados.push({ assessoria, arquivo: caminhoCompleto, qtd: linhas.length });
  }

  return arquivosGerados;
}

// ─── Atualização da Base Congelada ───────────────────────────────────────────

function atualizarBaseCongelada(
  caminhoExcel,
  novasLinhasPorAssessoria
) {
  const wb = XLSX.readFile(caminhoExcel, { cellDates: true });

  let abaCongelada = wb.Sheets['Base congelada'];
  let dadosExistentes = [];

  if (abaCongelada) {
    dadosExistentes = XLSX.utils.sheet_to_json(abaCongelada, { defval: null });
  }

  // Conjunto de faturas já presentes
  const faturasExistentes = new Set(
    dadosExistentes.map((r) => String(r['codigo_da_fatura'] || ''))
  );

  const novasLinhas = [];
  for (const [assessoria, linhas] of Object.entries(novasLinhasPorAssessoria)) {
    for (const linha of linhas) {
      const codFatura = String(linha['codigo_da_fatura'] || linha['CODIGO_DA_FATURA'] || '');
      if (!faturasExistentes.has(codFatura)) {
        novasLinhas.push({
          codigo_da_fatura: linha['codigo_da_fatura'] ?? null,
          cpf_do_rf: linha['cpf_do_rf'] ?? null,
          Assessoria: assessoria,
        });
        faturasExistentes.add(codFatura);
      }
    }
  }

  if (novasLinhas.length === 0) {
    console.log('  Base congelada: nenhuma nova fatura para adicionar.');
    return;
  }

  const dadosAtualizados = [...dadosExistentes, ...novasLinhas];
  const wsAtualizada = XLSX.utils.json_to_sheet(dadosAtualizados, {
    header: ['codigo_da_fatura', 'cpf_do_rf', 'Assessoria'],
  });

  // Substitui a aba existente ou cria nova
  if (wb.SheetNames.includes('Base congelada')) {
    wb.Sheets['Base congelada'] = wsAtualizada;
  } else {
    XLSX.utils.book_append_sheet(wb, wsAtualizada, 'Base congelada');
  }

  XLSX.writeFile(wb, caminhoExcel);
  console.log(`  Base congelada atualizada: +${novasLinhas.length} faturas novas`);
}

// ─── Utilitários ─────────────────────────────────────────────────────────────

function normalizarCPF(valor) {
  if (valor == null) return null;
  // Remove formatação (pontos, traços, espaços) e mantém apenas dígitos
  const s = String(valor).replace(/\D/g, '').trim();
  return s.length > 0 ? s : null;
}

module.exports = {
  lerListasReferencia,
  gerarArquivosAssessorias,
  atualizarBaseCongelada,
  normalizarCPF,
};
