import StegCloak from "./dist/stegcloak.js";

const stegcloak = new StegCloak(true, false)

console.log("Decryption test:")

// Check compatability with the original stegcloak
const prevEncrypted = 'This ‍‍⁡‍‌⁡‍‌⁢⁡‍⁡‍⁡‌‍⁡‍‌⁢⁤‍⁡‌‍⁣‍‍⁣⁢‌⁡⁢⁡‍⁡⁢‌⁢‍‌⁡⁢‍⁢‌⁡‍⁢‌⁤⁢⁢‍‍‌⁡‌‍⁡‍⁢⁤‌⁡‌⁡‍‌⁢⁢‍⁢is a confidential text'
const decrypted = stegcloak.reveal(prevEncrypted, 'password');
console.log(`Decryption test: ${decrypted === 'Hello World' ? 'passed ✅' : 'failed ❌'}`);

console.log("Ecryption test:")
const prevLength = 95;
const encrypted = stegcloak.hide('Hello World', 'password', 'This is a confidential text');
console.log(encrypted);
console.log("Old length:", prevLength, "New length:", encrypted.length);