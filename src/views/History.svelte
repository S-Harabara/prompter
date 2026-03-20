<script>
    import { onMount } from 'svelte';
    import { loadHistory, deleteHistoryEntry } from '../historyStore.js';
    import HistoryTable from '../components/History/HistoryTable.svelte';
    import HistoryModal from '../components/History/HistoryModal.svelte';
    import { fade } from 'svelte/transition';

    /** @type {any} */
    let selectedItem = null;

    onMount(() => {
        loadHistory(1);
    });

    /** @param {any} item */
    function openPreview(item) {
        selectedItem = item;
    }

    function closePreview() {
        selectedItem = null;
    }

    /** @param {string} id */
    async function handleDelete(id) {
        if (confirm('Are you sure you want to delete this history entry?')) {
            await deleteHistoryEntry(id);
        }
    }
</script>

<div class="grow flex flex-col p-6 h-full overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors" transition:fade={{duration: 200}}>
    <div class="max-w-6xl w-full mx-auto flex flex-col h-full gap-6">
        
        <!-- Header -->
        <div class="flex items-end justify-between shrink-0">
            <div>
                <h1 class="text-3xl font-black tracking-tight flex items-center gap-3 text-gray-900 dark:text-white">
                    <i class="fas fa-clock-rotate-left text-blue-500"></i> Generation History
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Review and reuse your previously generated prompts.</p>
            </div>
            
            <button 
                on:click={() => loadHistory(1)}
                class="px-4 py-2 bg-white dark:bg-dark-card border dark:border-dark-border rounded-xl text-sm font-bold shadow-sm hover:border-blue-500 transition-all flex items-center gap-2">
                <i class="fas fa-arrows-rotate text-blue-500"></i> Refresh
            </button>
        </div>

        <!-- History Table -->
        <div class="grow overflow-hidden flex flex-col">
            <HistoryTable 
                onView={openPreview}
                onDelete={handleDelete}
            />
        </div>
    </div>
</div>

{#if selectedItem}
    <HistoryModal 
        item={selectedItem} 
        onclose={closePreview} 
    />
{/if}
