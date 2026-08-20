import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getMonaco } from '@app/utils/monaco';
import { h, render } from 'vue';
import { Title } from '@app/legacy/title/title-bar.ts';

Command.cases.script = new CommandSchema({
	name: 'script',
	fields: [{ key: 'script', default: '' }],
	colorOptions: {
		mimeType: 'javascript',
		tabSize: 2,
		theme: ''
	},
	customParse({ script }: { script: string }) {
		const contents: Record<string, unknown>[] = [{ script: script }];
		if (script.includes('\n')) {
			contents.unshift({ fold: true });
		}
		return contents;
	},
	async colorizeCodeLines(items: HTMLElement[], code: string) {
		const monaco = await getMonaco();
		const holder = document.createElement('div');
		holder.style.display = 'none';
		render(h('div', { class: 'text' }, code), holder);
		const text = holder.firstElementChild as HTMLElement;
		const options = this.colorOptions;
		options.theme = Title.theme;
		await this.createTheme!(Title.theme);
		monaco.editor.colorizeElement(text, options);
		let index = setInterval(() => {
			if (text.children.length !== 0) {
				clearInterval(index);
				const nodes = text.childNodes;
				const nLength = nodes.length;
				const sLength = nLength >> 1;
				const spans = new Array(sLength);
				for (let i = 0; i < nLength; i += 2) {
					spans[i >> 1] = nodes[i];
				}
				for (let i = 0; i < sLength; i++) {
					items[i].appendChild(spans[i]);
				}
			}
		});
	},
	createTheme: (function IIFE() {
		interface EditorThemeData {
			base: 'vs' | 'vs-dark';
			inherit: boolean;
			rules: Array<{ token: string; foreground: string }>;
			colors: Record<string, string>;
		}
		const themeData: Record<string, EditorThemeData | null> = {
			light: {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: '', foreground: '#000000' },
					{ token: 'comment', foreground: '#008e00' },
					{ token: 'string', foreground: '#d01515' },
					{ token: 'string-bracket', foreground: '#0000c0' },
					{ token: 'string-escape', foreground: '#a000e6' },
					{ token: 'string-invalid', foreground: '#ff0000' },
					{ token: 'number', foreground: '#f06000' },
					{ token: 'property', foreground: '#000000' },
					{ token: 'function', foreground: '#ff0080' },
					{ token: 'class', foreground: '#000000' },
					{ token: 'regexp', foreground: '#d01515' },
					{ token: 'regexp-bracket', foreground: '#0000c0' },
					{ token: 'regexp-escape', foreground: '#a000e6' },
					{ token: 'regexp-escape-control', foreground: '#585cf6' },
					{ token: 'regexp-escape-end', foreground: '#ff8000' },
					{ token: 'regexp-range', foreground: '#0060a0' },
					{ token: 'regexp-invalid', foreground: '#ff0000' },
					{ token: 'regexp-flag', foreground: '#40a0ff' },
					{ token: 'keyword', foreground: '#c800a4' },
					{ token: 'keyword-declaration', foreground: '#c800a4' },
					{ token: 'keyword-operation', foreground: '#c800a4' },
					{ token: 'keyword-constant', foreground: '#0020e0' },
					{ token: 'keyword-builtin', foreground: '#0020e0' },
					{ token: 'keyword-highlight', foreground: '#000000' },
					{ token: 'identifier', foreground: '#1818c0' },
					{ token: 'identifier-global', foreground: '#000000' },
					{ token: 'flag', foreground: '#585cf6' },
					{ token: 'operator', foreground: '#c800a4' },
					{ token: 'delimiter', foreground: '#000000' },
					{ token: 'delimiter-bracket', foreground: '#000000' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#ff0000'
					}
				],
				colors: {
					'editor.background': '#ffffff',
					'editorWidget.background': '#f0f0f0',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#f0f0f0',
					'editorHoverWidget.border': '#c0c0c0',
					'editorCursor.foreground': '#000000',
					'editor.wordHighlightStrongBackground': '#c0ffe080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#add6ff',
					'editor.inactiveSelectionBackground': '#e5ebf1',
					'editor.findMatchBackground': '#80ff80',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#f0f0f0',
					'editorSuggestWidget.border': '#c0c0c0',
					'editorIndentGuide.background': '#f0f0f0',
					'editorIndentGuide.activeBackground': '#e0e0e0',
					'editorLineNumber.foreground': '#a0a0a0',
					'editorLineNumber.activeForeground': '#404040',
					'dropdown.background': '#ffffff',
					'menu.border': '#c0c0c0',
					'input.background': '#ffffff',
					'input.foreground': '#000000',
					'input.border': '#c0c0c0',
					'widget.shadow': '#00000000',
					focusBorder: '#0050a0',
					contrastBorder: '#c0c0c0',
					'list.activeSelectionBackground': '#e6f3ff',
					'list.activeSelectionForeground': '#000000',
					'list.highlightForeground': '#b00080',
					'list.focusHighlightForeground': '#b00080'
				}
			},
			dark: {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: '', foreground: '#dad6cd' },
					{ token: 'comment', foreground: '#608b4e' },
					{ token: 'string', foreground: '#a9d157' },
					{ token: 'string-bracket', foreground: '#e882b2' },
					{ token: 'string-escape', foreground: '#797be6' },
					{ token: 'string-invalid', foreground: '#f44747' },
					{ token: 'number', foreground: '#99cc66' },
					{ token: 'property', foreground: '#dad6cd' },
					{ token: 'function', foreground: '#e8dcaa' },
					{ token: 'class', foreground: '#4ec9b0' },
					{ token: 'regexp', foreground: '#a9d157' },
					{ token: 'regexp-bracket', foreground: '#e882b2' },
					{ token: 'regexp-escape', foreground: '#797be6' },
					{ token: 'regexp-escape-control', foreground: '#5bdbb1' },
					{ token: 'regexp-escape-end', foreground: '#cb6a27' },
					{ token: 'regexp-range', foreground: '#37aae4' },
					{ token: 'regexp-invalid', foreground: '#f44747' },
					{ token: 'regexp-flag', foreground: '#00d2e5' },
					{ token: 'keyword', foreground: '#569cd6' },
					{ token: 'keyword-declaration', foreground: '#569cd6' },
					{ token: 'keyword-operation', foreground: '#3e8f9a' },
					{ token: 'keyword-constant', foreground: '#3299cc' },
					{ token: 'keyword-builtin', foreground: '#6d9cbe' },
					{ token: 'keyword-highlight', foreground: '#7aca3c' },
					{ token: 'identifier', foreground: '#b0e0e6' },
					{ token: 'identifier-global', foreground: '#9ed34e' },
					{ token: 'flag', foreground: '#00d2e5' },
					{ token: 'operator', foreground: '#3e8f9a' },
					{ token: 'delimiter', foreground: '#dad6cd' },
					{ token: 'delimiter-bracket', foreground: '#dad6cd' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#f44747'
					}
				],
				colors: {
					'editor.background': '#18191a',
					'editorWidget.background': '#242628',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#1c1e20',
					'editorHoverWidget.border': '#101010',
					'editorCursor.foreground': '#ffffff',
					'editor.wordHighlightStrongBackground': '#0060a080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#5a286f',
					'editor.inactiveSelectionBackground': '#7e668a',
					'editor.findMatchBackground': '#4030c0',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#1c1e20',
					'editorSuggestWidget.border': '#101010',
					'editorIndentGuide.background': '#2c2c2c',
					'editorIndentGuide.activeBackground': '#3c3c3c',
					'editorLineNumber.foreground': '#7d7b77',
					'editorLineNumber.activeForeground': '#bebcb8',
					'dropdown.background': '#1c1e20',
					'dropdown.foreground': '#d8d8d8',
					'menu.border': '#101010',
					'input.background': '#161718',
					'input.foreground': '#d8d8d8',
					'input.border': '#000000',
					'widget.shadow': '#00000000',
					focusBorder: '#0080ff',
					contrastBorder: '#101010',
					'list.activeSelectionBackground': '#303234',
					'list.activeSelectionForeground': '#d4d4d4',
					'list.highlightForeground': '#80e0e0',
					'list.focusHighlightForeground': '#80e0e0'
				}
			}
		};
		return async function (theme: string) {
			const monaco = await getMonaco();
			const options = themeData[theme];
			if (options instanceof Object && monaco instanceof Object) {
				monaco.editor.defineTheme(theme, options);
				themeData[theme] = null;
			}
		};
	})()
});
