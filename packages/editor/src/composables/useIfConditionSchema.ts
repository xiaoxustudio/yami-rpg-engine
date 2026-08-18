import { Window } from '@app/legacy/tools/window-object.ts';
import { getButtonName } from '@app/components/common/gamepad-button-name';
import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { getFocus } from '@app/legacy/util/element-utils.ts';

export interface IfConditionTarget {
	save: () => unknown;
	dataValue?: unknown;
	isPluginInput?: boolean;
}

export interface IfConditionOperandShape {
	type: string;
	stringId?: string;
	[k: string]: any;
}

export interface IfConditionData {
	type: string;
	operation?: string;
	operand?: IfConditionOperandShape | null;
	keycode?: string;
	state?: string;
	button?: number;
	key?: string;
	skillId?: string;
	stateId?: string;
	itemId?: string;
	equipmentId?: string;
	quantity?: number;
	shortcutKey?: string;
	teamId?: string;
	[k: string]: any;
}

export interface IfConditionForm {
	type: string;
	commonVariable: { type: string; key: string };
	booleanOperation: string | undefined;
	booleanOperandType: string;
	booleanConstantValue: boolean;
	numberOperation: string | undefined;
	numberOperandType: string;
	numberConstantValue: number;
	stringOperation: string | undefined;
	stringOperandType: string;
	stringConstantValue: string;
	stringEnumStringId: string;
	objectOperation: string | undefined;
	objectOperandType: string;
	listOperation: string | undefined;
	operandVariable: { type: string; key: string };
	actorOperation: string | undefined;
	commonActor: { type: string };
	commonSkill: { type: string };
	commonState: { type: string };
	commonEquipment: { type: string };
	commonItem: { type: string };
	commonTrigger: { type: string };
	commonLight: { type: string };
	commonElement: { type: string };
	actorSkillId: string;
	actorStateId: string;
	actorItemId: string;
	actorEquipmentId: string;
	actorQuantity: number;
	actorShortcutKey: string;
	actorTarget: { type: string };
	actorTeamId: string;
	elementOperation: string | undefined;
	keyboardKeycode: string | undefined;
	keyboardState: string | undefined;
	gamepadButton: number | undefined;
	gamepadState: string | undefined;
	mouseButton: number | undefined;
	mouseState: string | undefined;
	otherKey: string | undefined;
}

export interface IfConditionShape {
	type: string;
	target: IfConditionTarget | null;
	initialize: (() => void) | null;
	writeHandler: ((event: { value?: unknown }) => void) | null;
	parseBooleanOperation: ((condition: IfConditionData) => string) | null;
	parseBooleanOperand: ((condition: IfConditionData) => string) | null;
	parseNumberOperation: ((condition: IfConditionData) => string) | null;
	parseNumberOperand: ((condition: IfConditionData) => string) | null;
	parseStringOperation: ((condition: IfConditionData) => string) | null;
	parseStringOperand: ((condition: IfConditionData) => string) | null;
	parseObjectOperation: ((condition: IfConditionData) => string) | null;
	parseObjectOperand: ((condition: IfConditionData) => string) | null;
	parseActorOperation: ((condition: IfConditionData) => string) | null;
	parseElementOperation: ((condition: IfConditionData) => string) | null;
	parseKeyboardState: ((state: string | undefined) => string) | null;
	parseGamepadState: ((state: string | undefined) => string) | null;
	parseMouseButton: ((button: number | undefined) => string) | null;
	parseMouseState: ((state: string | undefined) => string) | null;
	parseListOperation: ((condition: IfConditionData) => string) | null;
	parseOther: ((condition: IfConditionData) => string) | null;
	parse: ((condition: IfConditionData, listData?: boolean) => string) | null;
	open: ((condition?: IfConditionData) => void) | null;
	save: (() => unknown) | null;
	confirm: ((event: Event) => unknown) | null;
}

let target: IfConditionTarget | null = null;
let instance: IfConditionShape | null = null;

