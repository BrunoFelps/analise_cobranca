'use strict';
const { normalizarCPF } = require('./excel');

/**
 * Aplica as regras de exclusão e retorna somente as linhas
 * que devem ser enviadas para as assessorias ("Manter na Cobrança").
 *
 * Regras de exclusão:
 *  1. CPF consta na lista de Acordos SLN
 *  2. CPF consta na lista de Ajuizados/Protesto
 *  3. Código da escola consta na lista de escolas excluídas
 */
function filtrarLinhas(linhas, acordosSLN, ajuizados, escolasExcluir) {
  const contadores = {
    total: linhas.length,
    excluidos_acordo_sln: 0,
    excluidos_ajuizado: 0,
    excluidos_escola: 0,
    mantidos: 0,
  };

  const mantidas = linhas.filter((linha) => {
    const cpf = normalizarCPF(linha['cpf_do_rf']);
    const escola = String(linha['codigo_da_escola'] || '').trim().toLowerCase();

    if (cpf && acordosSLN.has(cpf)) {
      contadores.excluidos_acordo_sln++;
      return false;
    }

    if (cpf && ajuizados.has(cpf)) {
      contadores.excluidos_ajuizado++;
      return false;
    }

    if (escola && escolasExcluir.has(escola)) {
      contadores.excluidos_escola++;
      return false;
    }

    return true;
  });

  contadores.mantidos = mantidas.length;
  return { linhas: mantidas, contadores };
}

module.exports = { filtrarLinhas };
