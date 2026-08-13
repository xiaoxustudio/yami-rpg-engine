import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus } from '@/util/element-utils';
import { getButtonName } from '@app/components/common/gamepad-button-name';
import { Command } from './command-object.ts';
import { IfCondition } from './conditional-condition-window.ts';
import { Token } from './mark-string-manager.ts';
import { VariableGetter } from './variable-accessor-window.ts';
import { Local } from '@/tools/localization.ts';

export interface SwitchConditionData {
	type:
		| 'none'
		| 'boolean'
		| 'number'
		| 'string'
		| 'attribute'
		| 'enum'
		| 'keyboard'
		| 'gamepad'
		| 'mouse'
		| 'variable';
	value?: boolean | number | string;
	attributeId?: string;
	stringId?: string;
	keycode?: string;
	button?: number;
	variable?: { type: string; key: string };
}

interface SwitchConditionTarget {
	save: () => SwitchConditionData;
}

interface SwitchConditionShape {
	target: SwitchConditionTarget | null;
	initialize: (() => void) | null;
	parse: ((condition: SwitchConditionData, listData?: boolean) => string) | null;
	open: ((condition?: SwitchConditionData) => void) | null;
	save: (() => SwitchConditionData) | null;
	confirm: ((event: Event) => SwitchConditionData) | null;
}

export const SwitchCondition: SwitchConditionShape = {
	target: null,
	initialize: null,
	parse: null,
	open: null,
	save: null,
	confirm: null
};

