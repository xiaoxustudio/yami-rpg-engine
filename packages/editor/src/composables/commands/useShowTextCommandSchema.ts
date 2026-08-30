/* oxlint-disable eslint/no-restricted-properties */
import { measureText } from '@app/utils/dom';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

type ShowTextLine = { fold?: boolean; color?: string; text?: string; break?: boolean };

type ShowTextCommandData = {
	target: unknown;
	parameters: unknown;
	content: string;
};

type ShowTextCharMetrics = {
	updateCharWidth: () => void;
	latinCharWidth: number;
	otherCharWidth: number;
};

Command.cases.showText = new CommandSchema({
	name: 'showText',
	fields: [
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'parameters', default: '' },
		{ key: 'content', default: '' }
	],
	latinCharWidth: 0,
	otherCharWidth: 0,
	customParse({ target, parameters, content }: ShowTextCommandData) {
		const alias = t('command.showText.alias');
		const words = Command.words
			.push(Command.parseActor!(target))
			.push(Command.setCommaColors!(parameters));
		const contents = [
			{ fold: true },
			{ color: 'element' },
			{ text: alias + Token(': ') },
			{ color: 'gray' },
			{ color: 'save' },
			{ text: words.join() }
		];
		content = GameLocal.replace!(content);
		content = Command.parseVariableTag!(content);
		this.appendTextLines!(contents, alias, content);
		return contents;
	},
	updateCharWidth() {
		if (this.latinCharWidth === 0) {
			const latinChars = '          ';
			const otherChars = '　　　　　　　　　　';
			const font = 'var(--ym-font-mono)';
			this.latinCharWidth = measureText(latinChars, font).width / 10;
			this.otherCharWidth = measureText(otherChars, font).width / 10;
		}
	},
	appendTextLines: (function IIFE() {
		const append = (contents: ShowTextLine[], tag: string, text: string) => {
			if (contents.length === 0) {
				contents.push(
					{ color: 'element' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				);
			} else {
				contents.push(
					{ break: true },
					{ color: 'transparent' },
					{ text: tag + Token(': ') },
					{ color: 'text' },
					{ color: 'save' },
					{ text: text }
				);
			}
		};
		const textIdTag = /^\$_textId_\$(?:\S+?)_\/_\$/;
		const tooltipTag = /^\$_tooltip_\$(?:\S+?)_\/_\$/;
		const classTag = /^\$_class_\$(?:\S+?)_\/_\$/;
		const colorTag = /^\$_\S+?_\$([\s\S]*?)\$_\/_\$/;
		return function (
			this: ShowTextCharMetrics,
			contents: ShowTextLine[],
			tag: string,
			text: string
		) {
			if (!text) return;
			this.updateCharWidth!();
			const MAX_LINES = 10;
			const MAX_LINE_WIDTH = 500;
			const length = text.length;
			const { latinCharWidth } = this;
			const { otherCharWidth } = this;
			let lineCount = 0;
			let lineWidth = 0;
			let startIndex = 0;
			for (let i = 0; i < length; i++) {
				const char = text[i];
				if (char === '\n') {
					const line = text.slice(startIndex, i);
					append(contents, tag, line);
					lineWidth = 0;
					startIndex = i + 1;
					if (++lineCount === MAX_LINES) {
						break;
					}
					continue;
				}
				if (char === '$') {
					const slice = text.slice(i);
					const idMatch = slice.match(textIdTag);
					if (idMatch) {
						i += idMatch[0].length - 1;
						continue;
					}
					const tipMatch = slice.match(tooltipTag);
					if (tipMatch) {
						i += tipMatch[0].length - 1;
						continue;
					}
					const classMatch = slice.match(classTag);
					if (classMatch) {
						i += classMatch[0].length - 1;
						continue;
					}
					const colorMatch = slice.match(colorTag);
					if (colorMatch) {
						for (const char of colorMatch[1]) {
							lineWidth += char < '\xff' ? latinCharWidth : otherCharWidth;
						}
						i += colorMatch[0].length - 1;
						continue;
					}
				}
				const charWidth = char < '\xff' ? latinCharWidth : otherCharWidth;
				lineWidth += charWidth;
				if (lineWidth > MAX_LINE_WIDTH) {
					const line = text.slice(startIndex, i);
					append(contents, tag, line);
					lineWidth = charWidth;
					startIndex = i;
					if (++lineCount === MAX_LINES) {
						break;
					}
					continue;
				}
			}
			if (lineCount === MAX_LINES) {
				append(contents, tag, '......');
			} else if (lineWidth !== 0) {
				const line = text.slice(startIndex, length);
				append(contents, tag, line);
			}
		};
	})()
});

export function useShowTextCommandSchema() {
	const { form, load, commit } = useCommandSchema('showText', {
		onLoad(params) {
			const content = (params.content as string) ?? '';
			if (content === '') {
				getFocus(document.getElementById('showText-target'));
			} else {
				getFocus(document.getElementById('showText-content'));
			}
		}
	});
	const onSave = (): void => {
		const content = read(document.getElementById('showText-content')) ?? form.content;
		if (content === '') {
			getFocus(document.getElementById('showText-content'));
			return;
		}
		commit({
			target: read(document.getElementById('showText-target')) ?? form.target,
			parameters: read(document.getElementById('showText-parameters')) ?? form.parameters,
			content
		});
	};
	Command.cases.showText.customSave = onSave;
	return { form, save: onSave, load };
}
