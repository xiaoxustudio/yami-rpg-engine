import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.castSkill = new CommandSchema({
	name: 'castSkill',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'mode', default: 'by-key' },
		{ key: 'key', default: () => Enum.getDefStringId!('shortcut-key') },
		{ key: 'skillId', default: '' },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'keyVar', default: '' },
		{ key: 'wait', default: false }
	],
	customParse({
		actor,
		mode,
		key,
		skillId,
		skill,
		keyVar,
		wait
	}: {
		actor: unknown;
		mode: string;
		key: unknown;
		skillId: unknown;
		skill: unknown;
		keyVar: unknown;
		wait: unknown;
	}) {
		const words = Command.words.push(Command.parseActor!(actor));
		switch (mode) {
			case 'by-key':
				words.push(Command.parseGroupEnumString!('shortcut-key', key));
				break;
			case 'by-id':
				words.push(Command.parseFileName!(skillId));
				break;
			case 'by-skill':
				words.push(Command.parseSkill!(skill));
				break;
			case 'by-variable':
				words.push(Command.parseVariableString!(keyVar));
				break;
		}
		words.push(Command.parseWait!(wait));
		return [
			{ color: 'skill' },
			{ text: t('command.castSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});
