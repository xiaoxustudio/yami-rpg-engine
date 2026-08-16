import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';

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
			{ text: Local.get!('command.createElement') + Token(': ') },
			{ text: info }
		];
	}
});
