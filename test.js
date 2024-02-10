const StegCloak = require('./dist/stegcloak.js')
const stegcloak = new StegCloak(true, false)

// Check compatability with the original stegcloak
const prevEncrypted = 'This ‍‍⁡‍‌⁡‍‌⁢⁡‍⁡‍⁡‌‍⁡‍‌⁢⁤‍⁡‌‍⁣‍‍⁣⁢‌⁡⁢⁡‍⁡⁢‌⁢‍‌⁡⁢‍⁢‌⁡‍⁢‌⁤⁢⁢‍‍‌⁡‌‍⁡‍⁢⁤‌⁡‌⁡‍‌⁢⁢‍⁢is a confidential text'
const decrypted = stegcloak.reveal(prevEncrypted, 'password')

if (decrypted === 'Hello World') {
  console.log('Decryption test passed')
}

// Check for errors in the hide function
console.log(stegcloak.hide('Hello World', 'password', 'This is a confidential text'))

process.exit(0)
