import StegCloak from "./dist/stegcloak.js";

const stegcloak = new StegCloak(true, false)

console.log("Decryption test:")

// Check compatability with the original stegcloak
const prevEncrypted = 'This ‍‍⁡‍‌⁡‍‌⁢⁡‍⁡‍⁡‌‍⁡‍‌⁢⁤‍⁡‌‍⁣‍‍⁣⁢‌⁡⁢⁡‍⁡⁢‌⁢‍‌⁡⁢‍⁢‌⁡‍⁢‌⁤⁢⁢‍‍‌⁡‌‍⁡‍⁢⁤‌⁡‌⁡‍‌⁢⁢‍⁢is a confidential text'
const decrypted = stegcloak.reveal(prevEncrypted, 'password');
if (decrypted === 'Hello World') {
  console.log('Decryption test passed')
}

console.log("Ecryption test:")
const encrypted = stegcloak.hide('Hello World', 'password', 'This is a confidential text');
console.log(encrypted);
