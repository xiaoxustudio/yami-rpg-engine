import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.waitForVideo = new CommandSchema({
	name: 'waitForVideo',
	fields: [{ key: 'element', domId: 'element', default: { type: 'trigger' } }],
	customParse({ element }: any) {
		return [
			{ color: 'element' },
			{ text: Local.get!('command.waitForVideo') + Token(': ') },
			{ text: Command.parseElement(element) }
		];
	},
	onLoad() {
		getFocus($('#waitForVideo-element'));
	}
});
