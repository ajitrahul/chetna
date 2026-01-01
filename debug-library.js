const SwissEph = require('./node_modules/swisseph-wasm/wsam/swisseph.js');

console.log('Testing Options...');
try {
    const fs = require('fs');
    // Using a small dummy buffer just to see if option is read
    const dummyBuffer = new ArrayBuffer(8);
    const instance = new SwissEph.default({
        wasmBinary: dummyBuffer
    });
    console.log('Constructor accepted wasmBinary option');

    // We expect initSwissEph to fail later if buffer is invalid, but we just want to know if it CRASHES on constructor
    console.log('Passed constructor check related to options property existence');

} catch (e) {
    console.log('Constructor failed with options:', e.message);
}
