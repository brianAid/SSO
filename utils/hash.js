// hash.js
import bcrypt from "bcrypt";

const hashPassword = async (plainTextPassword) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainTextPassword, saltRounds);
  return hash;
};

// CLI usage: `node hash.js 123456`
if (process.argv[2]) {
  const input = process.argv[2];
  hashPassword(input).then(hash => {
    console.log(`Hashed password for "${input}":`);
    console.log(hash);
  });
}

// For importing from other modules
export { hashPassword };