const writeHandler = (event: { value?: unknown }): void => {
	let filter1 = 'all';
	let filter2 = 'all';
	switch (event.value) {
		case 'boolean':
			filter1 = filter2 = 'boolean';
			break;
		case 'number':
			filter1 = filter2 = 'number';
			break;
		case 'string':
			filter1 = filter2 = 'string';
			break;
		case 'object':
			filter1 = filter2 = 'object';
			break;
		case 'list':
			filter1 = 'object';
			filter2 = 'all';
			break;
	}
	document.getElementById('if-condition-common-variable').filter = filter1;
	document.getElementById('if-condition-operand-variable').filter = filter2;
};

const parseBooleanOperation = ({ operation }: IfConditionData) => {
	const set = Command.setOperatorColor;
	switch (operation) {
		case 'equal':
			return set('==');
		case 'unequal':
			return set('!=');
	}
};

const parseBooleanOperand = ({ operand }: IfConditionData) => {
	switch (operand!.type) {
		case 'none':
			return Token('null');
		case 'constant':
			return Command.setBooleanColor!(operand!.value.toString());
		case 'variable':
			return Command.parseVariable!(operand!.variable, 'boolean');
	}
};

const parseNumberOperation = ({ operation }: IfConditionData) => {
	const set = Command.setOperatorColor;
	switch (operation) {
		case 'equal':
			return set('==');
		case 'unequal':
			return set('!=');
		case 'greater-or-equal':
			return set('>=');
		case 'less-or-equal':
			return set('<=');
		case 'greater':
			return set('>');
		case 'less':
			return set('<');
	}
};

const parseNumberOperand = ({ operand }: IfConditionData) => {
	switch (operand!.type) {
		case 'none':
			return Token('null');
		case 'constant':
			return Command.setNumberColor!(operand!.value.toString());
		case 'variable':
			return Command.parseVariable!(operand!.variable, 'number');
	}
};

const parseStringOperation = ({ operation }: IfConditionData) => {
	const set = Command.setOperatorColor;
	switch (operation) {
		case 'equal':
			return set('==');
		case 'unequal':
			return set('!=');
		default:
			return Local.get!('command.if.string.' + operation);
	}
};

const parseStringOperand = ({ operand }: IfConditionData) => {
	switch (operand!.type) {
		case 'none':
			return Token('null');
		case 'constant':
			return Command.setStringColor!(`"${Command.parseMultiLineString!(operand!.value)}"`);
		case 'variable':
			return Command.parseVariable!(operand!.variable, 'string');
		case 'enum':
			return Command.parseEnumStringTag!(operand!.stringId);
	}
};

const parseObjectOperation = ({ operation }: IfConditionData) => {
	const set = Command.setOperatorColor;
	switch (operation) {
		case 'equal':
			return set('==');
		case 'unequal':
			return set('!=');
		default:
			return Local.get!('command.if.object.' + operation);
	}
};

const parseObjectOperand = ({ operand }: IfConditionData) => {
	if (!operand) return '';
	switch (operand.type) {
		case 'none':
			return Token('null');
		case 'actor':
			return Command.parseActor!(operand.actor);
		case 'skill':
			return Command.parseSkill!(operand.skill);
		case 'state':
			return Command.parseState!(operand.state);
		case 'equipment':
			return Command.parseEquipment!(operand.equipment);
		case 'item':
			return Command.parseItem!(operand.item);
		case 'trigger':
			return Command.parseTrigger!(operand.trigger);
		case 'light':
			return Command.parseLight!(operand.light);
		case 'element':
			return Command.parseElement!(operand.element);
		case 'variable':
			return Command.parseVariable!(operand.variable, 'object');
	}
};

