/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read, write } from '@app/utils/element-utils';
import { addClass, hide, setTooltip, show } from '@app/utils/element-utils';
import { createTextAreaVar } from '@app/components/textarea-var.ts';
import { Command } from '@app/commands/command-object.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { createCustomBox } from '@app/components/custom-box.ts';
import { createNumberVar } from '@app/components/number-var.ts';
import { createSelectBox } from '@app/components/select-box.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { t } from '@app/i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { h, render } from 'vue';

interface CallEventArg {
	type: string;
	key: string;
	value?: unknown;
	note?: string;
}

interface CallEventMeta {
	parameters: CallEventArg[];
	[k: string]: unknown;
}

interface CallEventResultData {
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
					Token(': ') + Command.setWeakColor!(t('eventParameterTypes.' + type))
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
				// oxlint-disable-next-line no-base-to-string
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
				words.push(t('command.callEvent.inherited'));
				break;
			case 'scene':
				words.push(t('command.callEvent.scene'));
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
			{ text: t('command.callEvent.alias') + Token(': ') },
			{ text: words.join() }
		];
		if (type === 'global') {
			contents.unshift({ class: 'parent:global-event' });
		}
		return contents;
	}
});

interface CallEventInputApi {
	loadItems?(items: unknown[]): void;
	numBox?: { input?: HTMLInputElement; decimals?: number };
	strBox?: HTMLElement | null;
	type?: string | null;
	filter?: string | null;
	on?(type: string, listener: (event: Event) => void): void;
}

interface CallEventParameter {
	key: string;
	type: string;
	label: HTMLElement;
	input: HTMLElement & CallEventInputApi;
}

interface CallEventResultEl {
	type: string;
	label: HTMLElement;
	input: HTMLElement & CallEventInputApi;
}

