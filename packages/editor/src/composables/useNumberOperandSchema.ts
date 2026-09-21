import { getWindowStore } from '@app/stores/window';
import { type CustomBoxApi } from '@ui-kit';
import { composableEls } from '@app/composables/element-registry';
import { hide, read, show } from '@app/utils/element-utils';
import { requestFocus } from '@app/directives/focus';
import { setNumberColor, setScriptColor } from '@app/composables/useCommandColor.ts';
import {
	parseVariable,
	parseVariableNumber,
	parseVariableString,
	parseVariableFile,
	parseVariableEnum,
	parsePosition,
	parseActor,
	parseSkill,
	parseState,
	parseEquipment,
	parseItem,
	parseTrigger,
	parseTilemap,
	parseElement,
	parseListItem,
	parseParameter,
	parseTeam,
	removeTextTags
} from '@app/composables/useCommandParse.ts';
import { Token } from '@app/commands/token.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { getYamiI18n } from '@app/i18n';
import type { YamiElement } from '@app/types/element-api';
import { registryElement } from '@app/utils/element-registry';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

export interface OperandRefShape {
	type: string;
	[key: string]: unknown;
}

export interface NumberOperandData {
	operation: string;
	type: string;
	value?: number;
	variable?: { type: string; key: string };
	method?: string;
	decimals?: number;
	min?: number;
	max?: number;
	start?: OperandRefShape;
	end?: OperandRefShape;
	search?: string;
	property: string;
	itemId?: string;
	equipmentId?: string;
	actor?: OperandRefShape;
	skill?: OperandRefShape;
	state?: OperandRefShape;
	equipment?: OperandRefShape;
	item?: OperandRefShape;
	trigger?: OperandRefShape;
	tilemap?: OperandRefShape;
	tilemapPosition?: OperandRefShape;
	key?: string;
	element?: OperandRefShape;
	index?: number;
	script?: string;
	data: string;
	touchId?: number;
	teamId?: string;
}

interface NumberOperandTarget {
	start: number;
	save: () => unknown;
	dataValue?: NumberOperandData;
	isPluginInput?: boolean;
}

export interface NumberOperandForm {
	operation: string;
	operandType: string;
	constantValue: number;
	mathMethod: string | undefined;
	mathDecimals: number;
	mathMin: number;
	mathMax: number;
	mathStartPosition: OperandRefShape;
	mathEndPosition: OperandRefShape;
	stringMethod: string | undefined;
	stringSearch: string;
	commonVariable: { type: string; key: string };
	objectProperty: string;
	objectItemId: string;
	objectEquipmentId: string;
	elementProperty: string;
	elementElement: { type: string };
	commonActor: { type: string };
	commonSkill: { type: string };
	commonState: { type: string };
	commonEquipment: { type: string };
	commonItem: { type: string };
	commonTrigger: { type: string };
	commonTilemap: { type: string };
	tilemapPosition: OperandRefShape;
	cooldownKey: string;
	listIndex: number | undefined;
	parameterKey: string | undefined;
	script: string | undefined;
	otherData: string;
	otherTouchId: number;
	otherTeamId: string;
}

export interface NumberOperandShape {
	target: NumberOperandTarget | null;
	initialize: (() => void) | null;
	writeHandler: ((event: { value?: unknown }) => void) | null;
	parseMathMethod: ((operand: NumberOperandData) => string | undefined) | null;
	parseStringMethod: ((operand: NumberOperandData) => string | undefined) | null;
	parseObjectProperty: ((operand: NumberOperandData) => string | undefined) | null;
	parseElementProperty: ((operand: NumberOperandData) => string) | null;
	parseOther: ((operand: NumberOperandData) => string) | null;
	parseOperand: ((operand: NumberOperandData) => string | undefined) | null;
	parse:
		| ((operand: NumberOperandData, data?: NumberOperandData[], index?: number) => string)
		| null;
	open: ((operand?: NumberOperandData) => void) | null;
	save: (() => unknown) | null;
	confirm: ((event: Event) => unknown) | null;
}

let target: NumberOperandTarget | null = null;
let instance: NumberOperandShape | null = null;

