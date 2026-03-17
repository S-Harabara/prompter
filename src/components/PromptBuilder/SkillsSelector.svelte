<script>
    import { fade, scale } from 'svelte/transition';
    import { savedSkills, selectedSkillsForPrompt, togglePromptSelection, favoriteSkillIds } from '../../skillsStore.js';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    let open = false;
    let searchQuery = '';

    $: sortedSkills = [...$savedSkills].sort((a, b) => {
        // Favorites first, then alphabetically
        const aFav = $favoriteSkillIds.includes(a.id);
        const bFav = $favoriteSkillIds.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
    });

    $: filtered = searchQuery.trim()
        ? sortedSkills.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : sortedSkills;

    $: selectedCount = $selectedSkillsForPrompt.length;

    function toggle(id) {
        togglePromptSelection(id);
        dispatch('change');
    }

    function closePopup() {
        open = false;
        searchQuery = '';
    }

    function selectAll() {
        filtered.forEach(s => {
            if (!$selectedSkillsForPrompt.includes(s.id)) {
                togglePromptSelection(s.id);
            }
        });
        dispatch('change');
    }

    function clearAll() {
        $selectedSkillsForPrompt.forEach(id => togglePromptSelection(id));
        dispatch('change');
    }
</script>

<!-- Trigger button -->
<button
    on:click={() => open = true}
    class="flex items-center justify-between w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border dark:border-dark-border"
>
    <div class="flex items-center gap-2">
        <i class="fas fa-book-sparkles text-indigo-500 text-xs"></i>
        <span class="text-[11px] font-bold uppercase tracking-wider">Skills</span>
        {#if selectedCount > 0}
            <span class="ml-0.5 text-[9px] font-black bg-indigo-600 text-white rounded-full px-1.5 py-0.5 leading-none">{selectedCount}</span>
        {/if}
    </div>
    <i class="fas fa-sliders text-[10px] text-gray-400"></i>
</button>

<!-- Popup -->
{#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
        class="fixed inset-0 z-[200] flex items-center justify-center p-4"
        transition:fade={{ duration: 120 }}
    >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" on:click={closePopup} role="button" tabindex="-1"></div>

        <!-- Modal -->
        <div
            class="relative bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <!-- Header -->
            <div class="px-5 py-4 border-b dark:border-dark-border flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                        <i class="fas fa-book-sparkles text-sm"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-sm">Select Skills</h3>
                        <p class="text-[10px] text-gray-400 font-medium">
                            {selectedCount} of {$savedSkills.length} selected
                        </p>
                    </div>
                </div>
                <button on:click={closePopup} class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center text-gray-400">
                    <i class="fas fa-times text-sm"></i>
                </button>
            </div>

            <!-- Search -->
            <div class="px-4 py-3 border-b dark:border-dark-border shrink-0">
                <div class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search skills..."
                        autofocus
                        class="w-full bg-gray-50 dark:bg-gray-800 border dark:border-dark-border rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                </div>
            </div>

            <!-- Quick actions -->
            {#if $savedSkills.length > 0}
                <div class="px-4 py-2 flex items-center gap-2 border-b dark:border-dark-border shrink-0">
                    <button on:click={selectAll} class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Select all visible</button>
                    <span class="text-gray-300 dark:text-gray-700">·</span>
                    <button on:click={clearAll} class="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors hover:underline">Clear all</button>
                </div>
            {/if}

            <!-- Skill list -->
            <div class="flex-grow overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1.5">
                {#if $savedSkills.length === 0}
                    <div class="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                        <i class="fas fa-box-open text-4xl opacity-20"></i>
                        <p class="text-xs font-medium text-center">Your library is empty.<br>Add skills in the Skills Library tab.</p>
                    </div>
                {:else if filtered.length === 0}
                    <div class="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
                        <i class="fas fa-magnifying-glass text-2xl opacity-30"></i>
                        <p class="text-xs font-medium">No skills match "{searchQuery}"</p>
                    </div>
                {:else}
                    {#each filtered as skill (skill.id)}
                        {@const isSelected = $selectedSkillsForPrompt.includes(skill.id)}
                        {@const isFav = $favoriteSkillIds.includes(skill.id)}
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <div
                            role="checkbox"
                            aria-checked={isSelected}
                            tabindex="0"
                            on:click={() => toggle(skill.id)}
                            on:keydown={(e) => e.key === ' ' && toggle(skill.id)}
                            class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border
                                {isSelected
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50'
                                    : 'bg-gray-50/60 dark:bg-gray-800/40 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}"
                        >
                            <!-- Checkbox -->
                            <div class="shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                                {isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}">
                                {#if isSelected}
                                    <i class="fas fa-check text-white" style="font-size: 8px;"></i>
                                {/if}
                            </div>

                            <!-- Icon -->
                            <div class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs
                                {skill.isCustom ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500'}">
                                <i class="fas {skill.isCustom ? 'fa-pen-nib' : 'fa-bolt'}"></i>
                            </div>

                            <!-- Info -->
                            <div class="flex-grow min-w-0">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs font-bold truncate">{skill.name}</span>
                                    {#if isFav}
                                        <i class="fas fa-star text-yellow-400" style="font-size: 9px;"></i>
                                    {/if}
                                    {#if skill.isCustom}
                                        <span class="text-[8px] font-bold px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded uppercase tracking-wide">custom</span>
                                    {/if}
                                </div>
                                {#if skill.description}
                                    <p class="text-[10px] text-gray-400 truncate mt-0.5">{skill.description}</p>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-4 py-3 border-t dark:border-dark-border shrink-0 flex items-center justify-between">
                <span class="text-[10px] text-gray-400 font-medium">
                    {selectedCount > 0 ? `${selectedCount} skill${selectedCount > 1 ? 's' : ''} will be injected into your prompt` : 'No skills selected'}
                </span>
                <button
                    on:click={closePopup}
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
                    Done
                </button>
            </div>
        </div>
    </div>
{/if}
