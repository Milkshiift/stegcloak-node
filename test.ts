import StegCloak from "./src/stegcloak";

const stegcloak = new StegCloak()

// Check compatability with the original stegcloak
// const prevEncrypted = 'This ‍‍⁡‍‌⁡‍‌⁢⁡‍⁡‍⁡‌‍⁡‍‌⁢⁤‍⁡‌‍⁣‍‍⁣⁢‌⁡⁢⁡‍⁡⁢‌⁢‍‌⁡⁢‍⁢‌⁡‍⁢‌⁤⁢⁢‍‍‌⁡‌‍⁡‍⁢⁤‌⁡‌⁡‍‌⁢⁢‍⁢is a confidential text'
// const decrypted = stegcloak.reveal(prevEncrypted, 'password');
// console.log(`Decryption test: ${decrypted === 'Hello World' ? 'passed ✅' : 'failed ❌'}`);

const prevEncrypted = 'This is ‍‍‍⁢⁡‌⁡‍⁡‌⁤⁢‌⁢‍⁡‍⁣⁢‌⁡‌⁢‍⁢‍⁢⁢‌‍‍‌⁢⁢⁢⁣⁤‍⁡‍⁢⁡⁢⁢⁢‌‍⁢⁢‍⁡‍‍‍‍‌⁡‍⁤⁣⁣⁢⁡⁢⁢‌⁡⁢⁤⁣‌⁡‌⁡‌‍‍⁢‌⁡⁢‌‍⁡‍⁢⁣⁡⁢‍⁡‌⁤⁢‍⁢⁢‌⁢⁢‌⁤⁡‌⁢‍⁡⁢⁤⁡‌⁡‌‍‍⁣⁣⁡‌‍⁢⁢⁣⁤⁤‌⁢‌‍‍‌⁡‌⁡⁢‌⁤‌⁤‍‌⁤⁤⁢‍‌⁡‍⁡‌⁤⁢‍‌⁢‍‌⁢⁡‌⁢⁣⁤‍⁢‌⁡‍‍‍⁢‍‌⁡‌⁢⁣⁢‌⁢⁡‍⁡‍‍⁡⁣⁢‌‍⁢‍‌⁡‌‍⁣⁢⁢‍⁢⁢‍⁤‍a confidential text'
const decrypted = stegcloak.reveal(prevEncrypted, 'password');
console.log(`Decryption test: ${decrypted === 'Lorem ipsum odor amet, consectetuer adipiscing elit.' ? 'passed ✅' : 'failed ❌'}`);

console.log("Ecryption test:")
const encrypted = stegcloak.hide('Lorem ipsum odor amet, consectetuer adipiscing elit.', 'password', 'This is a confidential text');
console.log(encrypted);
console.log("Length:", encrypted.length);
console.log(stegcloak.reveal(encrypted, 'password'));