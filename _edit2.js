const fs = require("fs");
const f = "server/services/estoqueService.js";
let c = fs.readFileSync(f, "utf8");

// Remove old export
c = c.replace("module.exports = { seedEstoque, listMovimentacoes }", "");

// Add new functions
const extra = `
async function listProdutos(clinicId) {
  const { rows } = await query(
    \x60SELECT id, nome, saldo_atual, saldo_minimo, situacao, unidade
     FROM estoque_produtos
     WHERE clinic_id = \$1 AND deleted_at IS NULL AND is_ativo = true
     ORDER BY nome ASC\x60,
    [clinicId || 1]
  );
  return rows;
}

async function createEntrada(data) {
  const { rows } = await query(
    \x60INSERT INTO estoque_entradas (clinic_id, produto_id, quantidade, data_entrada, fornecedor, valor, registrar_financeiro, observacao)
     VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8)
     RETURNING *\x60,
    [
      data.clinic_id || 1,
      data.produto_id,
      data.quantidade,
      data.data_entrada || new Date().toISOString().slice(0,10),
      data.fornecedor || null,
      data.valor || null,
      data.registrar_financeiro || false,
      data.fornecedor ? "Fornecedor: " + data.fornecedor : "Entrada registrada pelo sistema"
    ]
  );
  return rows[0];
}

module.exports = { seedEstoque, listMovimentacoes, listProdutos, createEntrada };
`;

c += extra;
fs.writeFileSync(f, c);
console.log("Done");

