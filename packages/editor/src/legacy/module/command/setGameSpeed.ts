import { $ } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setGameSpeed = new CommandSchema({
	name: 'setGameSpeed',
	fields: [
		{ key: 'speed', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setGameSpeed-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#setGameSpeed').on('open', function (event: Event) {
			$('#setGameSpeed-easingId').loadItems(Data.createEasingItems!());
		});
		$('#setGameSpeed').on('closed', function (event: Event) {
			clear($('#setGameSpeed-easingId'));
		});
	},
	customParse({
		speed,
		easingId,
		duration,
		wait
	}: {
		speed: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseVariableNumber!(speed))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'system' },
			{ text: Local.get!('command.setGameSpeed') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setGameSpeed-speed'), 'all');
	}
});
