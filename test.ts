import StegCloak from "./src/stegcloak";

const stegcloak = new StegCloak()

// Check compatability with the original stegcloak
// const prevEncrypted = 'This ‍‍⁡‍‌⁡‍‌⁢⁡‍⁡‍⁡‌‍⁡‍‌⁢⁤‍⁡‌‍⁣‍‍⁣⁢‌⁡⁢⁡‍⁡⁢‌⁢‍‌⁡⁢‍⁢‌⁡‍⁢‌⁤⁢⁢‍‍‌⁡‌‍⁡‍⁢⁤‌⁡‌⁡‍‌⁢⁢‍⁢is a confidential text'
// const decrypted = stegcloak.reveal(prevEncrypted, 'password');
// console.log(`Decryption test: ${decrypted === 'Hello World' ? 'passed ✅' : 'failed ❌'}`);

const prevEncrypted = 'This is ‍‍‍⁢⁡‌⁡‍⁡‌⁤⁢‌⁢‍⁡‍⁣⁢‌⁡‌⁢‍⁢‍⁢⁢‌‍‍‌⁢⁢⁢⁣⁤‍⁡‍⁢⁡⁢⁢⁢‌‍⁢⁢‍⁡‍‍‍‍‌⁡‍⁤⁣⁣⁢⁡⁢⁢‌⁡⁢⁤⁣‌⁡‌⁡‌‍‍⁢‌⁡⁢‌‍⁡‍⁢⁣⁡⁢‍⁡‌⁤⁢‍⁢⁢‌⁢⁢‌⁤⁡‌⁢‍⁡⁢⁤⁡‌⁡‌‍‍⁣⁣⁡‌‍⁢⁢⁣⁤⁤‌⁢‌‍‍‌⁡‌⁡⁢‌⁤‌⁤‍‌⁤⁤⁢‍‌⁡‍⁡‌⁤⁢‍‌⁢‍‌⁢⁡‌⁢⁣⁤‍⁢‌⁡‍‍‍⁢‍‌⁡‌⁢⁣⁢‌⁢⁡‍⁡‍‍⁡⁣⁢‌‍⁢‍‌⁡‌‍⁣⁢⁢‍⁢⁢‍⁤‍a confidential text'
const decrypted = stegcloak.reveal(prevEncrypted, 'password');
console.log(`Decryption test: ${decrypted === 'Lorem ipsum odor amet, consectetuer adipiscing elit.' ? 'passed ✅' : 'failed ❌'}`);

console.log("\nEncryption test:")
const encrypted = stegcloak.hide('Lorem ipsum odor amet, consectetuer adipiscing elit.', 'password', 'This is a confidential text');
console.log(encrypted);
console.log("Length:", encrypted.length);
console.log(stegcloak.reveal(encrypted, 'password'));

console.log("\nBenchmark:");
const iterations = 200;

let runningMean = 0;
for (let i = 0; i < iterations; i++) {
    const pre = performance.now();
    const encrypted = stegcloak.hide('Lorem ipsum odor amet, consectetuer adipiscing elit.', 'password', 'This is a confidential text');
    const took = performance.now() - pre;
    runningMean += (took - runningMean) / (i + 1);
}
console.log("Encryption time mean:", runningMean, "ms");

runningMean = 0;
for (let i = 0; i < iterations; i++) {
    const pre = performance.now();
    const decrypted = stegcloak.reveal(prevEncrypted, 'password');
    const took = performance.now() - pre;
    runningMean += (took - runningMean) / (i + 1);
}
console.log("Decryption time mean:", runningMean, "ms");