export function useCallEventCommandSchema() {
	const { form, load, commit } = useCommandSchema('callEvent');
	let parameters: CallEventParameter[] = [];
	let eventResult: CallEventResultEl | null = null;
	let pendingArgs: CallEventArg[] | null = [];

	const getGridBox = (): HTMLElement | null =>
		(document.getElementById('callEvent')?.querySelector('.grid-box') as HTMLElement | null) ??
		null;

	const resizeWindow = (): void => {
		const frame = document.getElementById('callEvent');
		const gridBox = getGridBox();
		if (frame && gridBox) {
			frame.style.height = `${gridBox.clientHeight + 78}px`;
		}
	};
	const clearGlobalEventElements = (): void => {
		for (const { label, input } of parameters) {
			if (input.strBox) {
				Selection.removeEventListeners!(input.strBox as HTMLTextAreaElement);
			}
			label.remove();
			input.remove();
		}
		parameters.length = 0;
		if (eventResult) {
			eventResult.label.remove();
			eventResult.input!.remove();
			eventResult = null;
		}
	};
	const getDefaultArgValue = (type: string): unknown => {
		switch (type) {
			case 'boolean':
				return false;
			case 'number':
				return 0;
			case 'string':
				return '';
			case 'object':
				return { type: 'local', key: '' };
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				return { type: 'trigger' };
		}
	};
	const createParameterElements = (parameter: CallEventArg): void => {
		const { type, key, note } = parameter;
		const name = key ? key.charAt(0).toUpperCase() + key.slice(1) : '';
		const label = document.createElement('div');
		render(h('div', { class: 'text call-event-component' }, name), label);
		const labelEl = label.firstElementChild as HTMLElement;
		let input: HTMLElement & CallEventInputApi = null as unknown as HTMLElement &
			CallEventInputApi;
		switch (type) {
			case 'boolean':
				input = createSelectBox() as unknown as HTMLElement & CallEventInputApi;
				input.loadItems([
					{ name: 'False', value: false },
					{ name: 'True', value: true }
				]);
				break;
			case 'number':
				input = createNumberVar();
				input.numBox!.input!.min = '-1000000000';
				input.numBox!.input!.max = '1000000000';
				input.numBox!.decimals = 10;
				break;
			case 'string':
				input = createTextAreaVar();
				input.strBox!.setAttribute(
					'menu',
					'tag-local-var tag-global-var tag-dynamic-global-var tag-localization'
				);
				addClass(input, 'callEvent-argument-string');
				input.on!('change', () => resizeWindow());
				Selection.addEventListeners!(input.strBox!);
				break;
			case 'object':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'object';
				break;
			case 'actor':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'actor';
				break;
			case 'skill':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'skill';
				break;
			case 'state':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'state';
				break;
			case 'equipment':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'equipment';
				break;
			case 'item':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'item';
				break;
			case 'trigger':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'trigger';
				break;
			case 'light':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'light';
				break;
			case 'element':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'element';
				break;
		}
		if (note) {
			setTooltip(input, `<b>${name}</b>\n${note}`);
		}
		addClass(input, 'call-event-component');
		const gridBox = getGridBox();
		if (!gridBox) return;
		gridBox.appendChild(labelEl);
		gridBox.appendChild(input);
		parameters.push({ key, type, label: labelEl, input });
	};
	const createEventResultElements = (type: string): void => {
		let input: HTMLElement & CallEventInputApi = null as unknown as HTMLElement &
			CallEventInputApi;
		switch (type) {
			case 'none':
				return;
			case 'boolean':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'boolean';
				break;
			case 'number':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'number';
				break;
			case 'string':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'string';
				break;
			case 'object':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'object';
				break;
			case 'actor':
			case 'skill':
			case 'state':
			case 'equipment':
			case 'item':
			case 'trigger':
			case 'light':
			case 'element':
				input = createCustomBox() as unknown as HTMLElement & CallEventInputApi;
				input.type = 'variable';
				input.filter = 'object';
				break;
		}
		write(input, { type: 'local', key: '' });
		const label = document.createElement('div');
		const text = t('command.callEvent.return');
		const tip = t('command.callEvent.return.tip');
		render(h('div', { class: 'text call-event-component' }, text), label);
		const labelEl = label.firstElementChild as HTMLElement;
		setTooltip(input, `<b>${text}</b>\n${tip}`);
		addClass(input, 'call-event-component');
		const gridBox = getGridBox();
		if (!gridBox) return;
		gridBox.appendChild(labelEl);
		gridBox.appendChild(input);
		eventResult = { type, label: labelEl, input };
	};
	const writeEventArgs = (args: CallEventArg[]): void => {
		outer: for (const { type, key, input } of parameters) {
			for (const arg of args) {
				if (arg.key === key && arg.type === type) {
					write(input, arg.value);
					continue outer;
				}
			}
			write(input, getDefaultArgValue(type));
		}
	};
	const readEventArgs = (): CallEventArg[] | null => {
		const args: CallEventArg[] = [];
		for (const { type, key, input } of parameters) {
			const value = read(input);
			if (type === 'object' && VariableGetter.isNone!(value)) {
				getFocus(input);
				return null;
			}
			args.push({ type, key, value });
		}
		return args;
	};
	const writeEventResult = (data: CallEventResultData): void => {
		if (eventResult === null) return;
		if (data.type === 'none') return;
		const baseTypes = 'boolean|number|string';
		const objectTypes = 'actor|skill|state|equipment|item|trigger|light|element|any';
		if (
			data.type === eventResult.type ||
			(baseTypes.includes(data.type) &&
				baseTypes.includes(eventResult.type) &&
				data.variable!.type === 'local') ||
			(objectTypes.includes(data.type) && objectTypes.includes(eventResult.type))
		) {
			write(eventResult.input, data.variable);
		}
	};
	const readEventResult = (): CallEventResultData => {
		const data: CallEventResultData = { type: 'none' };
		if (eventResult !== null) {
			data.type = eventResult.type;
			data.variable = read(eventResult.input);
		}
		return data;
	};
	const typeWrite = (event: { value: string }): void => {
		const type = event.value;
		if (type !== 'inherited') {
			const elEventType = document.getElementById('callEvent-eventType')!;
			const source = EventEditor.types?.[type] ?? EventEditor.types?.all;
			if (!source) return;
			const eventTypes = Enum.getMergedItems!(source, type + '-event');
			elEventType.loadItems(eventTypes);
			elEventType.createTooltip();
			write(elEventType, eventTypes[0].value);
		}
		for (const element of document.querySelectorAll('.call-event-component')) {
			if (type === 'global') show(element);
			else hide(element);
		}
		resizeWindow();
	};
	const eventIdWrite = (event: { value: string }): void => {
		pendingArgs = readEventArgs();
		clearGlobalEventElements();
		const id = event.value;
		if (id) {
			const globalEvent = Data.events?.[id];
			if (globalEvent) {
				const flags = {} as Record<string, boolean>;
				for (const parameter of globalEvent.parameters) {
					if (parameter.key in flags) {
						continue;
					}
					flags[parameter.key] = true;
					createParameterElements(parameter);
				}
				createEventResultElements(globalEvent.returnType);
			}
		}
		resizeWindow();
	};
	const eventIdInput = (_event: { value: string }): void => {
		if (pendingArgs) {
			writeEventArgs(pendingArgs);
		}
	};
	const onLoad = (params: Record<string, unknown>): void => {
		load({
			type: params.type ?? 'global',
			actor: params.actor ?? { type: 'trigger' },
			skill: params.skill ?? { type: 'trigger' },
			state: params.state ?? { type: 'trigger' },
			equipment: params.equipment ?? { type: 'trigger' },
			item: params.item ?? { type: 'trigger' },
			light: params.light ?? { type: 'trigger' },
			element: params.element ?? { type: 'trigger' },
			eventId: params.eventId ?? '',
			eventType: params.eventType ?? '',
			eventArgs: params.eventArgs ?? [],
			eventResult: params.eventResult ?? { type: 'none' }
		});
		writeEventArgs((params.eventArgs ?? []) as CallEventArg[]);
		writeEventResult((params.eventResult ?? { type: 'none' }) as CallEventResultData);
		getFocus(document.getElementById('callEvent-type'));
	};
	const onSave = (): void => {
		const type = (read(document.getElementById('callEvent-type')) ?? form.type) as string;
		switch (type) {
			case 'global': {
				const eventId = (read(document.getElementById('callEvent-eventId')) ??
					form.eventId) as string;
				if (eventId === '') {
					getFocus(document.getElementById('callEvent-eventId'));
					return;
				}
				const eventArgs = readEventArgs();
				if (eventArgs === null) return;
				const eventResultData = readEventResult();
				if (
					eventResultData.type !== 'none' &&
					VariableGetter.isNone!(eventResultData.variable!)
				) {
					getFocus(eventResult?.input);
					return;
				}
				commit({ type, eventId, eventArgs, eventResult: eventResultData });
				break;
			}
			case 'inherited':
				commit({ type });
				break;
			case 'scene': {
				const eventType = (read(document.getElementById('callEvent-eventType')) ??
					form.eventType) as string;
				if (eventType === '') {
					getFocus(document.getElementById('callEvent-eventType'));
					return;
				}
				commit({ type, eventType });
				break;
			}
			default: {
				const target = read(document.getElementById('callEvent-${type}')) ?? form[type];
				const eventType = (read(document.getElementById('callEvent-eventType')) ??
					form.eventType) as string;
				if (eventType === '') {
					getFocus(document.getElementById('callEvent-eventType'));
					return;
				}
				commit({ type, [type]: target, eventType });
				break;
			}
		}
	};
	const onWindowClosed = (): void => {
		pendingArgs = [];
		clearGlobalEventElements();
	};
	Command.cases.callEvent.customLoad = onLoad;
	Command.cases.callEvent.customSave = onSave;
	return {
		form,
		save: onSave,
		load: onLoad,
		typeWrite,
		eventIdWrite,
		eventIdInput,
		onWindowClosed
	};
}