const parseActorOperation = ({
	operation,
	itemId,
	equipmentId,
	skillId,
	stateId,
	quantity,
	shortcutKey,
	target: actorTarget,
	teamId
}: IfConditionData) => {
	const op = Local.get!('command.if.actor.' + operation);
	switch (operation) {
		case 'has-skill':
			return `${op} ${Command.parseFileName!(skillId)}`;
		case 'has-state':
			return `${op} ${Command.parseFileName!(stateId)}`;
		case 'has-items': {
			const text = `${op} ${Command.parseFileName!(itemId)}`;
			return quantity === 1 ? text : `${text} x ${quantity}`;
		}
		case 'has-equipments': {
			const text = `${op} ${Command.parseFileName!(equipmentId)}`;
			return quantity === 1 ? text : `${text} x ${quantity}`;
		}
		case 'has-skill-shortcut':
		case 'has-item-shortcut':
			return `${op} <${Command.parseVariableEnum!('shortcut-key', shortcutKey)}>`;
		case 'equipped':
			return `${op} ${Command.parseFileName!(equipmentId)}`;
		case 'is-teammate':
		case 'is-friend':
		case 'is-enemy':
			return op.replace('<actor>', Command.parseActor!(actorTarget));
		case 'is-team-member':
		case 'is-team-friend':
		case 'is-team-enemy':
			return op.replace('<team>', Command.parseTeam!(teamId));
		default:
			return op;
	}
};

const parseElementOperation = ({ operation }: IfConditionData): string => {
	return Local.get!('command.if.element.' + operation);
};

const parseKeyboardState = (state: string | undefined): string => {
	return Local.get!('command.if.keyboard.' + state);
};

const parseGamepadState = (state: string | undefined): string => {
	return Local.get!('command.if.gamepad.' + state);
};

const parseMouseButton = (button: number | undefined): string => {
	return Local.get!('command.if.mouse.button.' + button);
};

const parseMouseState = (state: string | undefined): string => {
	return Local.get!('command.if.mouse.' + state);
};

const parseListOperation = ({ operation }: IfConditionData) => {
	return Local.get!('command.if.list.' + operation);
};

const parseOther = ({ key }: IfConditionData): string => {
	return Local.get!('command.if.other.' + key);
};

const parseTypeHandlers: Record<string, (condition: IfConditionData) => string> = {
	boolean: function (condition) {
		const variable = Command.parseVariable!(condition.variable, 'boolean');
		const operator = parseBooleanOperation(condition);
		const value = parseBooleanOperand(condition);
		return `${variable} ${operator} ${value}`;
	},
	number: function (condition) {
		const variable = Command.parseVariable!(condition.variable, 'number');
		const operator = parseNumberOperation(condition);
		const value = parseNumberOperand(condition);
		return `${variable} ${operator} ${value}`;
	},
	string: function (condition) {
		const variable = Command.parseVariable!(condition.variable, 'string');
		const operator = parseStringOperation(condition);
		const value = parseStringOperand(condition);
		return `${variable} ${operator} ${value}`;
	},
	object: function (condition) {
		const variable = Command.parseVariable!(condition.variable, 'object');
		const operator = parseObjectOperation(condition);
		const value = parseObjectOperand(condition);
		return `${variable} ${operator} ${value}`.trim();
	},
	actor: function (condition) {
		const actor = Command.parseActor!(condition.actor);
		const operation = parseActorOperation(condition);
		return `${actor} ${operation}`;
	},
	element: function (condition) {
		const element = Command.parseElement!(condition.element);
		const operation = parseElementOperation(condition);
		return `${element} ${operation}`;
	},
	keyboard: function (condition) {
		const key = condition.keycode;
		const keyboard = Local.get!('command.if.keyboard');
		const state = parseKeyboardState(condition.state);
		return keyboard + Token('[') + Command.setStringColor!(key) + Token(']') + ' ' + state;
	},
	gamepad: function (condition) {
		const button = getButtonName(condition.button!);
		const gamepad = Local.get!('command.if.gamepad');
		const state = parseGamepadState(condition.state);
		return gamepad + Token('[') + Command.setStringColor!(button) + Token(']') + ' ' + state;
	},
	mouse: function (condition) {
		const button = parseMouseButton(condition.button);
		const mouse = Local.get!('command.if.mouse');
		const state = parseMouseState(condition.state);
		return mouse + Token('[') + Command.setStringColor!(button) + Token(']') + ' ' + state;
	},
	list: function (condition) {
		const list = Command.parseVariable!(condition.list, 'object');
		const operation = parseListOperation(condition);
		const targetValue = Command.parseVariable!(condition.target, 'any');
		return `${list} ${operation} ${targetValue}`;
	},
	other: function (condition) {
		return parseOther(condition);
	}
};

