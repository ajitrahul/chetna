import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const cwd = process.cwd();
        const files: any[] = [];

        function scan(dir: string, depth = 0) {
            if (depth > 2) return;
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    try {
                        const stat = fs.statSync(fullPath);
                        if (stat.isDirectory()) {
                            files.push({ type: 'dir', path: fullPath.replace(cwd, ''), size: 0 });
                            if (!item.includes('node_modules') && !item.includes('.git')) {
                                scan(fullPath, depth + 1);
                            }
                        } else {
                            files.push({ type: 'file', path: fullPath.replace(cwd, ''), size: stat.size });
                        }
                    } catch (e) { }
                });
            } catch (e) {
                files.push({ error: `Failed to read ${dir}: ${e}` });
            }
        }

        scan(cwd);
        // Also check specifically for where we copied the wasm
        const chunksPath = path.join(cwd, '.next/server/chunks');
        if (fs.existsSync(chunksPath)) {
            files.push({ type: 'CHECK', msg: 'Examining .next/server/chunks' });
            scan(chunksPath, 0);
        }

        const publicPath = path.join(cwd, 'public');
        if (fs.existsSync(publicPath)) {
            files.push({ type: 'CHECK', msg: 'Examining public' });
            scan(publicPath, 0);
        }


        return NextResponse.json({ cwd, files });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
