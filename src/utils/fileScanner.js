const { ipcRenderer } = window.require('electron');

export class GitIgnore {
    constructor(p) { 
        this.rules = p.split('\n').filter(l => l && !l.startsWith('#')).map(r => { 
            let n = r.startsWith('!'); 
            if (n) r = r.slice(1); 
            return { re: new RegExp(r.replace(/\./g, '\\.').replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')), isNeg: n }; 
        }); 
    }
    ignores(p) { 
        let ig = false; 
        this.rules.forEach(r => { if (r.re.test(p)) ig = !r.isNeg; }); 
        return ig || p.includes('node_modules') || p.includes('.git'); 
    }
}

export function isTextFile(n) { 
    return ['.vue', '.js', '.ts', '.tsx', '.jsx', '.css', '.html', '.json', '.md', '.py', '.go', '.rs', '.php', '.rb', '.txt', '.sh', '.yaml', '.yml', '.lock', '.toml', '.svelte'].some(e => n.toLowerCase().endsWith(e)) || ['Makefile', 'Dockerfile', 'root'].includes(n); 
}

import { isScanning, scanProgress } from '../promptStore.js';

export async function buildFileTree(projectPath) {
    isScanning.set(true);
    scanProgress.set(0);
    
    // Listen for progress
    const removeListener = ipcRenderer.on('scan-progress', (event, count) => {
        scanProgress.set(count);
    });

    try {
        const tree = await ipcRenderer.invoke('scan-directory', { projectPath });
        
        // Flatten for fileHandles stores
        const handles = [];
        const flatten = (nodes) => {
            nodes.forEach(n => {
                if (n.kind === 'file') {
                    // We wrap it in a mock handle that uses IPC to read file content
                    handles.push({ 
                        p: n.path, 
                        s: n.size, 
                        n: n.name,
                        h: {
                            getFile: async () => ({
                                text: async () => await ipcRenderer.invoke('read-file', { filePath: n.path, projectPath })
                            })
                        }
                    });
                } else if (n.children) {
                    flatten(n.children);
                }
            });
        };
        flatten(tree);
        
        return { tree, handles };
    } finally {
        isScanning.set(false);
        // ipcRenderer.on doesn't return a cleanup function in some versions, 
        // but if it's the standard Electron one it might not. 
        // Actually ipcRenderer.on returns the ipcRenderer itself usually.
        // We should use ipcRenderer.removeAllListeners or similar if we want to be clean.
        ipcRenderer.removeAllListeners('scan-progress');
    }
}
