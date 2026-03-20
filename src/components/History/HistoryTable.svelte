<script>
    import { historyItems, historyTotalCount, historyPage, historyPageSize, loadHistory, isHistoryLoading } from '../../historyStore.js';
    import { fade } from 'svelte/transition';

    export let onView = (/** @type {any} */ item) => {};
    export let onDelete = (/** @type {string} */ id) => {};

    $: totalPages = Math.ceil($historyTotalCount / $historyPageSize);

    function handlePageChange(/** @type {number} */ newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            loadHistory(newPage);
        }
    }

    function formatDate(/** @type {string} */ dateStr) {
        return new Date(dateStr).toLocaleString();
    }

    function truncate(/** @type {string} */ str, /** @type {number} */ len) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }
</script>

<div class="bg-white dark:bg-dark-card border dark:border-dark-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
    <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-dark-border">
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Type</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Project / Root</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Tokens / Chars</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Skills Used</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y dark:divide-dark-border">
                {#if $isHistoryLoading}
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                            <i class="fas fa-circle-notch fa-spin mr-2"></i> Loading history...
                        </td>
                    </tr>
                {:else if $historyItems.length === 0}
                    <tr>
                        <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                            <i class="fas fa-history text-4xl mb-3 opacity-20 block"></i>
                            No history entries found.
                        </td>
                    </tr>
                {:else}
                    {#each $historyItems as item (item.id)}
                        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide 
                                    {item.type === 'prompt_builder' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'}">
                                    {item.type.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-bold text-gray-700 dark:text-gray-200">{item.root_folder_name || 'N/A'}</div>
                                <div class="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.custom_id}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-xs font-bold text-gray-600 dark:text-gray-300">
                                    <i class="fas fa-microchip mr-1.5 opacity-50"></i> {item.token_count?.toLocaleString() || 0}
                                </div>
                                <div class="text-[10px] text-gray-400 mt-0.5">
                                    <i class="fas fa-font mr-1.5 opacity-50"></i> {item.char_count?.toLocaleString() || 0}
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-wrap gap-1 max-w-[200px]">
                                    {#if item.skills_used && item.skills_used.length > 0}
                                        {#each item.skills_used.slice(0, 3) as skill}
                                            <span class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[9px] font-medium text-gray-500">{skill}</span>
                                        {/each}
                                        {#if item.skills_used.length > 3}
                                            <span class="text-[9px] text-gray-400 font-bold">+{item.skills_used.length - 3} more</span>
                                        {/if}
                                    {:else}
                                        <span class="text-[10px] text-gray-400 italic">None</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(item.created_at)}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button 
                                        on:click={() => onView(item)}
                                        class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        title="View Prompt">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button 
                                        on:click={() => onDelete(item.id)}
                                        class="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/20 border-t dark:border-dark-border flex items-center justify-between">
            <div class="text-xs font-bold text-gray-400">
                Showing {($historyPage - 1) * $historyPageSize + 1} - {Math.min($historyPage * $historyPageSize, $historyTotalCount)} of {$historyTotalCount} items
            </div>
            <div class="flex gap-2">
                <button 
                    on:click={() => handlePageChange($historyPage - 1)}
                    disabled={$historyPage === 1}
                    class="px-3 py-1.5 rounded-lg border dark:border-dark-border text-xs font-bold disabled:opacity-30 hover:bg-white dark:hover:bg-dark-card transition-all">
                    <i class="fas fa-chevron-left mr-1"></i> Prev
                </button>
                <div class="flex items-center gap-1 font-mono text-xs font-bold">
                    {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                        if (totalPages <= 5) return i + 1;
                        let start = Math.max(1, $historyPage - 2);
                        let end = Math.min(totalPages, start + 4);
                        if (end === totalPages) start = Math.max(1, end - 4);
                        return start + i;
                    }) as p}
                        <button 
                            on:click={() => handlePageChange(p)}
                            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all {p === $historyPage ? 'bg-blue-600 text-white' : 'hover:bg-white dark:hover:bg-dark-card border dark:border-dark-border'}">
                            {p}
                        </button>
                    {/each}
                </div>
                <button 
                    on:click={() => handlePageChange($historyPage + 1)}
                    disabled={$historyPage === totalPages}
                    class="px-3 py-1.5 rounded-lg border dark:border-dark-border text-xs font-bold disabled:opacity-30 hover:bg-white dark:hover:bg-dark-card transition-all">
                    Next <i class="fas fa-chevron-right ml-1"></i>
                </button>
            </div>
        </div>
    {/if}
</div>
