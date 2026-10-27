import { getWindowStore } from '@app/stores/window';
import { runWhenToolWindowReady } from '@app/tools/tool-window-host';
import { composableEls } from '@app/composables/element-registry';
import { read, write } from '@app/utils/element-utils';
import { requestFocus } from '@app/directives/focus';
import { getCommandFormsStore } from '@app/stores/command-forms';
import type { SwitchConditionType } from '@app/stores/command-forms';
import { getButtonName } from '@app/components/common/gamepad-button-name';
import {
	setBooleanColor,
	setNumberColor,
	setStringColor
} from '@app/composables/useCommandColor.ts';
import {
	parseMultiLineString,
	parseAttributeTag,
	parseEnumStringTag,
	parseVariable,
	removeTextTags
} from '@app/composables/useCommandParse.ts';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfCondition = useIfConditionSchema();
import { Token } from '@app/commands/token.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { getYamiI18n } from '@app/i18n';
import type { YamiElement } from '@app/types/element-api';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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

export interface SwitchConditionForm {
	type: SwitchConditionType;
	booleanValue: boolean;
	numberValue: number;
	stringValue: string;
	attributeId: string;
	stringId: string;
	mouseButton: number;
	variable: { type: string; key: string };
}

export const form: SwitchConditionForm = {
	get type() {
		return getCommandFormsStore().switchConditionForm.type;
	},
	set type(value: SwitchConditionType) {
		getCommandFormsStore().switchConditionForm.type = value;
	},
	get booleanValue() {
		return getCommandFormsStore().switchConditionForm.booleanValue;
	},
	set booleanValue(value: boolean) {
		getCommandFormsStore().switchConditionForm.booleanValue = value;
	},
	get numberValue() {
		return getCommandFormsStore().switchConditionForm.numberValue;
	},
	set numberValue(value: number) {
		getCommandFormsStore().switchConditionForm.numberValue = value;
	},
	get stringValue() {
		return getCommandFormsStore().switchConditionForm.stringValue;
	},
	set stringValue(value: string) {
		getCommandFormsStore().switchConditionForm.stringValue = value;
	},
	get attributeId() {
		return getCommandFormsStore().switchConditionForm.attributeId;
	},
	set attributeId(value: string) {
		getCommandFormsStore().switchConditionForm.attributeId = value;
	},
	get stringId() {
		return getCommandFormsStore().switchConditionForm.stringId;
	},
	set stringId(value: string) {
		getCommandFormsStore().switchConditionForm.stringId = value;
	},
	get mouseButton() {
		return getCommandFormsStore().switchConditionForm.mouseButton;
	},
	set mouseButton(value: number) {
		getCommandFormsStore().switchConditionForm.mouseButton = value;
	},
	get variable() {
		return getCommandFormsStore().switchConditionForm.variable;
	},
	set variable(value: { type: string; key: string }) {
		getCommandFormsStore().switchConditionForm.variable = value;
	}
};

interface SwitchConditionTarget {
	save: () => SwitchConditionData | undefined;
}

export interface SwitchConditionShape {
	target: SwitchConditionTarget | null;
	initialize: (() => void) | null;
	parse: ((condition: SwitchConditionData, listData?: boolean) => string) | null;
	open: ((condition?: SwitchConditionData) => void) | null;
	save: (() => SwitchConditionData | undefined) | null;
	confirm: ((event: Event) => SwitchConditionData | undefined) | null;
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
			string = setBooleanColor(condition.value!.toString());
			break;
		case 'number':
			string = setNumberColor(condition.value!.toString());
			break;
		case 'string':
			string = setStringColor(`"${parseMultiLineString(condition.value as string)}"`);
			break;
		case 'attribute':
			string = parseAttributeTag(condition.attributeId!, 'string');
			break;
		case 'enum':
			string = parseEnumStringTag(condition.stringId!);
			break;
		case 'keyboard': {
			const key = condition.keycode!;
			const keyboard = t('command.switch.keyboard');
			string = keyboard + Token('[') + setStringColor(key) + Token(']');
			break;
		}
		case 'gamepad': {
			const button = getButtonName(condition.button!);
			const gamepad = t('command.switch.gamepad');
			string = gamepad + Token('[') + setStringColor(button) + Token(']');
			break;
		}
		case 'mouse': {
			const button = IfCondition.parseMouseButton!(condition.button!);
			const mouse = t('command.switch.mouse');
			string = mouse + Token('[') + setStringColor(button) + Token(']');
			break;
		}
		case 'variable':
			string = parseVariable(condition.variable!, 'any')!;
			break;
	}
	if (listData) {
		string = removeTextTags(string);
	}
	return string;
};

const open = (condition: SwitchConditionData = { type: 'number', value: 0 }): void => {
	getWindowStore().open('switch-condition');
	let booleanValue = false;
	let numberValue = 0;
	let stringValue = '';
	let attributeId = '';
	let enumStringId = '';
	let keyboardKeycode = '';
	let gamepadButton = -1;
	let mouseButton = 0;
	let variableVariable = { type: 'local', key: '' };
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
	Object.assign(form, {
		type: condition.type,
		booleanValue,
		numberValue,
		stringValue,
		attributeId,
		stringId: enumStringId,
		mouseButton,
		variable: variableVariable
	});
	// 分支条件窗口是懒挂载的：首次打开时键位控件还不存在，等挂载后再写
	runWhenToolWindowReady('switch-condition', () => {
		write(
			composableEls.get('switch-condition-keyboard-keycode') as YamiElement,
			keyboardKeycode
		);
		write(composableEls.get('switch-condition-gamepad-button') as YamiElement, gamepadButton);
	});
	requestFocus('switch-condition-type');
};

const save = (): SwitchConditionData | undefined => {
	const type = form.type;
	let condition: SwitchConditionData | undefined;
	switch (type) {
		case 'none':
			condition = { type };
			break;
		case 'boolean': {
			const value = form.booleanValue;
			condition = { type, value };
			break;
		}
		case 'number': {
			const value = form.numberValue;
			condition = { type, value };
			break;
		}
		case 'string': {
			const value = form.stringValue;
			condition = { type, value };
			break;
		}
		case 'attribute': {
			const attributeId = form.attributeId;
			if (attributeId === '') {
				requestFocus('switch-condition-attribute-attributeId');
				return undefined;
			}
			condition = { type, attributeId };
			break;
		}
		case 'enum': {
			const stringId = form.stringId;
			if (stringId === '') {
				requestFocus('switch-condition-enum-stringId');
				return undefined;
			}
			condition = { type, stringId };
			break;
		}
		case 'keyboard': {
			const keycode = read(
				composableEls.get('switch-condition-keyboard-keycode') as YamiElement
			) as string;
			if (keycode === '') {
				requestFocus('switch-condition-keyboard-keycode');
				return undefined;
			}
			condition = { type, keycode };
			break;
		}
		case 'gamepad': {
			const button = read(
				composableEls.get('switch-condition-gamepad-button') as YamiElement
			) as number;
			if (button === -1) {
				requestFocus('switch-condition-gamepad-button');
				return undefined;
			}
			condition = { type, button };
			break;
		}
		case 'mouse': {
			const button = form.mouseButton;
			condition = { type, button };
			break;
		}
		case 'variable': {
			const variable = form.variable;
			if (VariableGetter.isNone!(variable)) {
				requestFocus('switch-condition-variable-variable');
				return undefined;
			}
			condition = { type, variable };
			break;
		}
	}
	getWindowStore().close('switch-condition');
	return condition!;
};

const confirm = (_event: Event): SwitchConditionData | undefined => {
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
