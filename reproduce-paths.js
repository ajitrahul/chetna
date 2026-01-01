const fs = require('fs');
const path = require('path');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);

function findFile(startDir, filename, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return null;
    try {
        if (!fs.existsSync(startDir)) return null;
        const files = fs.readdirSync(startDir);

        // Check files in this dir
        for (const file of files) {
            const fullPath = path.join(startDir, file);
            if (file === filename) return fullPath;
        }

        // Recurse
        for (const file of files) {
            const fullPath = path.join(startDir, file);
            if (['.git', '.next', 'node_modules'].includes(file) && depth === 0) continue;
            if (file === 'swisseph-wasm') {
                // Special case: if we found swisseph-wasm dir, dive in deeper even if maxDepth
            }

            if (fs.statSync(fullPath).isDirectory()) {
                const res = findFile(fullPath, filename, depth + 1, maxDepth);
                if (res) return res;
            }
        }
    } catch (e) { return null; }
    return null;
}

const basePaths = [
    path.join(process.cwd(), 'node_modules/swisseph-wasm/wsam'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), '.next/server/chunks'),
];

console.log('Base paths:', basePaths);

// 1. Check direct paths
let wasmPath = null;
for (const base of basePaths) {
    const p = path.join(base, 'swisseph.wasm');
    if (fs.existsSync(p)) {
        console.log('Found WASM (Direct) at:', p);
        wasmPath = p;
        break;
    }
}

// 2. Check recursive
if (!wasmPath) {
    console.log('Direct WASM failed. Trying recursive...');
    const searchRoots = [
        process.cwd(),
        path.join(process.cwd(), 'node_modules'),
    ];
    for (const root of searchRoots) {
        const p = findFile(root, 'swisseph.wasm', 0, 3);
        if (p) {
            console.log('Found WASM (Recursive) at:', p);
            wasmPath = p;
            break;
        }
    }
}

if (!wasmPath) console.log('FAILED to find WASM');


// Check Data
let dataPath = null;
const likelyDataPaths = [
    path.join(process.cwd(), 'node_modules/swisseph-wasm/wsam/swisseph.data'),
    path.join(process.cwd(), 'public/swisseph.data'),
    path.join(process.cwd(), 'swisseph.data'),
];

for (const p of likelyDataPaths) {
    if (fs.existsSync(p)) {
        console.log('Found DATA (Direct) at:', p);
        dataPath = p;
        break;
    }
}

if (!dataPath) {
    console.log('Direct DATA failed. Trying recursive...');
    const searchRoots = [
        process.cwd(),
        path.join(process.cwd(), 'node_modules'),
    ];
    for (const root of searchRoots) {
        dataPath = findFile(root, 'swisseph.data', 0, 3);
        if (dataPath) {
            console.log('Found DATA (Recursive) at:', dataPath);
            break;
        }
    }
}

if (!dataPath) console.log('FAILED to find DATA');
