/**
 * Generates a clean, token-efficient tree representation of the project.
 * 
 * Includes smart summarization for directories with many similar files (e.g. images).
 * 
 * @param {any[]} treeData - Array of nodes { name, kind, children }
 * @param {string} [prefix=''] - Internal use for recursion
 * @param {string} [projectName=''] - Root project name
 * @returns {string}
 */
export function getProjectStructure(treeData, prefix = '', projectName = '') {
    if (!treeData || treeData.length === 0) return '';

    let res = projectName ? `${projectName}/\n` : 'PROJECT STRUCTURE:\n';

    const buildTree = (nodes, currentPrefix = '') => {
        const sortedNodes = [...nodes].sort((a, b) => {
            if (a.kind === b.kind) return a.name.localeCompare(b.name);
            return a.kind === 'directory' ? -1 : 1;
        });

        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp', '.tiff'];
        
        // Smart summarization: if a folder has many files of the same type, summarize them
        const summarizeThreshold = 6;
        
        for (let i = 0; i < sortedNodes.length; i++) {
            const node = sortedNodes[i];
            const isLast = i === sortedNodes.length - 1;
            const branch = isLast ? '└── ' : '├── ';
            const childPrefix = isLast ? '    ' : '│   ';

            // Check if we should summarize siblings (if this is a file and has many similar siblings)
            // But it's easier to check the whole directory content first if we are inside buildTree
            
            res += currentPrefix + branch + node.name + (node.kind === 'directory' ? '/' : '') + '\n';

            if (node.kind === 'directory' && node.children && node.children.length > 0) {
                const children = node.children;
                
                // Smart check for this directory
                const files = children.filter(c => c.kind === 'file');
                const dirs = children.filter(c => c.kind === 'directory');
                
                const allImages = files.length > summarizeThreshold && files.every(f => 
                    imageExtensions.some(ext => f.name.toLowerCase().endsWith(ext))
                );

                if (allImages) {
                    // List first 3 images and summarize the rest
                    children.filter(c => c.kind === 'directory').forEach((d, idx, arr) => {
                        const isLastDir = idx === arr.length - 1 && files.length === 0;
                        const dBranch = isLastDir ? '└── ' : '├── ';
                        const dChildPrefix = isLastDir ? '    ' : '│   ';
                        res += currentPrefix + childPrefix + dBranch + d.name + '/\n';
                        if (d.children) buildTree(d.children, currentPrefix + childPrefix + dChildPrefix);
                    });
                    
                    const firstThree = files.slice(0, 3);
                    firstThree.forEach((f, idx) => {
                        const isLastFile = idx === firstThree.length - 1 && files.length === firstThree.length;
                        const fBranch = isLastFile ? '└── ' : '├── ';
                        res += currentPrefix + childPrefix + fBranch + f.name + '\n';
                    });
                    
                    if (files.length > 3) {
                        res += currentPrefix + childPrefix + '└── ... (' + (files.length - 3) + ' more assets)\n';
                    }
                } else {
                    buildTree(node.children, currentPrefix + childPrefix);
                }
            }
        }
    };

    // If the root is an array (likely), we start building from it.
    // If treeData is the content of the root directory.
    
    // Check if we need to wrap it in a root
    const rootName = projectName || 'project';
    
    // We'll mimic the requested style:
    // my-vue-app/
    // ├── public/
    // │   └── favicon.ico

    res = projectName ? `${projectName}/\n` : '';
    
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.bmp', '.tiff'];
    /** @param {string} name */
    const isImageFile = (name) => imageExtensions.some(ext => name.toLowerCase().endsWith(ext));

    /** @param {any} node */
    const isOnlyImagesRecursive = (node) => {
        if (node.kind === 'file') {
            return isImageFile(node.name);
        }
        if (node.kind === 'directory') {
            if (!node.children || node.children.length === 0) return true; 
            return node.children.every((/** @type {any} */ child) => isOnlyImagesRecursive(child));
        }
        return false;
    };

    /**
     * @param {any[]} nodes
     * @param {string} currentPrefix
     */
    const internalBuild = (nodes, currentPrefix = '') => {
        const sorted = [...nodes]
            .filter((/** @type {any} */ node) => {
                if (node.name === 'node_modules' || node.name === '.git') return false;
                if (node.kind === 'directory' && isOnlyImagesRecursive(node)) return false;
                if (node.kind === 'file' && isImageFile(node.name)) return false; // Also ignore loose images
                return true;
            })
            .sort((a, b) => {
                if (a.kind === b.kind) return a.name.localeCompare(b.name);
                return a.kind === 'directory' ? -1 : 1;
            });

        for (let i = 0; i < sorted.length; i++) {
            const node = sorted[i];
            const isLast = i === sorted.length - 1;
            const branch = isLast ? '└── ' : '├── ';
            const nextPrefix = currentPrefix + (isLast ? '    ' : '│   ');

            // Determine if it's a "boring" directory to summarize
            let isSummarized = false;
            if (node.kind === 'directory' && node.children && node.children.length > 8) {
                /** @type {any[]} */
                const files = node.children.filter((/** @type {any} */ c) => c.kind === 'file');
                const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
                const isAssetFolder = files.length > 5 && files.every((/** @type {any} */ f) => imageExtensions.some(ext => f.name.toLowerCase().endsWith(ext)));
                
                if (isAssetFolder) {
                    res += `${currentPrefix}${branch}${node.name}/\n`;
                    const firstTwo = files.slice(0, 2);
                    firstTwo.forEach((/** @type {any} */ f, fIdx) => {
                         res += `${nextPrefix}├── ${f.name}\n`;
                    });
                    res += `${nextPrefix}└── ... (${files.length - 2} more assets)\n`;
                    isSummarized = true;
                }
            }

            if (!isSummarized) {
                res += `${currentPrefix}${branch}${node.name}${node.kind === 'directory' ? '/' : ''}\n`;
                if (node.kind === 'directory' && node.children && node.children.length > 0) {
                    internalBuild(node.children, nextPrefix);
                }
            }
        }
    };

    internalBuild(treeData, '');
    
    return projectName ? `${projectName}/\n${res}` : `PROJECT STRUCTURE:\n${res}`;
}
