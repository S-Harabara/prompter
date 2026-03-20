<script>
    import { fade, slide } from 'svelte/transition';
    import VirtualPromptEditor from '../Common/VirtualPromptEditor.svelte';
    import Button from '../Common/Button.svelte';

    let { item, onclose } = $props();

    function formatDate(/** @type {string} */ dateStr) {
        return new Date(dateStr).toLocaleString();
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(item.content);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6" transition:fade={{duration: 150}}>
    <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onclick={onclose}></div>

    <div class="relative bg-white dark:bg-dark-card w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" transition:slide={{duration: 300}}>
        <!-- Modal Header -->
        <div class="p-5 border-b dark:border-dark-border flex items-center justify-between bg-linear-to-r from-blue-600 to-blue-800 text-white shrink-0">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                    <i class="fas {item.type === 'prompt_builder' ? 'fa-hammer' : 'fa-code-pull-request'}"></i>
                </div>
                <div>
                    <h2 class="text-xl font-black">History Preview</h2>
                    <div class="flex items-center gap-2 mt-0.5 opacity-80 text-xs font-bold">
                        <span>{item.type === 'prompt_builder' ? 'Prompt Builder' : 'Code Review'}</span>
                        <span>·</span>
                        <span>{formatDate(item.created_at)}</span>
                        <span>·</span>
                        <span class="font-mono">{item.custom_id}</span>
                    </div>
                </div>
            </div>
            <button onclick={onclose} aria-label="Close" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Metadata Bar -->
        <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-dark-border flex flex-wrap gap-6 shrink-0">
            <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Root Folder</span>
                <span class="text-sm font-bold text-gray-700 dark:text-gray-200">{item.root_folder_name || 'N/A'}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tokens</span>
                <span class="text-sm font-bold text-blue-500 font-mono">{item.token_count?.toLocaleString() || 0}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Characters</span>
                <span class="text-sm font-bold text-gray-600 dark:text-gray-300 font-mono">{item.char_count?.toLocaleString() || 0}</span>
            </div>
            {#if item.skills_used && item.skills_used.length > 0}
                <div class="flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Skills</span>
                    <div class="flex gap-1.5 mt-0.5">
                        {#each item.skills_used as skill}
                            <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold">
                                {skill}
                            </span>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <!-- Content -->
        <div class="grow overflow-hidden relative p-4 bg-gray-50 dark:bg-dark-bg/20">
            <VirtualPromptEditor value={item.content} />
        </div>

        <!-- Footer -->
        <div class="p-5 border-t dark:border-dark-border flex gap-3 shrink-0">
            <Button onclick={copyToClipboard} variant="primary" class="grow py-3!" icon="fas fa-copy" label="COPY PROMPT" />
            <Button onclick={onclose} variant="secondary" class="px-8" label="CLOSE" />
        </div>
    </div>
</div>