const writeHandler = (event: { value?: unknown }): void => {
	let filter = 'all';
	switch (event.value) {
		case 'variable':
		case 'math':
			filter = 'number';
			break;
		case 'string':
			filter = 'string';
			break;
		case 'object':
		case 'list':
			filter = 'object';
			break;
	}
	// P4c：`filter` 是 CustomBox 的实例属性（见 `custom-box-api.ts`），类型来自 `CustomBoxApi`
	registryElement<CustomBoxApi>(composableEls, 'setNumber-operand-common-variable')!.filter =
		filter;
};

const parseMathMethod = (operand: NumberOperandData): string | undefined => {
	const method = operand.method;
	const label = t('command.setNumber.math.' + method);
	switch (method) {
		case 'round': {
			const varName = parseVariable(operand.variable!, 'number');
			const decimals = operand.decimals;
			return `${label}${Token('(')}${varName}${
				decimals ? `${Token(', ')}${setNumberColor(decimals)}` : ''
			}${Token(')')}`;
		}
		case 'floor':
		case 'ceil':
		case 'sqrt':
		case 'abs':
		case 'cos':
		case 'sin':
		case 'tan': {
			const varName = parseVariable(operand.variable!, 'number');
			return `${label}${Token('(')}${varName}${Token(')')}`;
		}
		case 'random': {
			const min = setNumberColor(0);
			const max = setNumberColor(1);
			return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(')')}`;
		}
		case 'random-int': {
			const min = parseVariableNumber(operand.min!);
			const max = parseVariableNumber(operand.max!);
			return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(']')}`;
		}
		case 'distance':
		case 'distance-x':
		case 'distance-y':
		case 'relative-angle': {
			const start = parsePosition(operand.start!);
			const end = parsePosition(operand.end!);
			return `${label}${Token('(')}${start}${Token(', ')}${end}${Token(')')}`;
		}
	}
};

const parseStringMethod = (operand: NumberOperandData): string | undefined => {
	const method = operand.method;
	const methodName = t('command.setNumber.string.' + method);
	switch (method) {
		case 'length':
		case 'parse': {
			const variable = operand.variable;
			const varName = parseVariable(variable!, 'string');
			return methodName + Token('(') + varName + Token(')');
		}
		case 'search': {
			const { variable, search } = operand;
			const varName = parseVariable(variable!, 'string');
			const searchName = parseVariableString(search!);
			return methodName + Token('(') + varName + Token(', ') + searchName + Token(')');
		}
	}
};

const parseObjectProperty = (operand: NumberOperandData): string | undefined => {
	const property = t('command.setNumber.object.' + operand.property);
	switch (operand.property) {
		case 'actor-x':
		case 'actor-y':
		case 'actor-ui-x':
		case 'actor-ui-y':
		case 'actor-screen-x':
		case 'actor-screen-y':
		case 'actor-angle':
		case 'actor-direction':
		case 'actor-movement-speed':
		case 'actor-collision-size':
		case 'actor-collision-weight':
		case 'actor-scaling-factor':
		case 'actor-inventory-money':
		case 'actor-inventory-used-space':
		case 'actor-inventory-version':
		case 'actor-skill-version':
		case 'actor-state-version':
		case 'actor-equipment-version':
		case 'actor-shortcut-version':
		case 'actor-animation-current-time':
		case 'actor-animation-duration':
		case 'actor-animation-progress':
			return parseActor(operand.actor!) + Token(' -> ') + property.replace('.', Token('.'));
		case 'actor-inventory-item-quantity':
			return (
				parseActor(operand.actor!) +
				Token(' -> ') +
				parseVariableFile(operand.itemId!) +
				Token('.') +
				property
			);
		case 'actor-inventory-equipment-quantity':
			return (
				parseActor(operand.actor!) +
				Token(' -> ') +
				parseVariableFile(operand.equipmentId!) +
				Token('.') +
				property
			);
		case 'actor-cooldown-time':
		case 'actor-cooldown-duration':
		case 'actor-cooldown-progress': {
			const key = parseVariableEnum('cooldown-key', operand.key!);
			return (
				parseActor(operand.actor!) +
				Token(' -> ') +
				property +
				Token('(') +
				key +
				Token(')')
			);
		}
		case 'skill-cooldown-time':
		case 'skill-cooldown-duration':
		case 'skill-cooldown-progress':
			return parseSkill(operand.skill!) + Token(' -> ') + property;
		case 'state-current-time':
		case 'state-duration':
		case 'state-progress':
			return parseState(operand.state!) + Token(' -> ') + property;
		case 'equipment-order':
			return parseEquipment(operand.equipment!) + Token(' -> ') + property;
		case 'item-order':
		case 'item-quantity':
			return parseItem(operand.item!) + Token(' -> ') + property;
		case 'trigger-speed':
		case 'trigger-angle':
			return parseTrigger(operand.trigger!) + Token(' -> ') + property;
		case 'tilemap-width':
		case 'tilemap-height':
			return parseTilemap(operand.tilemap!) + Token(' -> ') + property;
		case 'tilemap-tag': {
			return (
				parseTilemap(operand.tilemap!) +
				Token(' -> ') +
				property +
				Token('(') +
				parsePosition(operand.tilemapPosition!) +
				Token(')')
			);
		}
		case 'list-length':
			return parseVariable(operand.variable!, 'object') + Token(' -> ') + property;
	}
};