const parse = (condition: IfConditionData, listData?: boolean): string => {
	const handler = parseTypeHandlers[condition.type];
	let string = handler ? handler(condition) : '';
	if (listData) {
		string = Command.removeTextTags!(string);
	}
	return string;
};

const open = (
	condition = {
		type: 'number',
		variable: { type: 'local', key: '' },
		operation: 'equal',
		operand: { type: 'constant', value: 0 }
	} as unknown as IfConditionData
): void => {
	document
		.getElementById('if-condition-actor-shortcutKey')
		.loadItems(Enum.getStringItems!('shortcut-key'));
	Window.open!('if-condition');
	const defaultVariable = { type: 'local', key: '' };
	let commonVariable = defaultVariable;
	let booleanOperation: string | undefined = 'equal';
	let booleanOperandType = 'constant';
	let booleanConstantValue = true;
	let numberOperation: string | undefined = 'equal';
	let numberOperandType = 'constant';
	let numberConstantValue = 0;
	let stringOperation: string | undefined = 'equal';
	let stringOperandType = 'constant';
	let stringConstantValue = '';
	let stringEnumStringId = '';
	let objectOperation: string | undefined = 'equal';
	let objectOperandType = 'none';
	let operandVariable = defaultVariable;
	let commonActor = { type: 'trigger' };
	let commonSkill = { type: 'trigger' };
	let commonState = { type: 'trigger' };
	let commonEquipment = { type: 'trigger' };
	let commonItem = { type: 'trigger' };
	let commonTrigger = { type: 'trigger' };
	let commonLight = { type: 'trigger' };
	let commonElement = { type: 'trigger' };
	let actorOperation: string | undefined = 'present-active';
	let actorSkillId = '';
	let actorStateId = '';
	let actorItemId = '';
	let actorEquipmentId = '';
	let actorQuantity = 1;
	let actorShortcutKey = Enum.getDefStringId!('shortcut-key');
	let actorTarget = { type: 'trigger' };
	let actorTeamId = Data.teams.list[0].id;
	let elementOperation: string | undefined = 'present';
	let keyboardKeycode: string | undefined = '';
	let keyboardState: string | undefined = 'just-pressed';
	let gamepadButton: number | undefined = -1;
	let gamepadState: string | undefined = 'just-pressed';
	let mouseButton: number | undefined = 0;
	let mouseState: string | undefined = 'just-pressed';
	let listOperation: string | undefined = 'include';
	let otherKey: string | undefined = 'mouse-entered';
	switch (condition.type) {
		case 'boolean':
			commonVariable = condition.variable;
			booleanOperation = condition.operation;
			booleanOperandType = condition.operand!.type;
			booleanConstantValue = condition.operand!.value ?? booleanConstantValue;
			operandVariable = condition.operand!.variable ?? operandVariable;
			break;
		case 'number':
			commonVariable = condition.variable;
			numberOperation = condition.operation;
			numberOperandType = condition.operand!.type;
			numberConstantValue = condition.operand!.value ?? numberConstantValue;
			operandVariable = condition.operand!.variable ?? operandVariable;
			break;
		case 'string':
			commonVariable = condition.variable;
			stringOperation = condition.operation;
			stringOperandType = condition.operand!.type;
			stringConstantValue = condition.operand!.value ?? stringConstantValue;
			stringEnumStringId = condition.operand!.stringId ?? stringEnumStringId;
			operandVariable = condition.operand!.variable ?? operandVariable;
			break;
		case 'object':
			commonVariable = condition.variable;
			objectOperation = condition.operation;
			objectOperandType = condition.operand?.type ?? objectOperandType;
			operandVariable = condition.operand?.variable ?? operandVariable;
			commonActor = condition.operand?.actor ?? commonActor;
			commonSkill = condition.operand?.skill ?? commonSkill;
			commonState = condition.operand?.state ?? commonState;
			commonEquipment = condition.operand?.equipment ?? commonEquipment;
			commonItem = condition.operand?.item ?? commonItem;
			commonTrigger = condition.operand?.trigger ?? commonTrigger;
			commonLight = condition.operand?.light ?? commonLight;
			commonElement = condition.operand?.element ?? commonElement;
			break;
		case 'actor':
			commonActor = condition.actor;
			actorOperation = condition.operation;
			actorSkillId = condition.skillId ?? actorSkillId;
			actorStateId = condition.stateId ?? actorStateId;
			actorItemId = condition.itemId ?? actorItemId;
			actorEquipmentId = condition.equipmentId ?? actorEquipmentId;
			actorQuantity = condition.quantity ?? actorQuantity;
			actorShortcutKey = condition.shortcutKey ?? actorShortcutKey;
			actorTarget = condition.target ?? actorTarget;
			actorTeamId = condition.teamId ?? actorTeamId;
			break;
		case 'element':
			commonElement = condition.element;
			elementOperation = condition.operation;
			break;
		case 'keyboard':
			keyboardKeycode = condition.keycode;
			keyboardState = condition.state;
			break;
		case 'gamepad':
			gamepadButton = condition.button;
			gamepadState = condition.state;
			break;
		case 'mouse':
			mouseButton = condition.button;
			mouseState = condition.state;
			break;
		case 'list':
			commonVariable = condition.list;
			listOperation = condition.operation;
			operandVariable = condition.target;
			break;
		case 'other':
			otherKey = condition.key;
			break;
	}
	const setForm = (
		document.getElementById('if-condition') as
			| (HTMLElement & { setForm?: (data: Partial<IfConditionForm>) => void })
			| null
	)?.setForm;
	setForm?.({
		type: condition.type,
		commonVariable,
		booleanOperation,
		booleanOperandType,
		booleanConstantValue,
		numberOperation,
		numberOperandType,
		numberConstantValue,
		stringOperation,
		stringOperandType,
		stringConstantValue,
		stringEnumStringId,
		objectOperation,
		objectOperandType,
		listOperation,
		operandVariable,
		actorOperation,
		commonActor,
		commonSkill,
		commonState,
		commonEquipment,
		commonItem,
		commonTrigger,
		commonLight,
		commonElement,
		actorSkillId,
		actorStateId,
		actorItemId,
		actorEquipmentId,
		actorQuantity,
		actorShortcutKey,
		actorTarget,
		actorTeamId,
		elementOperation,
		keyboardKeycode,
		keyboardState,
		gamepadButton,
		gamepadState,
		mouseButton,
		mouseState,
		otherKey
	});
	getFocus(document.getElementById('if-condition-type'));
};

