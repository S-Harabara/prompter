import { writable, get } from 'svelte/store';

const { ipcRenderer } = window.require('electron');

export const historyItems = writable([]);
export const historyTotalCount = writable(0);
export const historyPage = writable(1);
export const historyPageSize = writable(30);
export const isHistoryLoading = writable(false);

export const loadHistory = async (page = 1) => {
    isHistoryLoading.set(true);
    try {
        const pageSize = get(historyPageSize);
        const [items, count] = await Promise.all([
            ipcRenderer.invoke('db:get-history', { page, pageSize }),
            ipcRenderer.invoke('db:get-history-count')
        ]);
        
        historyItems.set(items);
        historyTotalCount.set(count);
        historyPage.set(page);
    } catch (error) {
        console.error('Failed to load history:', error);
    } finally {
        isHistoryLoading.set(false);
    }
};

export const addToHistory = async (/** @type {any} */ entry) => {
    try {
        await ipcRenderer.invoke('db:add-history', entry);
        // Reload currently on page 1 to show the latest entry
        await loadHistory(1);
    } catch (error) {
        console.error('Failed to add to history:', error);
    }
};

export const deleteHistoryEntry = async (/** @type {string} */ id) => {
    try {
        await ipcRenderer.invoke('db:delete-history', id);
        const currentPage = get(historyPage);
        await loadHistory(currentPage);
    } catch (error) {
        console.error('Failed to delete history entry:', error);
    }
};
