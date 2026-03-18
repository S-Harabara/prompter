<script>
	import { onMount } from 'svelte';
	import {
		sourceBranch,
		targetBranch,
		branchesList,
		codeReviewProjectName,
		codeReviewProjectPath,
		isSourceLocal,
		isTargetLocal,
		fetchingBranch
	} from '../../codeReviewStore.js';
	import { rootPath, folderName as globalFolderName } from '../../promptStore.js';
	import { getGitBranches, selectProjectFolder, checkBranchLocal, fetchBranch } from '../../utils/gitUtils.js';
	import SearchableSelect from '../Common/SearchableSelect.svelte';
	import Button from '../Common/Button.svelte';

	async function handleSelectFolder() {
		const result = await selectProjectFolder();
		if (result) {
			codeReviewProjectPath.set(result.path);
			codeReviewProjectName.set(result.name);
			refreshBranches();
		}
	}

	async function checkLocality() {
		if ($codeReviewProjectPath) {
			try {
				if ($sourceBranch) {
					const local = await checkBranchLocal($codeReviewProjectPath, $sourceBranch);
					isSourceLocal.set(local);
				}
				if ($targetBranch) {
					const local = await checkBranchLocal($codeReviewProjectPath, $targetBranch);
					isTargetLocal.set(local);
				}
			} catch (e) {
				console.warn('Locality check failed. IPC might not be ready.', e);
				// Keep current state or default to false
			}
		}
	}

	/** 
	 * @param {string} branch 
	 * @param {'source' | 'target'} type 
	 */
	async function handleFetch(branch, type) {
		if (!$codeReviewProjectPath) return;
		fetchingBranch.set(branch);
		try {
			await fetchBranch($codeReviewProjectPath, branch);
			if (type === 'source') isSourceLocal.set(true);
			else isTargetLocal.set(true);
		} catch (e) {
			alert(`Failed to fetch branch ${branch}. Make sure it exists on origin.`);
		} finally {
			fetchingBranch.set('');
		}
	}

	async function refreshBranches() {
		if ($codeReviewProjectPath) {
			const list = await getGitBranches($codeReviewProjectPath);
			branchesList.set(list);
			if (list.length > 0) {
				if (!$sourceBranch) sourceBranch.set(list[0]);
				if (!$targetBranch) targetBranch.set(list[0]);
				checkLocality();
			}
		}
	}

	// Sync with global folder if exists
	onMount(() => {
		if ($rootPath && !$codeReviewProjectPath) {
			codeReviewProjectPath.set($rootPath);
			codeReviewProjectName.set($globalFolderName);
			refreshBranches();
		} else if ($codeReviewProjectPath) {
			checkLocality();
		}
	});

	$: if ($sourceBranch || $targetBranch) {
		checkLocality();
	}
</script>

<div class="h-full flex flex-col gap-4">
	<div class="bg-white dark:bg-dark-card rounded-2xl border dark:border-dark-border p-4 shadow-sm flex flex-col gap-4">
		<div class="flex items-center justify-between border-b dark:border-dark-border pb-3">
			<h2 class="font-bold flex items-center gap-2 text-sm">
				<i class="fas fa-code-branch text-blue-500"></i> Git Branches
			</h2>
			<Button 
				onclick={handleSelectFolder} 
				variant="ghost" 
				class="p-0! h-auto! text-[10px] text-blue-500 hover:text-blue-600 uppercase tracking-wider"
				label={$codeReviewProjectName ? 'Change Project' : 'Select Project'}
			/>
		</div>

		{#if $codeReviewProjectName}
			<div class="space-y-4 animate__animated animate__fadeIn">
				<div class="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-dark-border">
					<div class="text-[10px] text-gray-400 uppercase font-bold mb-1">Active Project</div>
					<div class="text-xs font-mono truncate">{$codeReviewProjectName}</div>
				</div>

				<div class="grid grid-cols-1 gap-4">
					<div class="space-y-2">
						<div class="flex items-center justify-between px-1">
							<div class="text-[10px] uppercase font-bold text-gray-400 block">Source Branch</div>
							{#if $sourceBranch}
								<span class="text-[9px] font-bold {$isSourceLocal ? 'text-emerald-500' : 'text-amber-500'} uppercase">
									{$isSourceLocal ? 'Local' : 'Remote'}
								</span>
							{/if}
						</div>
						<SearchableSelect bind:value={$sourceBranch} options={$branchesList} placeholder="Select source..." />
						{#if $sourceBranch && !$isSourceLocal}
							<Button
								onclick={() => handleFetch($sourceBranch, 'source')}
								variant="warning"
								class="w-full py-1.5"
								loading={$fetchingBranch === $sourceBranch}
								icon="fas fa-download"
								label="FETCH TO LOCAL"
							/>
						{/if}
					</div>

					<div class="flex justify-center -my-2 opacity-30">
						<i class="fas fa-arrow-down text-[10px] text-gray-400"></i>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between px-1">
							<div class="text-[10px] uppercase font-bold text-gray-400 block">Target Branch</div>
							{#if $targetBranch}
								<span class="text-[9px] font-bold {$isTargetLocal ? 'text-emerald-500' : 'text-amber-500'} uppercase">
									{$isTargetLocal ? 'Local' : 'Remote'}
								</span>
							{/if}
						</div>
						<SearchableSelect bind:value={$targetBranch} options={$branchesList} placeholder="Select target..." />
						{#if $targetBranch && !$isTargetLocal}
							<Button
								onclick={() => handleFetch($targetBranch, 'target')}
								variant="warning"
								class="w-full py-1.5"
								loading={$fetchingBranch === $targetBranch}
								icon="fas fa-download"
								label="FETCH TO LOCAL"
							/>
						{/if}
					</div>
				</div>

				<Button
					onclick={refreshBranches}
					variant="ghost"
					class="w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 text-[10px]! uppercase"
					icon="fas fa-sync-alt"
					label="Refresh Branches"
				/>
			</div>
		{:else}
			<button
				type="button"
				on:click={handleSelectFolder}
				class="grow min-h-[200px] border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl flex flex-col items-center justify-center p-6 text-center gap-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group w-full"
			>
				<div
					class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
				>
					<i class="fas fa-folder-open text-blue-500/50 text-xl"></i>
				</div>
				<div>
					<div class="text-sm font-bold text-gray-500 dark:text-gray-400">No project selected</div>
					<div class="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Select a git repository to compare branches</div>
				</div>
			</button>
		{/if}
	</div>
</div>