SwitchCondition.initialize = function (this: typeof SwitchCondition): void {
	if (!$('#switch-condition-type')) return;
	$('#switch-condition-type').loadItems([
		{ name: 'None', value: 'none' },
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Attribute Key', value: 'attribute' },
		{ name: 'Enum String', value: 'enum' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'Variable', value: 'variable' }
	]);

	$('#switch-condition-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'boolean',
				targets: [$('#switch-condition-boolean-value')]
			},
			{ case: 'number', targets: [$('#switch-condition-number-value')] },
			{ case: 'string', targets: [$('#switch-condition-string-value')] },
			{
				case: 'attribute',
				targets: [$('#switch-condition-attribute-attributeId')]
			},
			{ case: 'enum', targets: [$('#switch-condition-enum-stringId')] },
			{
				case: 'keyboard',
				targets: [$('#switch-condition-keyboard-keycode')]
			},
			{
				case: 'gamepad',
				targets: [$('#switch-condition-gamepad-button')]
			},
			{ case: 'mouse', targets: [$('#switch-condition-mouse-button')] },
			{
				case: 'variable',
				targets: [$('#switch-condition-variable-variable')]
			}
		]);

	$('#switch-condition-boolean-value').loadItems([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	$('#switch-condition-mouse-button').loadItems([
		{ name: 'Left Button', value: 0 },
		{ name: 'Middle Button', value: 1 },
		{ name: 'Right Button', value: 2 },
		{ name: 'Back Button', value: 3 },
		{ name: 'Forward Button', value: 4 }
	]);
};

SwitchCondition.parse = function (
	this: typeof SwitchCondition,
	condition: SwitchConditionData,
	listData?: boolean
): string {
	let string: string;
	switch (condition.type) {
		case 'none':
			string = Token('null');
			break;
		case 'boolean':
			string = Command.setBooleanColor!(condition.value!.toString());
			break;
		case 'number':
			string = Command.setNumberColor!(condition.value!.toString());
			break;
		case 'string':
			string = Command.setStringColor!(`"${Command.parseMultiLineString!(condition.value)}"`);
			break;
		case 'attribute':
			string = Command.parseAttributeTag!(condition.attributeId!, 'string');
			break;
		case 'enum':
			string = Command.parseEnumStringTag!(condition.stringId!);
			break;
		case 'keyboard': {
			const key = condition.keycode!;
			const keyboard = Local.get!('command.switch.keyboard');
			string = keyboard + Token('[') + Command.setStringColor!(key) + Token(']');
			break;
		}
		case 'gamepad': {
			const button = getButtonName(condition.button!);
			const gamepad = Local.get!('command.switch.gamepad');
			string = gamepad + Token('[') + Command.setStringColor!(button) + Token(']');
			break;
		}
		case 'mouse': {
			const button = IfCondition.parseMouseButton!(condition.button!);
			const mouse = Local.get!('command.switch.mouse');
			string = mouse + Token('[') + Command.setStringColor!(button) + Token(']');
			break;
		}
		case 'variable':
			string = Command.parseVariable!(condition.variable!, 'any');
			break;
	}
	if (listData) {
		string = Command.removeTextTags!(string);
	}
	return string;
};

SwitchCondition.open = function (
	this: typeof SwitchCondition,
	condition: SwitchConditionData = { type: 'number', value: 0 }
): void {
	Window.open!('switch-condition');
	let booleanValue = false;
	let numberValue = 0;
	let stringValue = '';
	let attributeId = '';
	let enumStringId = '';
	let keyboardKeycode = '';
	let gamepadButton = -1;
	let mouseButton = 0;
	let variableVariable = { type: 'local', key: '' };
	const write = getElementWriter('switch-condition');
	switch (condition.type) {
		case 'none':
			break;
		case 'boolean':
			booleanValue = condition.value! as boolean;
			break;
		case 'number':
			numberValue = condition.value! as number;
			break;
		case 'string':
			stringValue = condition.value! as string;
			break;
		case 'attribute':
			attributeId = condition.attributeId!;
			break;
		case 'enum':
			enumStringId = condition.stringId!;
			break;
		case 'keyboard':
			keyboardKeycode = condition.keycode!;
			break;
		case 'gamepad':
			gamepadButton = condition.button!;
			break;
		case 'mouse':
			mouseButton = condition.button!;
			break;
		case 'variable':
			variableVariable = condition.variable!;
			break;
	}
	write('type', condition.type);
	write('boolean-value', booleanValue);
	write('number-value', numberValue);
	write('string-value', stringValue);
	write('attribute-attributeId', attributeId);
	write('enum-stringId', enumStringId);
	write('keyboard-keycode', keyboardKeycode);
	write('gamepad-button', gamepadButton);
	write('mouse-button', mouseButton);
	write('variable-variable', variableVariable);
	getFocus($('#switch-condition-type'));
};

SwitchCondition.save = function (this: typeof SwitchCondition): SwitchConditionData {
	const read = getElementReader('switch-condition');
	const type = read('type') as SwitchConditionData['type'];
	let condition: SwitchConditionData | undefined;
	switch (type) {
		case 'none':
			condition = { type };
			break;
		case 'boolean': {
			const value = read('boolean-value');
			condition = { type, value };
			break;
		}
		case 'number': {
			const value = read('number-value');
			condition = { type, value };
			break;
		}
		case 'string': {
			const value = read('string-value');
			condition = { type, value };
			break;
		}
		case 'attribute': {
			const attributeId = read('attribute-attributeId') as string;
			if (attributeId === '') {
				return getFocus(
					$('#switch-condition-attribute-attributeId')
				) as unknown as SwitchConditionData;
			}
			condition = { type, attributeId };
			break;
		}
		case 'enum': {
			const stringId = read('enum-stringId') as string;
			if (stringId === '') {
				return getFocus(
					$('#switch-condition-enum-stringId')
				) as unknown as SwitchConditionData;
			}
			condition = { type, stringId };
			break;
		}
		case 'keyboard': {
			const keycode = read('keyboard-keycode') as string;
			if (keycode === '') {
				return getFocus(
					$('#switch-condition-keyboard-keycode')
				) as unknown as SwitchConditionData;
			}
			condition = { type, keycode };
			break;
		}
		case 'gamepad': {
			const button = read('gamepad-button') as number;
			if (button === -1) {
				return getFocus(
					$('#switch-condition-gamepad-button')
				) as unknown as SwitchConditionData;
			}
			condition = { type, button };
			break;
		}
		case 'mouse': {
			const button = read('mouse-button');
			condition = { type, button };
			break;
		}
		case 'variable': {
			const variable = read('variable-variable') as {
				type: string;
				key: string;
			};
			if (VariableGetter.isNone!(variable)) {
				return getFocus(
					$('#switch-condition-variable-variable')
				) as unknown as SwitchConditionData;
			}
			condition = { type, variable };
			break;
		}
	}
	Window.close!('switch-condition');
	return condition!;
};

SwitchCondition.confirm = function (
	this: typeof SwitchCondition,
	event: Event
): SwitchConditionData {
	return SwitchCondition.target!.save();
};
