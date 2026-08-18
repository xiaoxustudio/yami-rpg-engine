import { getElementReader, getElementWriter } from '@app/legacy/util/dom.ts';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { getButtonName } from '@app/components/common/gamepad-button-name';
import { Command } from '@app/legacy/command/command-object.ts';
import { IfCondition } from '@app/legacy/command/conditional-condition-window.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Local } from '@app/legacy/tools/localization.ts';

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

export interface SwitchConditionShape {
	target: SwitchConditionTarget | null;
	initialize: (() => void) | null;
	parse: ((condition: SwitchConditionData, listData?: boolean) => string) | null;
	open: ((condition?: SwitchConditionData) => void) | null;
	save: (() => SwitchConditionData) | null;
	confirm: ((event: Event) => SwitchConditionData) | null;
}

let target: SwitchConditionTarget | null = null;
let instance: SwitchConditionShape | null = null;

const parse = (condition: SwitchConditionData, listData?: boolean): string => {
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

const open = (condition: SwitchConditionData = { type: 'number', value: 0 }): void => {
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
	getFocus(document.getElementById('switch-condition-type'));
};

const save = (): SwitchConditionData => {
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
					document.getElementById('switch-condition-attribute-attributeId')
				) as unknown as SwitchConditionData;
			}
			condition = { type, attributeId };
			break;
		}
		case 'enum': {
			const stringId = read('enum-stringId') as string;
			if (stringId === '') {
				return getFocus(
					document.getElementById('switch-condition-enum-stringId')
				) as unknown as SwitchConditionData;
			}
			condition = { type, stringId };
			break;
		}
		case 'keyboard': {
			const keycode = read('keyboard-keycode') as string;
			if (keycode === '') {
				return getFocus(
					document.getElementById('switch-condition-keyboard-keycode')
				) as unknown as SwitchConditionData;
			}
			condition = { type, keycode };
			break;
		}
		case 'gamepad': {
			const button = read('gamepad-button') as number;
			if (button === -1) {
				return getFocus(
					document.getElementById('switch-condition-gamepad-button')
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
			const variable = read('variable-variable') as { type: string; key: string };
			if (VariableGetter.isNone!(variable)) {
				return getFocus(
					document.getElementById('switch-condition-variable-variable')
				) as unknown as SwitchConditionData;
			}
			condition = { type, variable };
			break;
		}
	}
	Window.close!('switch-condition');
	return condition!;
};

const confirm = (event: Event): SwitchConditionData => {
	return target!.save();
};

export function useSwitchConditionSchema(): SwitchConditionShape {
	if (!instance) {
		instance = {
			get target() {
				return target;
			},
			set target(value) {
				target = value;
			},
			initialize: () => undefined,
			parse,
			open,
			save,
			confirm
		};
	}
	return instance;
}
