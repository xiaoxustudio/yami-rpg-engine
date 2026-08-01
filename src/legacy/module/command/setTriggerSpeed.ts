import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTriggerSpeed = new CommandSchema({
	name: 'setTriggerSpeed',
	fields: [
		{ key: 'trigger', default: { type: 'trigger' } },
		{ key: 'speed', default: 0 }
	],
	customParse({ trigger, speed }: any) {
		const words = Command.words
			.push(Command.parseTrigger(trigger))
			.push(Command.parseVariableNumber(speed, 't/s'));
		return [
			{ color: 'skill' },
			{ text: Local.get('command.setTriggerSpeed') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#setTriggerSpeed-trigger'));
	}
});
