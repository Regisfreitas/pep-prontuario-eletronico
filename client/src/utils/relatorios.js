const CATEGORIAS = [
  "Medicamento",
  "Material Cirúrgico",
  "Material de Limpeza",
  "Material de Escritório",
  "Outro",
];

function downloadCSV(rows, columns, filename) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((r) => columns.map((c) => `"${String(c.accessor(r) ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export { CATEGORIAS, downloadCSV };
