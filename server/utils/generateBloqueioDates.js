function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateBloqueioDates(dataInicio, tipoRepeticao, dataLimite) {
  const start = parseDate(dataInicio);
  const limit = dataLimite ? parseDate(dataLimite) : start;
  const dates = [];

  if (tipoRepeticao === 'UNICO') {
    dates.push(formatDate(start));
    return dates;
  }

  if (start > limit) {
    return dates;
  }

  if (tipoRepeticao === 'PERIODO') {
    const current = new Date(start);
    while (current <= limit) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  if (tipoRepeticao === 'SEMANAL') {
    const current = new Date(start);
    while (current <= limit) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 7);
    }
    return dates;
  }

  if (tipoRepeticao === 'MENSAL') {
    const current = new Date(start);
    while (current <= limit) {
      dates.push(formatDate(current));
      current.setMonth(current.getMonth() + 1);
    }
    return dates;
  }

  return dates;
}

module.exports = { generateBloqueioDates };
