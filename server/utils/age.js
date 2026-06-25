function toDateString(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function calculateAge(birthDate) {
  const dateStr = toDateString(birthDate);
  if (!dateStr) return null;

  const [year, month, day] = dateStr.split('-').map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1;
  }
  return age;
}

module.exports = { calculateAge, toDateString };
