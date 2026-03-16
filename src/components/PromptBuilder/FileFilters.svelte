<script>
	import { explorerFilter, fileTreeData, selectedFiles } from '../../promptStore.js';
	import { slide } from 'svelte/transition';

	let isExpanded = false;
	let isSearching = false;
	let searchTimeout;

	function handleSearch(e) {
		const val = e.target.value;
		isSearching = true;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			explorerFilter.set(val);
			isSearching = false;
		}, 300);
	}

	const quickFilters = [
		{ label: 'TS', extensions: ['ts'] },
		{ label: 'TSX', extensions: ['tsx'] },
		{ label: 'JS', extensions: ['js'] },
		{ label: 'JSX', extensions: ['jsx'] },
		{ label: 'Svelte', extensions: ['svelte'] },
		{ label: 'Vue', extensions: ['vue'] },
		{ label: 'Py', extensions: ['py', 'ipynb'] },
		{ label: 'Rust', extensions: ['rs'] },
		{ label: 'Go', extensions: ['go'] },
		{ label: 'PHP', extensions: ['php'] },
		{ label: 'RB', extensions: ['rb'] },
		{ label: 'Java/Kt', extensions: ['java', 'kt', 'kts'] },
		{ label: 'C/C++', extensions: ['c', 'cpp', 'h', 'hpp'] },
		{ label: 'SQL', extensions: ['sql'] },
		{ label: 'HTML', extensions: ['html', 'svg'] },
		{ label: 'CSS/SCSS', extensions: ['css', 'scss', 'sass', 'less'] },
		{ label: 'MD', extensions: ['md', 'mdx'] },
		{ label: 'JSON', extensions: ['json'] },
		{ label: 'YML', extensions: ['yml', 'yaml'] }
	];

	function selectByExtension(extList, include = true) {
		const getAll = (nodes, set) => {
			nodes.forEach((n) => {
				if (n.kind === 'file' && n.isText) {
					const extension = n.name.split('.').pop().toLowerCase();
					if (extList.includes(extension)) {
						if (include) set.add(n.path);
						else set.delete(n.path);
					}
				} else if (n.kind === 'directory' && n.children) {
					getAll(n.children, set);
				}
			});
		};

		selectedFiles.update((set) => {
			const next = new Set(set);
			getAll($fileTreeData, next);
			return next;
		});
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<div class="relative flex-grow mr-2">
			<input
				type="text"
				placeholder="Search files/folders..."
				class="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-dark-border rounded-lg py-1.5 pl-8 pr-8 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all"
				on:input={handleSearch}
				value={$explorerFilter}
			/>
			<i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
			{#if isSearching}
				<i class="fas fa-circle-notch fa-spin absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500 text-[10px]"></i>
			{:else if $explorerFilter}
				<button
					on:click={() => explorerFilter.set('')}
					class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
				>
					<i class="fas fa-times text-[10px]"></i>
				</button>
			{/if}
		</div>
		<button
			on:click={() => (isExpanded = !isExpanded)}
			class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 {isExpanded ? 'text-blue-500' : ''}"
		>
			<i class="fas fa-filter text-xs"></i>
		</button>
	</div>

	{#if isExpanded}
		<div
			transition:slide={{ duration: 200 }}
			class="flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl border dark:border-dark-border shadow-inner"
		>
			<div class="flex flex-col gap-1.5">
				<span class="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Quick Selection</span>
				<div class="flex flex-wrap gap-1.5">
					{#each quickFilters as filter}
						<div class="flex items-center overflow-hidden rounded-md border dark:border-dark-border bg-white dark:bg-dark-card shadow-sm">
							<button
								on:click={() => selectByExtension(filter.extensions, true)}
								class="px-2 py-1 text-[10px] font-bold hover:bg-blue-500 hover:text-white transition-colors"
							>
								+{filter.label}
							</button>
							<div class="w-[1px] h-3 bg-gray-200 dark:bg-dark-border"></div>
							<button
								on:click={() => selectByExtension(filter.extensions, false)}
								class="px-2 py-1 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-colors"
							>
								-{filter.label}
							</button>
						</div>
					{/each}
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<span class="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Selection Magic</span>
				<div class="flex gap-2">
					<button
						on:click={() => selectedFiles.set(new Set())}
						class="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border dark:border-dark-border hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold"
					>
						<i class="fas fa-trash-can"></i> DESELECT ALL
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
