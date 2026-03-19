import { writable, derived } from 'svelte/store';
import { getTokenCount } from './utils/tokenizer.js';

export const sourceBranch = writable("");
export const targetBranch = writable("");
export const branchesList = writable([]);
export const diffOutput = writable("");
export const isGeneratingDiff = writable(false);
export const codeReviewProjectName = writable("");
export const codeReviewProjectPath = writable("");
export const isSourceLocal = writable(false);
export const isTargetLocal = writable(false);
export const fetchingBranch = writable(""); // name of the branch being fetched

// Prompt Generation State (Independent from PromptBuilder)
export const includeGoal = writable(false);
export const goalText = writable('');
export const includeStructure = writable(false);
export const removeComments = writable(false);
export const minifyOutput = writable(false);

export const generatedOutput = writable('');
export const isGenerating = writable(false);

// Computed stats
export const previewSize = derived(
    generatedOutput,
    ($out) => new Blob([$out]).size
);

export const previewTokens = derived(
    generatedOutput,
    ($out) => getTokenCount($out)
);