const parseElementProperty = (operand: NumberOperandData): string => {
	const element = parseElement(operand.element!);
	const property = t('command.setNumber.element.' + operand.property);
	return element + Token(' -> ') + property.replace('.', Token('.'));
};

const parseOther = (operand: NumberOperandData): string => {
	const label = t('command.setNumber.other.' + operand.data);
	switch (operand.data) {
		case 'touch-screen-x':
		case 'touch-screen-y':
		case 'touch-ui-x':
		case 'touch-ui-y':
		case 'touch-scene-x':
		case 'touch-scene-y': {
			const index = label.indexOf('.');
			const head = index !== -1 ? label.slice(0, index) : label;
			const end = index !== -1 ? label.slice(index + 1) : '';
			return (
				head +
				Token('[') +
				parseVariableNumber(operand.touchId!) +
				Token(']') +
				Token('.') +
				end
			);
		}
		case 'actor-count':
			return label + Token('(') + parseTeam(operand.teamId!) + Token(')');
		default:
			return label.replace('.', Token('.'));
	}
};

const parseOperand = (operand: NumberOperandData) => {
	switch (operand.type) {
		case 'constant':
			return setNumberColor(operand.value!.toString());
		case 'variable':
			return parseVariable(operand.variable!, 'number');
		case 'math':
			return parseMathMethod(operand)!;
		case 'string':
			return parseStringMethod(operand)!;
		case 'object':
			return parseObjectProperty(operand)!;
		case 'element':
			return parseElementProperty(operand);
		case 'list':
			return parseListItem(operand.variable!, operand.index!);
		case 'parameter':
			return parseParameter(operand.key!);
		case 'script':
			return setScriptColor(operand.script!);
		case 'other':
			return parseOther(operand);
	}
};

const parse = (
	operand: NumberOperandData,
	data: NumberOperandData[] | undefined,
	index: number | undefined
): string => {
	let operation;
	let operator;
	if (index === 0) {
		operation = read(composableEls.get('setNumber-operation')) ?? 'set';
		switch (operation) {
			case 'set':
				operator = '= ';
				break;
			case 'add':
				operator = '+= ';
				break;
			case 'sub':
				operator = '-= ';
				break;
			case 'mul':
				operator = '*= ';
				break;
			case 'div':
				operator = '/= ';
				break;
			case 'mod':
				operator = '%= ';
				break;
		}
	} else {
		operation = operand.operation ?? 'add';
		switch (operation.replace('()', '')) {
			case 'add':
				operator = '+ ';
				break;
			case 'sub':
				operator = '- ';
				break;
			case 'mul':
				operator = '* ';
				break;
			case 'div':
				operator = '/ ';
				break;
			case 'mod':
				operator = '% ';
				break;
		}
	}
	let operandName = removeTextTags(parseOperand(operand)!);
	const currentPriority = operation!.includes('()');
	const nextPriority = data?.[index! + 1]?.operation?.includes('()') ?? false;
	if (!currentPriority && nextPriority) {
		operandName = '(' + operandName;
	}
	if (currentPriority && !nextPriority) {
		operandName = operandName + ')';
	}
	return operator + operandName;
};

