const fs = require("fs");
const f = "client/src/pages/MovimentacoesEstoque.jsx";
let c = fs.readFileSync(f, "utf8");
const b = `
        <div className="flex items-center gap-3 ml-auto">
          <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Nova Entrada</button>
          <button type="button" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg> Nova Saída</button>
        </div>`;
const s = "className=\\\"px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30\\\"\n        />\n      </div>";
c = c.replace(s, "className=\\\"px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30\\\"\n        />" + b + "\n      </div>");
fs.writeFileSync(f, c);
console.log("Done");
