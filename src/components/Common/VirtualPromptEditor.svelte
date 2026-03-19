<script>
	import { onMount, onDestroy } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState, StateEffect, StateField, Compartment } from '@codemirror/state';
	import { Decoration, WidgetType } from '@codemirror/view';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { javascript } from '@codemirror/lang-javascript';

	let { value = $bindable(), onchange = null, isDirty = $bindable(false) } = $props();

	/** @type {HTMLDivElement} */
	let editorElement;
	/** @type {EditorView} */
	let view;

	let isDarkMode = $state(document.documentElement.classList.contains('dark'));
	const themeCompartment = new Compartment();

	/** @type {any} */
	const toggleFoldEffect = StateEffect.define();
	/** @type {any} */
	const setAllFoldsEffect = StateEffect.define();

	// Field to track folded line numbers
	const foldedLinesField = StateField.define({
		create() {
			return new Set();
		},
		update(folded, tr) {
			for (let e of tr.effects) {
				/** @type {any} */
				const effect = e;
				if (effect.is(toggleFoldEffect)) {
					const { line, fold } = effect.value;
					const newSet = new Set(folded);
					if (fold) newSet.add(line);
					else newSet.delete(line);
					return newSet;
				}
				if (effect.is(setAllFoldsEffect)) {
					return new Set(effect.value);
				}
			}
			return folded;
		}
	});

	// Header Regex
	const HEADER_REGEX = /^(--- SKILL: (.*) ---|--- FILE: (.*) ---|PROJECT STRUCTURE:|GOAL:|GIT DIFF (.*):)/gm;

	class HeaderWidget extends WidgetType {
		/**
		 * @param {string} label
		 * @param {boolean} isFolded
		 * @param {number} line
		 */
		constructor(label, isFolded, line) {
			super();
			this.label = label;
			this.isFolded = isFolded;
			this.line = line;
		}
		/** @param {EditorView} view */
		toDOM(view) {
			const span = document.createElement('span');
			span.className = `px-2 py-0.5 rounded cursor-pointer select-none transition-colors inline-flex items-center gap-2 ${
				this.isFolded
					? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
					: 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
			}`;
			span.innerHTML = `<span class="font-bold">${this.label}</span> <i class="fas fa-chevron-${this.isFolded ? 'right' : 'down'} text-[10px]"></i>`;
			span.onclick = (e) => {
				e.preventDefault();
				view.dispatch({
					effects: toggleFoldEffect.of({ line: this.line, fold: !this.isFolded })
				});
			};
			return span;
		}
	}

	/** @param {string} text */
	function getSections(text) {
		const sections = [];
		let match;
		HEADER_REGEX.lastIndex = 0;
		while ((match = HEADER_REGEX.exec(text)) !== null) {
			sections.push({
				index: match.index,
				label: match[0],
				line: text.substring(0, match.index).split('\n').length
			});
		}
		return sections;
	}

	const sectionDecorator = () => {
		return EditorView.decorations.compute([foldedLinesField, 'doc'], (state) => {
			const text = state.doc.toString();
			const folded = state.field(foldedLinesField);
			const decorations = [];
			const sections = getSections(text);

			for (let i = 0; i < sections.length; i++) {
				const section = sections[i];
				const nextSection = sections[i + 1];
				const startPos = section.index;
				const headerEnd = startPos + section.label.length;
				const endPos = nextSection ? nextSection.index : text.length;

				const isFolded = folded.has(section.line);

				// Replace the header with our widget
				decorations.push(
					Decoration.widget({
						widget: new HeaderWidget(section.label, isFolded, section.line),
						side: 1
					}).range(startPos, startPos)
				);

				// Hide original header text (we replace it with widget)
				decorations.push(Decoration.replace({}).range(startPos, headerEnd));

				if (isFolded) {
					// Hide the content
					if (headerEnd < endPos) {
						// To keep headers on separate lines, we hide everything EXCEPT the final newline of the section
						let foldEnd = endPos;
						if (text[foldEnd - 1] === '\n') foldEnd--;
						if (headerEnd < foldEnd) {
							decorations.push(Decoration.replace({}).range(headerEnd, foldEnd));
						}
					}
				}
			}

			return Decoration.set(decorations.sort((a, b) => a.from - b.from));
		});
	};

	// Export methods using Snippets/Expose
	export const expandAll = () => {
		if (!view) return;
		view.dispatch({
			effects: setAllFoldsEffect.of(new Set())
		});
	};

	export const collapseAll = () => {
		if (!view) return;
		const text = view.state.doc.toString();
		const sections = getSections(text);
		const allLines = new Set(sections.map((s) => s.line));
		view.dispatch({
			effects: setAllFoldsEffect.of(allLines)
		});
	};

	onMount(() => {
		const startState = EditorState.create({
			doc: value,
			extensions: [
				themeCompartment.of(isDarkMode ? oneDark : []),
				basicSetup,
				javascript(),
				foldedLinesField,
				sectionDecorator(),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						const newValue = update.state.doc.toString();
						if (newValue !== value) {
							value = newValue;
							isDirty = true;
							if (onchange) onchange();
						}
					}
				}),
				EditorView.theme({
					'&': { height: '100%', fontSize: '11px', backgroundColor: 'transparent' },
					'.cm-scroller': { overflow: 'auto', fontFamily: 'monospace' },
					'.cm-content': { padding: '10px 0' },
					'.cm-line': { padding: '0 16px' }
				})
			]
		});

		view = new EditorView({
			state: startState,
			parent: editorElement
		});

		const observer = new MutationObserver(() => {
			const dark = document.documentElement.classList.contains('dark');
			if (dark !== isDarkMode) {
				isDarkMode = dark;
				view.dispatch({
					effects: themeCompartment.reconfigure(isDarkMode ? oneDark : [])
				});
			}
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

		// Collapse all by default
		setTimeout(collapseAll, 100);

		return () => observer.disconnect();
	});

	onDestroy(() => {
		if (view) view.destroy();
	});

	// Watch for external value changes
	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			view.dispatch({
				changes: { from: 0, to: view.state.doc.length, insert: value }
			});
			// When value is updated from outside (e.g. generatePrompt),
			// reset isDirty and re-collapse.
			isDirty = false;
			setTimeout(collapseAll, 50);
		}
	});
</script>

<div bind:this={editorElement} class="h-full w-full overflow-hidden bg-white dark:bg-dark-bg/40 rounded-xl"></div>

<style>
	:global(.cm-editor) {
		height: 100% !important;
		outline: none !important;
	}
	:global(.cm-scroller) {
		scrollbar-width: thin;
		scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
	}
	:global(.cm-scroller::-webkit-scrollbar) {
		width: 4px;
	}
	:global(.cm-scroller::-webkit-scrollbar-track) {
		background: transparent;
	}
	:global(.cm-scroller::-webkit-scrollbar-thumb) {
		background: rgba(155, 155, 155, 0.3);
		border-radius: 10px;
	}
</style>
