import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

export interface CallEventArg {
	type: string;
	key: string;
	value?: unknown;
	note?: string;
}

export interface CallEventMeta {
	parameters: CallEventArg[];
	[k: string]: unknown;
}

export interface CallEventResultData {
	type: string;
	variable?: { type: string; key: string };
}

Command.cases.callEvent = new CommandSchema({
	name: 'callEvent',
	fields: [
		{ key: 'type', default: 'global' },
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'skill', default: { type: 'trigger' } },
		{ key: 'state', default: { type: 'trigger' } },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'item', default: { type: 'trigger' } },
		{ key: 'light', default: { type: 'trigger' } },
		{ key: 'element', default: { type: 'trigger' } },
		{ key: 'eventId', default: '' },
		{ key: 'eventType', default: '' },
		{ key: 'eventArgs', default: [] },
		{ key: 'eventResult', default: { type: 'none' } }
	],
	parseEventArgs(event: CallEventMeta, args: CallEventArg[]) {
		const words = Command.words;
		if (event) {
			const flags = {} as Record<string, boolean>;
			const parameters = event.parameters;
			outer: for (const { type, key, note } of parameters) {
				const name = note ? Command.setTooltip!(`<b>${key}</b>\n${note}`) + key : key;
				for (const arg of args) {
					if (arg.key === key && arg.type === type) {
						if (key in flags) {
							continue;
						}
						flags[key] = true;
						words.push(name + Token(' = ') + this.parseEventArgInput!(arg));
						continue outer;
					}
				}
				const info = `${Command.setClass('error')}${name}${
					Token(': ') + Command.setWeakColor!(Local.get!('eventParameterTypes.' + type))
				}`;
				words.push(info);
			}
		}
		let info = words.join();
		if (info) info = `(${info})`;
		return info;
	},
	parseEventArgInput(arg: CallEventArg) {
		switch (arg.type) {
			case 'boolean':
				return Command.setBooleanColor!(arg.value!.toString());
			case 'number':
				return Command.parseVariableNumber!(arg.value);
			case 'string':
				return Command.parseVariableTemplate!(arg.value, 40);
			case 'object':
				return Command.parseVariable!(arg.value, 'object');
			case 'actor':
				return Command.parseActor!(arg.value);
			case 'skill':
				return Command.parseSkill!(arg.value);
			case 'state':
				return Command.parseState!(arg.value);
			case 'equipment':
				return Command.parseEquipment!(arg.value);
			case 'item':
				return Command.parseItem!(arg.value);
			case 'trigger':
				return Command.parseTrigger!(arg.value);
			case 'light':
				return Command.parseLight!(arg.value);
			case 'element':
				return Command.parseElement!(arg.value);
		}
	},
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
		eventArgs,
		eventResult,
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
		eventId: string;
		eventArgs: unknown;
		eventResult: { type: string; variable: unknown };
		eventType: unknown;
	}) {
		const words = Command.words;
		switch (type) {
			case 'global': {
				if (eventArgs === undefined) {
					eventArgs = [];
				}
				if (eventResult === undefined) {
					eventResult = { type: 'none', variable: undefined };
				}
				let leftValue = '';
				let eventName = Command.parseFileName!(eventId);
				const event = Data.events[eventId!];
				if (!event) break;
				switch (eventResult.type) {
					case 'none':
						if (event.returnType !== 'none') {
							leftValue = Command.setVariableColor!('?');
						}
						break;
					case 'boolean':
					case 'number':
					case 'string':
						leftValue = Command.parseVariable!(
							eventResult.variable,
							eventResult.type,
							true
						);
						break;
					case 'object':
						leftValue = Command.parseVariable!(eventResult.variable, 'object', true);
						break;
					case 'actor':
					case 'skill':
					case 'state':
					case 'equipment':
					case 'item':
					case 'trigger':
					case 'light':
					case 'element':
						leftValue = Command.parseVariable!(eventResult.variable, 'object', true);
						break;
				}
				if (leftValue) {
					if (eventResult.type !== event.returnType) {
						leftValue = Command.setClass('error') + leftValue;
					}
					leftValue += Token(' = ');
				}
				if (event.description) {
					eventName =
						Command.setTooltip!(
							`<b>${Command.removeTextTags!(eventName)}</b>\n${event.description}`
						) + eventName;
				}
				words.push(leftValue + eventName + this.parseEventArgs!(event, eventArgs));
				break;
			}
			case 'inherited':
				words.push(Local.get!('command.callEvent.inherited'));
				break;
			case 'scene':
				words.push(Local.get!('command.callEvent.scene'));
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
		const contents: Record<string, unknown>[] = [
			{ color: 'flow' },
			{ text: Local.get!('command.callEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
		if (type === 'global') {
			contents.unshift({ class: 'parent:global-event' });
		}
		return contents;
	}
});
