import { $ } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setAngle = new CommandSchema({
	name: 'setAngle',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'angle', default: { type: 'absolute', degrees: 0 } },
		{ key: 'easingId', default: () => Data.easings[0].id },
		{ key: 'duration', default: 0 },
		{ key: 'wait', default: false }
	],
	onInitialize() {
		$('#setAngle-confirm').on('click', () => this.save!());
		$('#setAngle-wait').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
		$('#setAngle').on('open', function (event: Event) {
			$('#setAngle-easingId').loadItems(Data.createEasingItems!());
		});
		$('#setAngle').on('closed', function (event: Event) {
			clear($('#setAngle-easingId'));
		});
	},
	customParse({
		actor,
		angle,
		easingId,
		duration,
		wait
	}: {
		actor: unknown;
		angle: unknown;
		easingId: unknown;
		duration: unknown;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseAngle!(angle))
			.push(Command.parseEasing!(easingId, duration, wait));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.setAngle') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setAngle-actor'));
	}
});