const open = (
	operand = {
		operation: 'add',
		type: 'constant',
		value: 0
	} as NumberOperandData
): void => {
	getWindowStore().open('setNumber-operand');

	if (target!.start === 0) {
		(composableEls.get('setNumber-operation') as YamiElement).save();
		show(composableEls.get('setNumber-operation'));
		requestFocus('setNumber-operation');
		hide(composableEls.get('setNumber-operand-operation'));
	} else {
		hide(composableEls.get('setNumber-operation'));
		show(composableEls.get('setNumber-operand-operation'));
		requestFocus('setNumber-operand-operation');
	}

	composableEls
		.get('setNumber-operand-cooldown-key')
		?.loadItems?.(Enum.getStringItems!('cooldown-key'));

	let constantValue = 0;
	let mathMethod: string | undefined = 'round';
	let mathDecimals = 0;
	let mathMin = 0;
	let mathMax = 1;
	let mathStartPosition: OperandRefShape = {
		type: 'actor',
		actor: { type: 'trigger' }
	};
	let mathEndPosition: OperandRefShape = {
		type: 'actor',
		actor: { type: 'trigger' }
	};
	let stringMethod: string | undefined = 'length';
	let stringSearch = '';
	let commonVariable: { type: string; key: string } | undefined = { type: 'local', key: '' };
	let objectProperty = 'actor-x';
	let objectItemId = '';
	let objectEquipmentId = '';
	let elementProperty = 'element-x';
	let elementElement = { type: 'trigger' };
	let commonActor = { type: 'trigger' };
	let commonSkill = { type: 'trigger' };
	let commonState = { type: 'trigger' };
	let commonEquipment = { type: 'trigger' };
	let commonItem = { type: 'trigger' };
	let commonTrigger = { type: 'trigger' };
	let commonTilemap = { type: 'trigger' };
	let tilemapPosition: OperandRefShape = {
		type: 'absolute',
		x: 0,
		y: 0
	};
	let cooldownKey = Enum.getDefStringId!('cooldown-key');
	let listIndex: number | undefined = 0;
	let parameterKey: string | undefined = '';
	let script: string | undefined = '';
	let otherData = 'trigger-button';
	let otherTouchId = 0;
	let otherTeamId = Data.teams.list[0].id;
	switch (operand.type) {
		case 'constant':
			constantValue = operand.value!;
			break;
		case 'variable':
			commonVariable = operand.variable;
			break;
		case 'math':
			mathMethod = operand.method;
			commonVariable = operand.variable ?? commonVariable;
			mathDecimals = operand.decimals ?? mathDecimals;
			mathMin = operand.min ?? mathMin;
			mathMax = operand.max ?? mathMax;
			mathStartPosition = operand.start ?? mathStartPosition;
			mathEndPosition = operand.end ?? mathEndPosition;
			break;
		case 'string':
			stringMethod = operand.method;
			commonVariable = operand.variable;
			stringSearch = operand.search ?? stringSearch;
			break;
		case 'object':
			objectProperty = operand.property;
			objectItemId = operand.itemId ?? objectItemId;
			objectEquipmentId = operand.equipmentId ?? objectEquipmentId;
			commonActor = operand.actor ?? commonActor;
			commonSkill = operand.skill ?? commonSkill;
			commonState = operand.state ?? commonState;
			commonEquipment = operand.equipment ?? commonEquipment;
			commonItem = operand.item ?? commonItem;
			commonTrigger = operand.trigger ?? commonTrigger;
			commonTilemap = operand.tilemap ?? commonTilemap;
			tilemapPosition = operand.tilemapPosition ?? tilemapPosition;
			cooldownKey = operand.key ?? cooldownKey;
			commonVariable = operand.variable ?? commonVariable;
			break;
		case 'element':
			elementProperty = operand.property;
			elementElement = operand.element!;
			break;
		case 'list':
			commonVariable = operand.variable;
			listIndex = operand.index;
			break;
		case 'parameter':
			parameterKey = operand.key;
			break;
		case 'script':
			script = operand.script;
			break;
		case 'other':
			otherData = operand.data;
			otherTouchId = operand.touchId ?? otherTouchId;
			otherTeamId = operand.teamId ?? otherTeamId;
			break;
	}
	const setForm = registryElement<
		HTMLElement & { setForm?: (data: Partial<NumberOperandForm>) => void }
	>(composableEls, 'setNumber-operand')?.setForm;
	setForm?.({
		operation: operand.operation,
		operandType: operand.type,
		constantValue,
		mathMethod,
		mathDecimals,
		mathMin,
		mathMax,
		mathStartPosition,
		mathEndPosition,
		stringMethod,
		stringSearch,
		commonVariable: commonVariable ?? { type: 'local', key: '' },
		objectProperty,
		objectItemId,
		objectEquipmentId,
		elementProperty,
		elementElement,
		commonActor,
		commonSkill,
		commonState,
		commonEquipment,
		commonItem,
		commonTrigger,
		commonTilemap,
		tilemapPosition,
		cooldownKey,
		listIndex,
		parameterKey,
		script,
		otherData,
		otherTouchId,
		otherTeamId
	});
};

