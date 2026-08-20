import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';
import { getFocus, read } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.stopEvent = new CommandSchema({
	name: 'stopEvent',
	fields: [
		{ key: 'type', default: 'current' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'light', default: { type: 'trigger' } },
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'eventId', default: '' },
		{ key: 'eventType', default: '' }
	],
	customParse({
		type,
		actor,
		skill,
		state,
		equipment,
		item,
		light,
		element,
		eventId,
		eventType
	}: {
		type: string;
		actor: unknown;
		skill: unknown;
		state: unknown;
		equipment: unknown;
		item: unknown;
		light: unknown;
		element: unknown;
		eventId: unknown;
		eventType: unknown;
	}) {
		if (type === undefined) {
			type = 'current';
		}
		const words = Command.words;
		switch (type) {
			case 'current':
				words.push(t('command.stopEvent.current'));
				break;
			case 'global':
				words.push(Command.parseFileName!(eventId));
				break;
			case 'scene':
				words.push(t('command.stopEvent.scene'));
				break;
			case 'actor':
				words.push(Command.parseActor!(actor));
				break;
			case 'skill':
				words.push(Command.parseSkill!(skill));
				break;
			case 'state':
				words.push(Command.parseState!(state));
				break;
			case 'equipment':
				words.push(Command.parseEquipment!(equipment));
				break;
			case 'item':
				words.push(Command.parseItem!(item));
				break;
			case 'light':
				words.push(Command.parseLight!(light));
				break;
			case 'element':
				words.push(Command.parseElement!(element));
				break;
		}
		if (eventType) {
			words.push(Command.parseEventType!(type + '-event', eventType));
		}
		return [
			{ color: 'flow' },
			{ text: t('command.stopEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useStopEventCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('stopEvent', {
		onLoad() {
			getFocus(document.getElementById('stopEvent-type'));
		}
	});
	const onSave = (): void => {
		const type = read(document.getElementById('stopEvent-type')) ?? form.type;
		switch (type) {
			case 'current':
				commit({ type });
				break;
			case 'global': {
				const eventId = read(document.getElementById('stopEvent-eventId')) ?? form.eventId;
				if (eventId === '') {
					getFocus(document.getElementById('stopEvent-eventId'));
					return;
				}
				commit({ type, eventId });
				break;
			}
			case 'scene': {
				const eventType =
					read(document.getElementById('stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus(document.getElementById('stopEvent-eventType'));
					return;
				}
				commit({ type, eventType });
				break;
			}
			default: {
				const target = read(document.getElementById('stopEvent-' + type)) ?? form[type];
				const eventType =
					read(document.getElementById('stopEvent-eventType')) ?? form.eventType;
				if (eventType === '') {
					getFocus(document.getElementById('stopEvent-eventType'));
					return;
				}
				commit({
					type,
					[type]: target,
					eventType
				});
				break;
			}
		}
	};
	Command.cases.stopEvent.customSave = onSave;
	return { form, save: onSave, load };
}
