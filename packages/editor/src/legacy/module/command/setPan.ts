import { $ } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setPan = new CommandSchema({
	name: 'setPan',
	fields: [
		{ key: 'type', default: 'bgm' },
		{ key: 'pan', default: 0 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setPan-confirm').on('click', () => this.save());
		$('#setPan-type').loadItems([
			{ name: 'BGM', value: 'bgm' },
			{ name: 'BGS', value: 'bgs' },
			{ name: 'CV', value: 'cv' },
			{ name: 'SE', value: 'se' }
		]);
		$('#setPan-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#setPan').on('open', function (event: any) {
			$('#setPan-easingId').loadItems(Data.createEasingItems());
		});
		$('#setPan').on('closed', function (event: any) {
			clear($('#setPan-easingId'));
		});
	},
	customParse({ type, pan, easingId, duration, wait }: any) {
		const words = Command.words
			.push(Command.parseAudioType(type))
			.push(Command.parseVariableNumber(pan))
			.push(Command.parseEasing(easingId, duration, wait));
		return [
			{ color: 'audio' },
			{ text: Local.get('command.setPan') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setPan-type'));
	}
});
