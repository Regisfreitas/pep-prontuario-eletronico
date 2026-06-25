require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const required = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
];

const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length) {
  console.error('Faltam variaveis no .env:', missing.join(', '));
  process.exit(1);
}

console.log('Google OAuth configurado.');
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID.slice(0, 20) + '...');
