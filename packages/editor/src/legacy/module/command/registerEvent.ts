import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

type RegisterEventData = {
	target: string;
	actor?: { type: string; [k: string]: unknown };
	element?: { type: string; [k: string]: unknown };
	operation: string;
	type: string;
	priority?: boolean;
	tag?: string;
	commands?: unknown[];
	namespace?: boolean;
};

Command.cases.registerEvent = new CommandSchema({
	name: 'registerEvent',
	customParse({
		target,
		actor,
		element,
		operation,
		type,
		priority,
		tag,
		commands,
		namespace
	}: RegisterEventData) {
		const words = Command.words;
		switch (target) {
			case 'global':
				switch (operation) {
					case 'register': {
						const priorityFlag = priority ? Command.setOperatorColor!('*') : '';
						const tagName = tag
							? Token('(') + Command.parseVariableString!(tag) + Token(')')
							: '';
						words.push(
							Command.parseEventType!(target + '-event', type) +
								priorityFlag +
								tagName
						);
						break;
					}
					case 'unregister': {
						const tagName = Token('(') + Command.parseVariableString!(tag) + Token(')');
						words.push(t('command.registerEvent.reset.global-event') + tagName);
						break;
					}
					case 'reset':
						words.push(t('command.registerEvent.reset.global-events'));
						break;
				}
				break;
			case 'actor':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseActor!(actor));
						words.push(Command.parseEventType!(target + '-event', type));
						break;
					case 'reset':
						words.push(
							Command.parseActor!(actor) +
								Token(' -> ') +
								t('command.registerEvent.reset.events')
						);
						break;
				}
				break;
			case 'element':
				switch (operation) {
					case 'register':
					case 'unregister':
						words.push(Command.parseElement!(element));
						words.push(Command.parseEventType!(target + '-event', type));
						break;
					case 'reset':
						words.push(
							Command.parseElement!(element) +
								Token(' -> ') +
								t('command.registerEvent.reset.events')
						);
						break;
				}
				break;
		}
		if (operation === 'register' && namespace) {
			words.push(t('command.registerEvent.namespace'));
		}

		const contents: Array<{
			fold?: boolean;
			color?: string;
			text?: string;
			children?: unknown;
			break?: boolean;
		}> = [
			{ color: 'flow' },
			{
				text: t('command.registerEvent.alias.' + operation) + Token(': ')
			},
			{ text: words.join() }
		];
		if (commands) {
			contents.unshift({ fold: true });
			contents.push(
				{ children: commands },
				{ color: 'flow' },
				{ text: t('command.registerEvent.end') }
			);
		}
		return contents;
	}
});