const save = (): unknown => {
	const getForm = (
		document.getElementById('if-condition') as
			| (HTMLElement & { getForm?: () => IfConditionForm })
			| null
	)?.getForm;
	const form = getForm?.() ?? ({} as IfConditionForm);
	const type = form.type;
	let condition;
	switch (type) {
		case 'boolean': {
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus(document.getElementById('if-condition-common-variable'));
			}
			const operation = form.booleanOperation;
			let operand;
			switch (form.booleanOperandType) {
				case 'none':
					operand = {
						type: 'none'
					};
					break;
				case 'constant':
					operand = {
						type: 'constant',
						value: form.booleanConstantValue
					};
					break;
				case 'variable':
					operand = {
						type: 'variable',
						variable: form.operandVariable
					};
					if (VariableGetter.isNone!(operand.variable)) {
						return getFocus(document.getElementById('if-condition-operand-variable'));
					}
					break;
			}
			condition = { type, variable, operation, operand };
			break;
		}
		case 'number': {
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus(document.getElementById('if-condition-common-variable'));
			}
			const operation = form.numberOperation;
			let operand;
			switch (form.numberOperandType) {
				case 'none':
					operand = {
						type: 'none'
					};
					break;
				case 'constant':
					operand = {
						type: 'constant',
						value: form.numberConstantValue
					};
					break;
				case 'variable':
					operand = {
						type: 'variable',
						variable: form.operandVariable
					};
					if (VariableGetter.isNone!(operand.variable)) {
						return getFocus(document.getElementById('if-condition-operand-variable'));
					}
					break;
			}
			condition = { type, variable, operation, operand };
			break;
		}
		case 'string': {
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus(document.getElementById('if-condition-common-variable'));
			}
			const operation = form.stringOperation;
			let operand;
			switch (form.stringOperandType) {
				case 'none':
					operand = {
						type: 'none'
					};
					break;
				case 'constant':
					operand = {
						type: 'constant',
						value: form.stringConstantValue
					};
					break;
				case 'variable':
					operand = {
						type: 'variable',
						variable: form.operandVariable
					};
					if (VariableGetter.isNone!(operand.variable)) {
						return getFocus(document.getElementById('if-condition-operand-variable'));
					}
					break;
				case 'enum':
					operand = {
						type: 'enum',
						stringId: form.stringEnumStringId
					};
					if (operand.stringId === '') {
						return getFocus(
							document.getElementById('if-condition-string-enum-stringId')
						);
					}
					break;
			}
			condition = { type, variable, operation, operand };
			break;
		}
		case 'object': {
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return getFocus(document.getElementById('if-condition-common-variable'));
			}
			const operation = form.objectOperation;
			switch (operation) {
				case 'equal':
				case 'unequal': {
					let operand;
					switch (form.objectOperandType) {
						case 'none':
							operand = {
								type: 'none'
							};
							break;
						case 'actor':
							operand = {
								type: 'actor',
								actor: form.commonActor
							};
							break;
						case 'skill':
							operand = {
								type: 'skill',
								skill: form.commonSkill
							};
							break;
						case 'state':
							operand = {
								type: 'state',
								state: form.commonState
							};
							break;
						case 'equipment':
							operand = {
								type: 'equipment',
								equipment: form.commonEquipment
							};
							break;
						case 'item':
							operand = {
								type: 'item',
								item: form.commonItem
							};
							break;
						case 'trigger':
							operand = {
								type: 'trigger',
								trigger: form.commonTrigger
							};
							break;
						case 'light':
							operand = {
								type: 'light',
								light: form.commonLight
							};
							break;
						case 'element':
							operand = {
								type: 'element',
								element: form.commonElement
							};
							break;
						case 'variable':
							operand = {
								type: 'variable',
								variable: form.operandVariable
							};
							if (VariableGetter.isNone!(operand.variable)) {
								return getFocus(
									document.getElementById('if-condition-operand-variable')
								);
							}
							break;
					}
					condition = { type, variable, operation, operand };
					break;
				}
				default:
					condition = { type, variable, operation };
					break;
			}
			break;
		}
		case 'actor': {
			const actor = form.commonActor;
			const operation = form.actorOperation;
			switch (operation) {
				case 'has-skill': {
					const skillId = form.actorSkillId;
					if (skillId === '') {
						return getFocus(document.getElementById('if-condition-actor-skillId'));
					}
					condition = { type, actor, operation, skillId };
					break;
				}
				case 'has-state': {
					const stateId = form.actorStateId;
					if (stateId === '') {
						return getFocus(document.getElementById('if-condition-actor-stateId'));
					}
					condition = { type, actor, operation, stateId };
					break;
				}
				case 'has-items': {
					const itemId = form.actorItemId;
					if (itemId === '') {
						return getFocus(document.getElementById('if-condition-actor-itemId'));
					}
					const quantity = form.actorQuantity;
					condition = { type, actor, operation, itemId, quantity };
					break;
				}
				case 'has-equipments': {
					const equipmentId = form.actorEquipmentId;
					if (equipmentId === '') {
						return getFocus(document.getElementById('if-condition-actor-equipmentId'));
					}
					const quantity = form.actorQuantity;
					condition = {
						type,
						actor,
						operation,
						equipmentId,
						quantity
					};
					break;
				}
				case 'has-skill-shortcut':
				case 'has-item-shortcut': {
					const shortcutKey = form.actorShortcutKey;
					if (shortcutKey === '') {
						return getFocus(document.getElementById('if-condition-actor-shortcutKey'));
					}
					condition = { type, actor, operation, shortcutKey };
					break;
				}
				case 'equipped': {
					const equipmentId = form.actorEquipmentId;
					if (equipmentId === '') {
						return getFocus(document.getElementById('if-condition-actor-equipmentId'));
					}
					condition = { type, actor, operation, equipmentId };
					break;
				}
				case 'is-teammate':
				case 'is-friend':
				case 'is-enemy': {
					const actorTarget = form.actorTarget;
					condition = { type, actor, operation, target: actorTarget };
					break;
				}
				case 'is-team-member':
				case 'is-team-friend':
				case 'is-team-enemy': {
					const teamId = form.actorTeamId;
					condition = { type, actor, operation, teamId };
					break;
				}
				default:
					condition = { type, actor, operation };
					break;
			}
			break;
		}
		case 'element': {
			const element = form.commonElement;
			const operation = form.elementOperation;
			condition = { type, element, operation };
			break;
		}
		case 'keyboard': {
			const keycode = form.keyboardKeycode;
			const state = form.keyboardState;
			if (keycode === '') {
				return getFocus(document.getElementById('if-condition-keyboard-keycode'));
			}
			condition = { type, keycode, state };
			break;
		}
		case 'gamepad': {
			const button = form.gamepadButton;
			const state = form.gamepadState;
			if (button === -1) {
				return getFocus(document.getElementById('if-condition-gamepad-button'));
			}
			condition = { type, button, state };
			break;
		}
		case 'mouse': {
			const button = form.mouseButton;
			const state = form.mouseState;
			condition = { type, button, state };
			break;
		}
		case 'list': {
			const list = form.commonVariable;
			if (VariableGetter.isNone!(list)) {
				return getFocus(document.getElementById('if-condition-common-variable'));
			}
			const operation = form.listOperation;
			const targetValue = form.operandVariable;
			if (VariableGetter.isNone!(targetValue)) {
				return getFocus(document.getElementById('if-condition-operand-variable'));
			}
			condition = { type, list, operation, target: targetValue };
			break;
		}
		case 'other': {
			const key = form.otherKey;
			condition = { type, key };
			break;
		}
	}
	Window.close!('if-condition');
	return condition;
};

const confirm = (event: Event): unknown => {
	return target!.save();
};

export function useIfConditionSchema(): IfConditionShape {
	if (!instance) {
		instance = {
			type: 'condition',
			get target() {
				return target;
			},
			set target(value) {
				target = value;
			},
			initialize: () => undefined,
			writeHandler,
			parseBooleanOperation,
			parseBooleanOperand,
			parseNumberOperation,
			parseNumberOperand,
			parseStringOperation,
			parseStringOperand,
			parseObjectOperation,
			parseObjectOperand,
			parseActorOperation,
			parseElementOperation,
			parseKeyboardState,
			parseGamepadState,
			parseMouseButton,
			parseMouseState,
			parseListOperation,
			parseOther,
			parse,
			open,
			save,
			confirm
		};
	}
	return instance;
}
