'use strict';
const { normalizarCPF } = require('./excel');

/**
 * Distribui as linhas filtradas entre as 4 assessorias.
 *
 * Lógica:
 *  - CPFs já presentes na Base Congelada → mantêm a mesma assessoria
 *  - CPFs novos → distribuídos com algoritmo guloso (greedy) que
 *    equilibra simultaneamente a quantidade de CPFs únicos e o
 *    valor_atualizado total por assessoria
 *
 * @param {object[]} linhas           - Linhas filtradas (já sem excluídos)
 * @param {Map}      baseCongelada    - Map<cpf_normalizado, nome_assessoria>
 * @param {string[]} assessorias      - ['On7', 'Setra', 'AMAIS', 'Localcred']
 * @returns {{ linhasPorAssessoria, resumo, novasCpfAssessoria }}
 */
function distribuir(linhas, baseCongelada, assessorias) {
  // Normaliza CPFs nas linhas
  const linhasComCPF = linhas.map((l) => ({
    ...l,
    _cpf: normalizarCPF(l['cpf_do_rf']),
  }));

  // Agrupa linhas por CPF
  const porCpf = new Map();
  for (const linha of linhasComCPF) {
    const cpf = linha._cpf;
    if (!porCpf.has(cpf)) porCpf.set(cpf, []);
    porCpf.get(cpf).push(linha);
  }

  // Separa CPFs existentes vs. novos
  const cpfsExistentes = [];
  const cpfsNovos = [];

  for (const [cpf, rows] of porCpf) {
    if (cpf && baseCongelada.has(cpf)) {
      cpfsExistentes.push({ cpf, rows, assessoria: baseCongelada.get(cpf) });
    } else {
      const valorTotal = rows.reduce(
        (s, r) => s + (parseFloat(r['valor_atualizado'] || r['VALOR_ATUALIZADO']) || 0),
        0
      );
      cpfsNovos.push({ cpf, rows, valorTotal });
    }
  }

  // ─── Inicializa contadores por assessoria com os CPFs existentes ───────────
  const stats = {};
  for (const a of assessorias) {
    // Conta apenas os existentes que aparecem NA QUERY ATUAL
    const existentesDestaAssessoria = cpfsExistentes.filter(
      (e) => normalizeNomeAssessoria(e.assessoria) === normalizeNomeAssessoria(a)
    );
    stats[a] = {
      cpfCount: existentesDestaAssessoria.length,
      valorTotal: existentesDestaAssessoria.reduce(
        (s, e) => s + e.rows.reduce(
          (sv, r) => sv + (parseFloat(r['valor_atualizado'] || r['VALOR_ATUALIZADO']) || 0),
          0
        ),
        0
      ),
    };
  }

  // ─── Distribui CPFs novos (greedy equilibrado) ────────────────────────────
  // Ordena por valor decrescente para que valores altos sejam distribuídos
  // primeiro (reduz desequilíbrio acumulado).
  cpfsNovos.sort((a, b) => b.valorTotal - a.valorTotal);

  const totalNovos = cpfsNovos.length;
  const totalValorNovo = cpfsNovos.reduce((s, c) => s + c.valorTotal, 0);
  const targetCpfs = totalNovos / assessorias.length || 1;
  const targetValor = totalValorNovo / assessorias.length || 1;

  for (const cpfData of cpfsNovos) {
    let minCarga = Infinity;
    let escolhida = assessorias[0];

    for (const a of assessorias) {
      // Carga combinada: média das proporções de CPFs e valor
      const cargaCpf = stats[a].cpfCount / targetCpfs;
      const cargaValor = stats[a].valorTotal / targetValor;
      const carga = cargaCpf + cargaValor;
      if (carga < minCarga) {
        minCarga = carga;
        escolhida = a;
      }
    }

    cpfData.assessoria = escolhida;
    stats[escolhida].cpfCount += 1;
    stats[escolhida].valorTotal += cpfData.valorTotal;
  }

  // ─── Monta resultado por assessoria ──────────────────────────────────────
  const linhasPorAssessoria = {};
  for (const a of assessorias) linhasPorAssessoria[a] = [];

  for (const cpfData of cpfsExistentes) {
    const a = normalizeNomeAssessoria(cpfData.assessoria);
    const assessoriaReal = assessorias.find(
      (x) => normalizeNomeAssessoria(x) === a
    ) || cpfData.assessoria;
    if (!linhasPorAssessoria[assessoriaReal]) linhasPorAssessoria[assessoriaReal] = [];
    linhasPorAssessoria[assessoriaReal].push(...cpfData.rows);
  }

  for (const cpfData of cpfsNovos) {
    linhasPorAssessoria[cpfData.assessoria].push(...cpfData.rows);
  }

  // Remove _cpf (campo interno) das linhas de saída
  for (const a of assessorias) {
    linhasPorAssessoria[a] = linhasPorAssessoria[a].map(({ _cpf, ...rest }) => rest);
  }

  // ─── Resumo ──────────────────────────────────────────────────────────────
  const resumo = assessorias.map((a) => ({
    assessoria: a,
    cpfs_unicos: stats[a].cpfCount,
    faturas: linhasPorAssessoria[a].length,
    valor_atualizado: stats[a].valorTotal,
  }));

  // Mapa de CPFs novos → assessoria (para atualizar Base Congelada)
  const novasCpfAssessoria = new Map();
  for (const c of cpfsNovos) {
    novasCpfAssessoria.set(c.cpf, c.assessoria);
  }

  return {
    linhasPorAssessoria,
    resumo,
    novasCpfAssessoria,
    totalExistentes: cpfsExistentes.length,
    totalNovos: cpfsNovos.length,
  };
}

function normalizeNomeAssessoria(nome) {
  return String(nome || '').trim().toLowerCase();
}

module.exports = { distribuir };
