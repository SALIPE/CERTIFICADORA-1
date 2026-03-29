const bcrypt = require('bcryptjs');

//  para gerar a senha bcrypt do admin inicial
const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/generate-hash.js SuaSenhaAqui');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(password, saltRounds);
console.log(hash);
