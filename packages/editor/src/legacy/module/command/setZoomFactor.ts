import { $ } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setZoomFactor = new CommandSchema({
	name: 'setZoomFactor',
	fields: [
		{ key: 'zoom', default: 1 },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setZoomFactor-wait')?.loadItems?.([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#setZoomFactor')?.on?.('open', function (event: Event) {
			$('#setZoomFactor-easingId')?.loadItems?.(Data.createEasingItems!());
		});
		$('#setZoomFactor')?.on?.('closed', function (event: Event) {
			clear($('#setZoomFactor-easingId'));
		});
	},
	customParse({
		zoom,
		easingId,
		duration,
		wait
	}: {
		zoom: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseVariableNumber!(zoom))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.setZoomFactor') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setZoomFactor-zoom'), 'all');
	}
});
