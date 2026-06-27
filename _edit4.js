const fs = require("fs");
const f = "server/routes/estoque.js";
let c = fs.readFileSync(f, "utf8");
c = c.replace("const { movimentacoesHandler } = require(\"../controllers/estoqueController\");",
  "const { movimentacoesHandler, produtosHandler, criarEntradaHandler } = require(\"../controllers/estoqueController\");");
c = c.replace("router.get(\"/movimentacoes\", movimentacoesHandler);",
  "router.get(\"/movimentacoes\", movimentacoesHandler);\nrouter.get(\"/produtos\", produtosHandler);\nrouter.post(\"/entradas\", criarEntradaHandler);");
fs.writeFileSync(f, c);
console.log("OK");

