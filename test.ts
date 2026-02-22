import StegCloak from "./src/stegcloak";

const stegcloak = new StegCloak()

const testText = "Lorem ipsum odor amet, consectetuer adipiscing elit.";
const testCover = "This is a confidential text";
const testPassword = "password";
const testSalt = "724856748962198769";

const prevEncrypted = 'This︀︅︄﻿‍︀⁠︂‎⁠⁠︅︀‎‎​︄‎⁣︅⁢​⁠‍‏︃‍⁣​︅︅‍︁︀︄⁣︃︀﻿ is︄︀️​︀︀︀︅⁣‍⁣︅⁢‎⁠︂︀︃‏⁠​︄⁣︂‎⁢︅​‍‏‍︀︄‍️﻿︅‎︂ a︀‏︀‏﻿​️‌⁣⁠️︅︃﻿​︅‌‏️︂︀︄‏⁠‏️️‌﻿‎⁢︂⁢︄︀‏︀⁢︁ confidential‎﻿⁣︅‏﻿﻿‌︃︁︂⁢‎️︄︄︁️‏︀⁣‌⁠‏⁠︁︀‌⁠⁢‍︀⁣⁠︄︂️︅︀ text'
const decrypted = await stegcloak.reveal(prevEncrypted, testPassword, testSalt);
console.log(`Decryption test: ${decrypted === testText ? 'passed ✅' : 'failed ❌'}`);

console.log("\nEncryption test:")
const encrypted = await stegcloak.hide(testText, testPassword, testSalt, testCover);
console.log(encrypted);
console.log("Length:", encrypted.length);
console.log("Original Text Length:", testText.length);
console.log(await stegcloak.reveal(encrypted, testPassword, testSalt));

console.log("\nBenchmark:");
const iterations = 200;

let runningMean = 0;
for (let i = 0; i < iterations; i++) {
    const pre = performance.now();
    const encrypted = await stegcloak.hide(testText, testPassword, testSalt, testCover);
    const took = performance.now() - pre;
    runningMean += (took - runningMean) / (i + 1);
}
console.log("Encryption time mean:", runningMean, "ms");

runningMean = 0;
for (let i = 0; i < iterations; i++) {
    const pre = performance.now();
    const decrypted = await stegcloak.reveal(prevEncrypted, testPassword, testSalt);
    const took = performance.now() - pre;
    runningMean += (took - runningMean) / (i + 1);
}
console.log("Decryption time mean:", runningMean, "ms");