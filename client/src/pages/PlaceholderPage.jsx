import { useLocation } from "react-router-dom";
import {
  Package,
  ArrowLeftRight,
  Pill,
  BarChart3,
  DollarSign,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Calculator,
  Receipt,
  PieChart,
} from "lucide-react";

const PAGES = {
  "/estoque/movimentacoes": {
    icon: ArrowLeftRight,
    title: "Movimentações",
    module: "Estoque",
    description: "Controle de entradas e saídas do estoque.",
  },
  "/estoque/produtos": {
    icon: Pill,
    title: "Produtos",
    module: "Estoque",
    description: "Catálogo de produtos e medicamentos.",
  },
  "/estoque/relatorios": {
    icon: BarChart3,
    title: "Relatórios",
    module: "Estoque",
    description: "Relatórios gerenciais do estoque.",
  },
  "/financeiro/receitas-despesas": {
    icon: TrendingUp,
    title: "Receitas e Despesas",
    module: "Financeiro",
    description: "Registro de receitas e despesas da clínica.",
  },
  "/financeiro/contas-pagar": {
    icon: ArrowDownCircle,
    title: "Contas a Pagar",
    module: "Financeiro",
    description: "Gerencie as contas a pagar.",
  },
  "/financeiro/contas-receber": {
    icon: ArrowUpCircle,
    title: "Contas a Receber",
    module: "Financeiro",
    description: "Gerencie as contas a receber.",
  },
  "/financeiro/orcamentos": {
    icon: Calculator,
    title: "Orçamentos",
    module: "Financeiro",
    description: "Criação e gestão de orçamentos.",
  },
  "/financeiro/gerar-recibo-nfe": {
    icon: Receipt,
    title: "Gerar Recibo/NF-e",
    module: "Financeiro",
    description: "Emissão de recibos e notas fiscais eletrônicas.",
  },
  "/financeiro/relatorios": {
    icon: PieChart,
    title: "Relatórios",
    module: "Financeiro",
    description: "Relatórios financeiros consolidados.",
  },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const meta = PAGES[location.pathname];

  if (!meta) {
    return (
      <div className="flex flex-col flex-1 bg-slate-50 items-center justify-center p-8">
        <p className="text-slate-500">Página não encontrada</p>
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="flex flex-col flex-1 bg-slate-50">
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">{meta.title}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
            {Icon && <Icon size={32} className="text-brand-600" />}
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            {meta.title}
          </h2>
          <p className="text-sm text-slate-500 mb-4">{meta.description}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
}
