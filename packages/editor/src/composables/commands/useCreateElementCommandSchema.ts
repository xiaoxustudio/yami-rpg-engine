/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { PresetElement } from '@app/composables/usePresetElementWindow';

Command.cases.createElement = new CommandSchema({
	name: 'createElement',
	fields: [
		{ key: 'operation', default: 'append-all-to-root' },
		{ key: 'parent', default: { type: 'trigger' } },
		{ key: 'uiId', default: '' },
		{ key: 'presetId', default: () => PresetElement.getDefaultPresetId!() }
	],
	parseUIAndNodeNames(uiId: string) {
		const uiName = Command.parseFileName!(uiId);
		const data = Data.ui[uiId];
		if (data !== undefined) {
			const words = Command.words;
			const nodes = data.nodes;
			for (const { name } of nodes) {
				if (name !== '') {
					words.push(Command.setPresetColor!(name));
				}
				if (words.count === 5) {
					break;
				}
			}
			if (words.count < nodes.length) {
				words.push(Token('...'));
			}
			return uiName + ' ' + Token('{') + words.join() + Token('}');
		}
		return uiName;
	},
	customParse({
		operation,
		parent,
		uiId,
		presetId
	}: {
		operation: string;
		parent: unknown;
		uiId: string;
		presetId: unknown;
	}) {
		let info;
		switch (operation) {
			case 'append-all-to-root':
				info = this.parseUIAndNodeNames!(uiId);
				break;
			case 'append-one-to-root':
				info = Command.parsePresetElement!(presetId);
				break;
			case 'append-all-to-element':
				info =
					Command.parseElement!(parent) + Token(' -> ') + this.parseUIAndNodeNames!(uiId);
				break;
			case 'append-one-to-element':
				info =
					Command.parseElement!(parent) +
					Token(' -> ') +
					Command.parsePresetElement!(presetId);
				break;
		}
		return [
			{ color: 'element' },
			{ text: t('command.createElement') + Token(': ') },
			{ text: info }
		];
	}
});

export function useCreateElementCommandSchema() {
	const { form, load, commit } = useCommandSchema('createElement', {
		skipWrite: true,
		onLoad() {
			requestFocus('createElement-operation', 'all');
		}
	});
	const onSave = (): void => {
		const operation = form.operation as string;
		const parent = form.parent;
		switch (operation) {
			case 'append-all-to-root': {
				const uiId = form.uiId as string;
				if (uiId === '') {
					requestFocus('createElement-uiId');
					return;
				}
				commit({ operation, uiId });
				break;
			}
			case 'append-one-to-root': {
				const presetId = form.presetId as string;
				if (presetId === '') {
					requestFocus('createElement-presetId');
					return;
				}
				commit({ operation, presetId });
				break;
			}
			case 'append-all-to-element': {
				const uiId = form.uiId as string;
				if (uiId === '') {
					requestFocus('createElement-uiId');
					return;
				}
				commit({ operation, parent, uiId });
				break;
			}
			case 'append-one-to-element': {
				const presetId = form.presetId as string;
				if (presetId === '') {
					requestFocus('createElement-presetId');
					return;
				}
				commit({ operation, parent, presetId });
				break;
			}
		}
	};
	Command.cases.createElement.customSave = onSave;
	return { form, save: onSave, load };
}