const save = (): unknown => {
	const getForm = registryElement<HTMLElement & { getForm?: () => NumberOperandForm }>(
		composableEls,
		'setNumber-operand'
	)?.getForm;
	const form = getForm?.() ?? ({} as NumberOperandForm);
	const operation = form.operation;
	const type = form.operandType;
	let operand;
	switch (type) {
		case 'constant': {
			const value = form.constantValue;
			operand = { operation, type, value };
			break;
		}
		case 'variable': {
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('setNumber-operand-common-variable');
			}
			operand = { operation, type, variable };
			break;
		}
		case 'math': {
			const method = form.mathMethod;
			switch (method) {
				case 'round': {
					const variable = form.commonVariable;
					if (VariableGetter.isNone!(variable)) {
						return requestFocus('setNumber-operand-common-variable');
					}
					const decimals = form.mathDecimals;
					operand = { operation, type, method, variable, decimals };
					break;
				}
				case 'floor':
				case 'ceil':
				case 'sqrt':
				case 'abs':
				case 'cos':
				case 'sin':
				case 'tan': {
					const variable = form.commonVariable;
					if (VariableGetter.isNone!(variable)) {
						return requestFocus('setNumber-operand-common-variable');
					}
					operand = { operation, type, method, variable };
					break;
				}
				case 'random':
					operand = { operation, type, method };
					break;
				case 'random-int': {
					const min = form.mathMin;
					const max = form.mathMax;
					operand = { operation, type, method, min, max };
					break;
				}
				case 'distance':
				case 'distance-x':
				case 'distance-y':
				case 'relative-angle': {
					const start = form.mathStartPosition;
					const end = form.mathEndPosition;
					operand = { operation, type, method, start, end };
					break;
				}
			}
			break;
		}
		case 'string': {
			const method = form.stringMethod;
			const variable = form.commonVariable;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('setNumber-operand-common-variable');
			}
			switch (method) {
				case 'length':
				case 'parse':
					operand = { operation, type, method, variable };
					break;
				case 'search': {
					const search = form.stringSearch;
					if (search === '') {
						return requestFocus('setNumber-operand-string-search');
					}
					operand = { operation, type, method, variable, search };
					break;
				}
			}
			break;
		}
		case 'object': {
			const property = form.objectProperty;
			switch (property) {
				case 'actor-x':
				case 'actor-y':
				case 'actor-ui-x':
				case 'actor-ui-y':
				case 'actor-screen-x':
				case 'actor-screen-y':
				case 'actor-angle':
				case 'actor-direction':
				case 'actor-movement-speed':
				case 'actor-collision-size':
				case 'actor-collision-weight':
				case 'actor-scaling-factor':
				case 'actor-inventory-money':
				case 'actor-inventory-used-space':
				case 'actor-inventory-version':
				case 'actor-skill-version':
				case 'actor-state-version':
				case 'actor-equipment-version':
				case 'actor-shortcut-version':
				case 'actor-animation-current-time':
				case 'actor-animation-duration':
				case 'actor-animation-progress': {
					const actor = form.commonActor;
					operand = { operation, type, property, actor };
					break;
				}
				case 'actor-inventory-item-quantity': {
					const actor = form.commonActor;
					const itemId = form.objectItemId;
					if (itemId === '') {
						return requestFocus('setNumber-operand-object-itemId');
					}
					operand = { operation, type, property, actor, itemId };
					break;
				}
				case 'actor-inventory-equipment-quantity': {
					const actor = form.commonActor;
					const equipmentId = form.objectEquipmentId;
					if (equipmentId === '') {
						return requestFocus('setNumber-operand-object-equipmentId');
					}
					operand = { operation, type, property, actor, equipmentId };
					break;
				}
				case 'actor-cooldown-time':
				case 'actor-cooldown-duration':
				case 'actor-cooldown-progress': {
					const actor = form.commonActor;
					const key = form.cooldownKey;
					if (key === '') {
						return requestFocus('setNumber-operand-cooldown-key');
					}
					operand = { operation, type, property, actor, key };
					break;
				}
				case 'skill-cooldown-time':
				case 'skill-cooldown-duration':
				case 'skill-cooldown-progress': {
					const skill = form.commonSkill;
					operand = { operation, type, property, skill };
					break;
				}
				case 'state-current-time':
				case 'state-duration':
				case 'state-progress': {
					const state = form.commonState;
					operand = { operation, type, property, state };
					break;
				}
				case 'equipment-order': {
					const equipment = form.commonEquipment;
					operand = { operation, type, property, equipment };
					break;
				}
				case 'item-order':
				case 'item-quantity': {
					const item = form.commonItem;
					operand = { operation, type, property, item };
					break;
				}
				case 'trigger-speed':
				case 'trigger-angle': {
					const trigger = form.commonTrigger;
					operand = { operation, type, property, trigger };
					break;
				}
				case 'tilemap-width':
				case 'tilemap-height': {
					const tilemap = form.commonTilemap;
					operand = { operation, type, property, tilemap };
					break;
				}
				case 'tilemap-tag': {
					const tilemap = form.commonTilemap;
					const tilemapPosition = form.tilemapPosition;
					operand = {
						operation,
						type,
						property,
						tilemap,
						tilemapPosition
					};
					break;
				}
				case 'list-length': {
					const variable = form.commonVariable;
					if (VariableGetter.isNone!(variable)) {
						return requestFocus('setNumber-operand-common-variable');
					}
					operand = { operation, type, property, variable };
					break;
				}
			}
			break;
		}
		case 'element': {
			const property = form.elementProperty;
			const element = form.elementElement;
			operand = { operation, type, property, element };
			break;
		}
		case 'list': {
			const variable = form.commonVariable;
			const index = form.listIndex;
			if (VariableGetter.isNone!(variable)) {
				return requestFocus('setNumber-operand-common-variable');
			}
			operand = { operation, type, variable, index };
			break;
		}
		case 'parameter': {
			const key = form.parameterKey;
			if (key === '') {
				return requestFocus('setNumber-operand-parameter-key');
			}
			operand = { operation, type, key };
			break;
		}
		case 'script': {
			const script = form.script!.trim();
			if (script === '') {
				return requestFocus('setNumber-operand-script');
			}
			operand = { operation, type, script };
			break;
		}
		case 'other': {
			const data = form.otherData;
			switch (data) {
				case 'touch-screen-x':
				case 'touch-screen-y':
				case 'touch-ui-x':
				case 'touch-ui-y':
				case 'touch-scene-x':
				case 'touch-scene-y': {
					const touchId = form.otherTouchId;
					operand = { operation, type, data, touchId };
					break;
				}
				case 'actor-count': {
					const teamId = form.otherTeamId;
					operand = { operation, type, data, teamId };
					break;
				}
				default:
					operand = { operation, type, data };
					break;
			}
			break;
		}
	}
	(composableEls.get('setNumber-operation') as YamiElement).save();
	getWindowStore().close('setNumber-operand');
	return operand;
};

const confirm = (_event: Event): unknown => {
	return target!.save();
};

export function useNumberOperandSchema(): NumberOperandShape {
	if (!instance) {
		instance = {
			get target() {
				return target;
			},
			set target(value) {
				target = value;
			},
			initialize: () => undefined,
			writeHandler,
			parseMathMethod,
			parseStringMethod,
			parseObjectProperty,
			parseElementProperty,
			parseOther,
			parseOperand,
			parse,
			open,
			save,
			confirm
		};
	}
	return instance;
}
