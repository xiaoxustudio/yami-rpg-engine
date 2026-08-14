import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.tintScreen = new CommandSchema({
	name: 'tintScreen',
	onInitialize() {
		$('#tintScreen-wait')?.loadItems?.([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#tintScreen')?.on?.('open', function (event: Event) {
			$('#tintScreen-easingId')?.loadItems?.(Data.createEasingItems!());
		});
		$('#tintScreen')?.on?.('closed', function (event: Event) {
			clear($('#tintScreen-easingId'));
			clear($('#tintScreen-filter'));
		});
	},
	input() {
		const read = getElementReader('tintScreen');
		write($('#tintScreen-filter'), [
			read('tint-0'),
			read('tint-1'),
			read('tint-2'),
			read('tint-3')
		]);
	},
	parseTint([red, green, blue, gray]: [any, any, any, any]) {
		const _red = Command.setNumberColor!(red);
		const _green = Command.setNumberColor!(green);
		const _blue = Command.setNumberColor!(blue);
		const _gray = Command.setNumberColor!(gray);
		return (
			Token('(') +
			_red +
			Token(', ') +
			_green +
			Token(', ') +
			_blue +
			Token(', ') +
			_gray +
			Token(')')
		);
	},
	customParse({
		tint,
		easingId,
		duration,
		wait
	}: {
		tint: [unknown, unknown, unknown, unknown];
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(this.parseTint!(tint))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'scene' },
			{ text: Local.get!('command.tintScreen') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		tint = [0, 0, 0, 0],
		easingId = Data.easings[0].id,
		duration = 0,
		wait = false
	}: {
		tint: number[];
		easingId: string;
		duration: number;
		wait: boolean;
	}) {
		const write = getElementWriter('tintScreen');
		write('tint-0', tint[0]);
		write('tint-1', tint[1]);
		write('tint-2', tint[2]);
		write('tint-3', tint[3]);
		write('filter', tint);
		write('easingId', easingId);
		write('duration', duration);
		write('wait', wait);
		getFocus($('#tintScreen-tint-0'), 'all');
	},
	customSave() {
		const read = getElementReader('tintScreen');
		const tint = [read('tint-0'), read('tint-1'), read('tint-2'), read('tint-3')];
		Command.save!({
			tint,
			easingId: read('easingId'),
			duration: read('duration'),
			wait: read('wait')
		});
	}
});
