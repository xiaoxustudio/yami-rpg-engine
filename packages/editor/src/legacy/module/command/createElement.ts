import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { PresetElement } from '@app/legacy/tools/preset-element-window.ts';

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
