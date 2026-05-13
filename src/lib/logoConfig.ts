const DEFAULT_LOGO_LIGHT_FILE = 'chetna_logo_light.png';
const DEFAULT_LOGO_DARK_FILE = 'chetna_logo_dark.png';

function trimSlashes(value: string): string {
    return value.replace(/^\/+|\/+$/g, '');
}

function buildPublicAssetPath(basePath: string, fileName: string): string {
    const cleanFileName = fileName.trim().replace(/^\/+/, '');
    const cleanBasePath = basePath.trim();

    if (!cleanBasePath || cleanBasePath === '/') {
        return `/${cleanFileName}`;
    }

    return `/${trimSlashes(cleanBasePath)}/${cleanFileName}`;
}

export const LOGO_LIGHT_FILE = process.env.NEXT_PUBLIC_LOGO_LIGHT_FILE || DEFAULT_LOGO_LIGHT_FILE;
export const LOGO_DARK_FILE = process.env.NEXT_PUBLIC_LOGO_DARK_FILE || DEFAULT_LOGO_DARK_FILE;

export const LOGO_DARK_SRC = buildPublicAssetPath('/', LOGO_DARK_FILE);
export const LOGO_LIGHT_SRC = buildPublicAssetPath('/', LOGO_LIGHT_FILE);
