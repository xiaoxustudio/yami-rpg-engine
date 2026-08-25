import { getVariable, reportError } from '@app/utils/safe';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { File } from '@app/file/file-system-core.ts';
import { GameLocal } from '@app/local/local-object.ts';
import { t } from '@app/i18n';
import { commandState } from './useCommandState.ts';
import {
	setVariableColor,
	setTextId,
	setGlobalVariableColor,
	setNumberColor,
	setStringColor,
	setFileColor,
	setPresetColor,
	setWeakColor
} from './useCommandColor.ts';

interface CommandObjectShape {
	type: string;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

interface CommandNode {
	id: string;
	params?: CommandObjectShape;
	children?: CommandNode[];
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

interface TextContent {
	text?: string;
	textId?: string;
	tooltip?: string;
	class?: string;
	color?: string;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

interface CommandBridgeShape {
	cases: Record<string, { parse(data: Record<string, unknown>): Record<string, unknown>[] }>;
	custom: {
		parse(id: string, parameters: Record<string, unknown>): Record<string, unknown>[];
	};
}

export function parseBlend(blend: string): string {
	return t('blend.' + blend);
}

export function fetchVariables(
	this: CommandBridgeShape,
	commands: CommandNode[] & { eventId?: string }
): Array<{
	name: string;
	type: string;
	comment: string;
	evIndex: number;
	isLeftValue: boolean;
	refCount: number;
	command?: unknown;
}> {
	const eventId = commands.eventId ?? '';
	const calledEvents: string[] = [eventId];
	let eventIndex = 0;
	commandState.returnType = Data.events?.[eventId]?.returnType ?? 'none';
	commandState.saveVars = true;
	const fetchParameters = (guid: string): void => {
		const globalEvent = Data.events?.[guid];
		if (!globalEvent) return;
		for (const { type, key } of globalEvent.parameters) {
			let varType: string;
			switch (type) {
				case 'boolean':
					varType = 'boolean';
					break;
				case 'number':
					varType = 'number';
					break;
				case 'string':
					varType = 'string';
					break;
				default:
					varType = 'object';
					break;
			}
			commandState.variables.push({
				name: key,
				type: varType,
				comment: commandState.eventName || '⭐️' + t(`eventParameterTypes.${type}`),
				evIndex: eventIndex,
				isLeftValue: true,
				refCount: 0
			});
		}
	};
	const fetchVariables = (commands: CommandNode[]): void => {
		for (const command of commands) {
			const { id, params } = command;
			if (id == null || id[0] === '!') continue;
			commandState.currentCommand = command;
			if (id === 'callEvent') {
				if (params?.type === 'global' && calledEvents.append(params.eventId)) {
					const file = Data.manifest?.guidMap[params.eventId]?.file;
					if (
						file instanceof FileItem &&
						!(file as unknown as { data?: { namespace?: unknown } }).data?.namespace
					) {
						let lastEventName = commandState.eventName;
						let lasteventIndex = commandState.eventIndex;
						commandState.eventName = file.basename;
						commandState.eventIndex = ++eventIndex;
						fetchParameters(params.eventId);
						fetchVariables(
							(file as unknown as { data?: { commands?: CommandNode[] } }).data
								?.commands ?? []
						);
						commandState.eventName = lastEventName;
						commandState.eventIndex = lasteventIndex;
					}
				}
			}
			const handler = this.cases[id];
			let contents: TextContent[];
			try {
				contents = handler
					? handler.parse(params ?? {})
					: this.custom.parse(id, params ?? {});
			} catch (err) {
				reportError(err, `Command.fetchVariables (id=${id})`);
				contents = [];
			}
			for (const content of contents) {
				if (content.children) {
					fetchVariables(content.children);
				}
			}
		}
		commandState.currentCommand = null;
	};
	fetchParameters(eventId);
	fetchVariables(commands);
	const { variables } = commandState;
	commandState.eventIndex = 0;
	commandState.eventName = '';
	commandState.saveVars = false;
	commandState.variables = [];
	return variables;
}

export function parseVariable(
	variable: CommandObjectShape,
	valueType: string = '',
	isLeftValue: boolean = false
): string | undefined {
	const key = variable.key;
	switch (variable.type) {
		case 'local': {
			if (commandState.saveVars) {
				if (key !== '') {
					commandState.variables.push({
						name: key,
						type: valueType,
						comment: commandState.eventName,
						evIndex: commandState.eventIndex,
						isLeftValue: isLeftValue,
						refCount: 0,
						command: commandState.currentCommand
					});
				}
			}
			let varName = setVariableColor(key || t('common.none'));
			if (valueType) {
				const textId = setTextId(`local-${valueType}-${key}`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'global': {
			let varName = parseGlobalVariable(key);
			if (valueType) {
				const gVar = getVariable(variable.key);
				const type = gVar ? typeof gVar.value : valueType;
				const textId = setTextId(`global-${type}-${variable.key}`);
				varName = textId + setGlobalVariableColor(varName);
			}
			return varName;
		}
		case 'self': {
			let varName = setVariableColor(t('variable.self'));
			if (valueType) {
				const textId = setTextId(`self-${valueType}-unnamed`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'actor': {
			const actor = parseActor(variable.actor);
			const attrName = parseVariableAttr('actor', key);
			return typeof key === 'string'
				? actor + Token('.') + attrName
				: actor + Token('[') + attrName + Token(']');
		}
		case 'skill': {
			const skill = parseSkill(variable.skill);
			const attrName = parseVariableAttr('skill', key);
			return typeof key === 'string'
				? skill + Token('.') + attrName
				: skill + Token('[') + attrName + Token(']');
		}
		case 'state': {
			const state = parseState(variable.state);
			const attrName = parseVariableAttr('state', key);
			return typeof key === 'string'
				? state + Token('.') + attrName
				: state + Token('[') + attrName + Token(']');
		}
		case 'equipment': {
			const equipment = parseEquipment(variable.equipment);
			const attrName = parseVariableAttr('equipment', key);
			return typeof key === 'string'
				? equipment + Token('.') + attrName
				: equipment + Token('[') + attrName + Token(']');
		}
		case 'item': {
			const item = parseItem(variable.item);
			const attrName = parseVariableAttr('item', key);
			return typeof key === 'string'
				? item + Token('.') + attrName
				: item + Token('[') + attrName + Token(']');
		}
		case 'element': {
			const element = parseElement(variable.element);
			const attrName = parseVariableAttr('element', key);
			return typeof key === 'string'
				? element + Token('.') + attrName
				: element + Token('[') + attrName + Token(']');
		}
	}
}

export function parseGlobalVariable(id: string): string {
	if (id === '') return Token('none');
	const variable = getVariable(id);
	return variable ? variable.name : parseUnlinkedId(id);
}

export function parseAttributeGroup(groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Attribute.getGroup!(groupKey);
	if (group) return GameLocal.replace!((group as { groupName?: string }).groupName!);
	commandState.invalid = true;
	return parseUnlinkedId(groupKey);
}

const _attrKeySpaceRegex = / +/g;

export function parseAttributeKey(groupKey: string, attrId: string, valueType?: string): string {
	const attr = groupKey
		? Attribute.getGroupAttribute!(groupKey, attrId)
		: Attribute.getAttribute!(attrId);
	if (attr) {
		const type = valueType ?? (attr.type === 'enum' ? 'string' : attr.type);
		const textId = setTextId(`attribute-${type}-${attr.key ?? attrId}-${attrId}`);
		return (
			textId + setVariableColor(GameLocal.replace!(attr.name.replace(_attrKeySpaceRegex, '')))
		);
	}
	commandState.invalid = true;
	const textId = setTextId(`attribute-${valueType ?? 'any'}-${attrId}-${attrId}`);
	return textId + setVariableColor(parseUnlinkedId(attrId));
}

export function parseAttributeTag(id: string, valueType?: string): string {
	return Token('<') + parseAttributeKey('', id, valueType) + Token('>');
}

const _localVarRegex = /(?<=<)local:([\s\S]+?)(?=>)/g;
const _globalVarRegex = /(?<=<)global(::?)([0-9a-f]{16})(?=>)/g;
const _localVarCtx = { type: 'local', key: '' };
const _globalVarCtx = { type: 'global', key: '' };

function _localVarReplacer(match: string, varKey: string): string {
	_localVarCtx.key = varKey;
	return parseVariable(_localVarCtx, 'any')!;
}

function _globalVarReplacer(match: string, delimiter: string, varKey: string): string {
	_globalVarCtx.key = varKey;
	const varSign = delimiter === '::' ? '@' : '';
	return varSign + parseVariable(_globalVarCtx, 'any');
}

export function parseVariableTag(string: string): string {
	return string
		.replace(_localVarRegex, _localVarReplacer)
		.replace(_globalVarRegex, _globalVarReplacer);
}

export function parseVariableNumber(
	number: CommandObjectShape | number,
	unit?: string
): string | undefined {
	switch (typeof number) {
		case 'number': {
			const text = setNumberColor(number);
			return unit ? text + unit : text;
		}
		case 'object': {
			const text = parseVariable(number, 'number');
			return unit ? text + ' ' + unit : text;
		}
	}
}

export function parseVariableString(string: CommandObjectShape | string): string | undefined {
	switch (typeof string) {
		case 'string':
			return setStringColor(`"${parseMultiLineString(string)}"`);
		case 'object':
			return parseVariable(string, 'string');
	}
}

export function parseVariableTemplate(
	content: CommandObjectShape | string,
	maxLength: number = 0
): string | undefined {
	switch (typeof content) {
		case 'string': {
			const tag = parseVariableTag(GameLocal.replace!(content));
			let string = parseMultiLineString(tag);
			if (maxLength !== 0 && string.length > maxLength) {
				string = string.slice(0, maxLength) + '...';
			}
			return setStringColor(`"${string}"`, true);
		}
		case 'object':
			return parseVariable(content, 'any');
	}
}

export function parseVariableAttr(
	groupKey: string,
	attrId: CommandObjectShape | string
): string | undefined {
	switch (typeof attrId) {
		case 'string':
			return parseAttributeKey(groupKey, attrId);
		case 'object':
			return parseVariable(attrId, 'string');
	}
}

export function parseVariableEnum(
	groupKey: string,
	enumId: CommandObjectShape | string
): string | undefined {
	switch (typeof enumId) {
		case 'string':
			return parseGroupEnumString(groupKey, enumId);
		case 'object':
			return parseVariable(enumId, 'string');
	}
}

export function parseVariableFile(fileId: CommandObjectShape | string): string | undefined {
	switch (typeof fileId) {
		case 'string':
			return parseFileName(fileId);
		case 'object':
			return parseVariable(fileId, 'string');
	}
}

export function parseVariableTeam(id: CommandObjectShape | string): string | undefined {
	switch (typeof id) {
		case 'string':
			return parseTeam(id);
		case 'object':
			return parseVariable(id, 'string');
	}
}

const _newlineRegex = /\n/g;

export function parseMultiLineString(string: string): string {
	return string.replace(_newlineRegex, '\\n');
}

export function parseSpriteName(animationId: string, spriteId: string): string {
	if (spriteId === '') return Token('none');
	const animation = Data.animations?.[animationId];
	const sprite = animation?.sprites.find((a: { id: string; name: string }) => a.id === spriteId);
	if (sprite) return sprite.name;
	commandState.invalid = true;
	return parseUnlinkedId(spriteId);
}

export function parseEventType(groupKey: string, eventType: string): string {
	return t('eventTypes.' + eventType) || parseGroupEnumString(groupKey, eventType);
}

export function parseEnumGroup(groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Enum.getGroup!(groupKey);
	if (group) return GameLocal.replace!((group as { groupName?: string }).groupName!);
	commandState.invalid = true;
	return parseUnlinkedId(groupKey);
}

export function parseEnumString(stringId: string): string {
	if (stringId === '') return Token('none');
	const string = Enum.getString!(stringId);
	if (string) {
		const textId = setTextId(`enum-string-${string.value ?? stringId}-${stringId}`);
		return textId + setStringColor(GameLocal.replace!(string.name));
	}
	commandState.invalid = true;
	const textId = setTextId(`enum-string-${stringId}-${stringId}`);
	return textId + setStringColor(parseUnlinkedId(stringId));
}

export function parseEnumStringTag(stringId: string): string {
	return Token('<') + parseEnumString(stringId) + Token('>');
}

export function parseGroupEnumString(groupKey: string, stringId: string): string {
	if (stringId === '') return Token('none');
	const string = Enum.getGroupString!(groupKey, stringId);
	const textId = setTextId(`enum-string-${stringId}-${stringId}`);
	if (string) return textId + setStringColor(GameLocal.replace!(string.name));
	commandState.invalid = true;
	return textId + setStringColor(parseUnlinkedId(stringId));
}

export function parseListItem(
	variable: CommandObjectShape,
	index: CommandObjectShape | number
): string {
	const listName = parseVariable(variable, 'object');
	const listIndex = parseVariableNumber(index);
	return listName + Token('[') + listIndex + Token(']');
}

export function parseParameter(key: CommandObjectShape | string): string {
	const label = t('parameter.param');
	const paramKey = parseVariableString(key);
	return label + Token('(') + paramKey + Token(')');
}

export function parseActor(actor: CommandObjectShape): string | undefined {
	switch (actor.type) {
		case 'trigger':
			return setTextId('actor-object-trigger') + t('actor.trigger');
		case 'caster':
			return setTextId('actor-object-caster') + t('actor.caster');
		case 'latest':
			return setTextId('actor-object-latest') + t('actor.latest');
		case 'target':
			return setTextId('actor-object-target') + t('actor.target');
		case 'player':
			return setTextId('actor-object-player') + t('actor.player');
		case 'member':
			return (
				setTextId('actor-object-member') +
				t('actor.member') +
				Token('[') +
				parseVariableNumber(actor.memberId) +
				Token(']')
			);
		case 'global':
			return setTextId(`actor-object-${actor.actorId}`) + parseFileName(actor.actorId);
		case 'by-id':
			return parsePresetObject(actor.presetId);
		case 'variable': {
			const label = t('actor.common');
			const textId = setTextId('actor-object-variable');
			const variable = parseVariable(actor.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseSkill(skill: CommandObjectShape): string | undefined {
	switch (skill.type) {
		case 'trigger':
			return setTextId('skill-object-trigger') + t('skill.trigger');
		case 'latest':
			return setTextId('skill-object-latest') + t('skill.latest');
		case 'by-key': {
			const actor = parseActor(skill.actor);
			const label = t('skill.common');
			const textId = setTextId('skill-object-by-key');
			const key = parseVariableEnum('shortcut-key', skill.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = parseActor(skill.actor);
			const file = parseFileName(skill.skillId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('skill.common');
			const textId = setTextId('skill-object-variable');
			const variable = parseVariable(skill.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseState(state: CommandObjectShape): string | undefined {
	switch (state.type) {
		case 'trigger':
			return setTextId('state-object-trigger') + t('state.trigger');
		case 'latest':
			return setTextId('state-object-latest') + t('state.latest');
		case 'by-id': {
			const actor = parseActor(state.actor);
			const file = parseFileName(state.stateId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('state.common');
			const textId = setTextId('state-object-variable');
			const variable = parseVariable(state.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseEquipment(equipment: CommandObjectShape): string | undefined {
	switch (equipment.type) {
		case 'trigger':
			return setTextId('equipment-object-trigger') + t('equipment.trigger');
		case 'latest':
			return setTextId('equipment-object-latest') + t('equipment.latest');
		case 'by-slot': {
			const actor = parseActor(equipment.actor);
			const label = t('equipment.common');
			const textId = setTextId('equipment-object-by-slot');
			const slot = parseVariableEnum('equipment-slot', equipment.slot);
			return actor + Token(' -> ') + textId + label + Token('<') + slot + Token('>');
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = parseActor(equipment.actor);
			const file = parseFileName(equipment.equipmentId);
			const source = setWeakColor(t('equipment.' + equipment.type));
			return actor + Token(' -> ') + file + ' ' + Token('(') + source + Token(')');
		}
		case 'variable': {
			const label = t('equipment.common');
			const textId = setTextId('equipment-object-variable');
			const variable = parseVariable(equipment.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseItem(item: CommandObjectShape): string | undefined {
	switch (item.type) {
		case 'trigger':
			return setTextId('item-object-trigger') + t('item.trigger');
		case 'latest':
			return setTextId('item-object-latest') + t('item.latest');
		case 'by-key': {
			const actor = parseActor(item.actor);
			const label = t('item.common');
			const textId = setTextId('item-object-by-key');
			const key = parseVariableEnum('shortcut-key', item.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = parseActor(item.actor);
			const file = parseFileName(item.itemId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('item.common');
			const variable = parseVariable(item.variable, 'object');
			const textId = setTextId('item-object-variable');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parsePosition(position: CommandObjectShape): string | undefined {
	switch (position.type) {
		case 'absolute': {
			const x = parseVariableNumber(position.x);
			const y = parseVariableNumber(position.y);
			return t('position.common') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'relative': {
			const x = parseVariableNumber(position.x);
			const y = parseVariableNumber(position.y);
			return t('position.relative') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'actor':
			return t('position.common') + Token('(') + parseActor(position.actor) + Token(')');
		case 'trigger':
			return t('position.common') + Token('(') + parseTrigger(position.trigger) + Token(')');
		case 'light':
			return t('position.common') + Token('(') + parseLight(position.light) + Token(')');
		case 'region': {
			const region = parseRegion(position.region);
			const mode = t('position.region.mode.' + position.mode);
			return t('position.common') + Token('(') + region + Token(', ') + mode + Token(')');
		}
		case 'object':
			return (
				t('position.common') +
				Token('(') +
				parsePresetObject(position.objectId) +
				Token(')')
			);
		case 'mouse':
			return t('position.common') + Token('(') + t('position.mouse') + Token(')');
	}
}

export function parseAngle(angle: CommandObjectShape): string | undefined {
	const type = angle.type;
	const desc = t('angle.' + type);
	switch (type) {
		case 'position':
			return `${desc} ${parsePosition(angle.position)}`;
		case 'absolute':
		case 'relative':
		case 'direction':
			return `${desc} ${parseVariableNumber(angle.degrees, '°')}`;
		case 'random':
			return desc;
	}
}

export function parseTrigger(trigger: CommandObjectShape): string | undefined {
	switch (trigger.type) {
		case 'trigger':
			return setTextId('trigger-object-trigger') + t('trigger.trigger');
		case 'latest':
			return setTextId('trigger-object-latest') + t('trigger.latest');
		case 'variable': {
			const label = t('trigger.common');
			const textId = setTextId('trigger-object-variable');
			const variable = parseVariable(trigger.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseLight(light: CommandObjectShape): string | undefined {
	switch (light.type) {
		case 'trigger':
			return setTextId('light-object-trigger') + t('light.trigger');
		case 'latest':
			return setTextId('light-object-latest') + t('light.latest');
		case 'by-id':
			return parsePresetObject(light.presetId);
		case 'variable': {
			const label = t('light.common');
			const textId = setTextId('light-object-variable');
			const variable = parseVariable(light.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseRegion(region: CommandObjectShape): string | undefined {
	switch (region.type) {
		case 'trigger':
			return setTextId('region-object-trigger') + t('region.trigger');
		case 'by-id':
			return parsePresetObject(region.presetId);
	}
}

export function parseTilemap(tilemap: CommandObjectShape): string | undefined {
	switch (tilemap.type) {
		case 'trigger':
			return setTextId('tilemap-object-trigger') + t('tilemap.trigger');
		case 'by-id':
			return parsePresetObject(tilemap.presetId);
		case 'variable':
			return parseVariable(tilemap.variable, 'object');
	}
}

export function parseObject(object: CommandObjectShape): string | undefined {
	switch (object.type) {
		case 'trigger':
			return setTextId('preset-object-trigger') + t('object.trigger');
		case 'latest':
			return setTextId('preset-object-latest') + t('object.latest');
		case 'by-id':
			return parsePresetObject(object.presetId);
		case 'variable': {
			const label = t('object.common');
			const textId = setTextId('preset-object-variable');
			const variable = parseVariable(object.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseElement(element: CommandObjectShape): string | undefined {
	switch (element.type) {
		case 'trigger':
			return setTextId('element-object-trigger') + t('element.trigger');
		case 'latest':
			return setTextId('element-object-latest') + t('element.latest');
		case 'by-id':
			return parsePresetElement(element.presetId, false);
		case 'by-ancestor-and-id': {
			const ancestor = parseElement(element.ancestor);
			const descendant = parsePresetElement(element.presetId, false);
			return ancestor + Token(' -> ') + descendant;
		}
		case 'by-index': {
			const parent = parseElement(element.parent);
			const label = t('element.common');
			const textId = setTextId('element-object-by-index');
			const index = parseVariableNumber(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return parent + Token(' -> ') + child;
		}
		case 'by-button-index': {
			const focus = parseElement(element.focus);
			const label = t('element.button');
			const textId = setTextId('element-object-by-button-index');
			const index = parseVariableNumber(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return focus + Token(' -> ') + child;
		}
		case 'selected-button': {
			const focus = parseElement(element.focus);
			const button = t('element.selected-button');
			const textId = setTextId('element-object-selected-button');
			return focus + Token(' -> ') + textId + button;
		}
		case 'focus':
			return setTextId('element-object-focus') + t('element.focus');
		case 'parent': {
			const label = t('element.parent');
			const textId = setTextId('element-object-parent');
			const parent = parseVariable(element.variable, 'object');
			return textId + label + Token('(') + parent + Token(')');
		}
		case 'variable': {
			const label = t('element.common');
			const textId = setTextId('element-object-variable');
			const variable = parseVariable(element.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parsePresetObject(presetId: string): string {
	if (presetId === '') return Token('none');
	const name = Data.scenePresets?.[presetId]?.data.name;
	const textId = setTextId(`scene-object-${presetId}`);
	return typeof name === 'string'
		? textId + setPresetColor(name)
		: textId + setPresetColor(parseUnlinkedId(presetId));
}

export function parsePresetElement(presetId: string, detailed: boolean = true): string {
	if (presetId === '') return Token('none');
	const uiId = Data.uiPresets?.[presetId]?.uiId ?? '';
	const preset = Data.uiPresets?.[presetId]?.data;
	const textId = setTextId(`ui-object-${presetId}`);
	let presetName = preset?.name;
	if (presetName === undefined) {
		commandState.invalid = true;
		presetName = setPresetColor(parseUnlinkedId(presetId));
	} else if (presetName) {
		presetName = setPresetColor(presetName);
	}
	switch (detailed) {
		case true: {
			const uiName = parseFileName(uiId);
			return uiName + ' ' + Token('{') + textId + presetName + Token('}');
		}
		case false:
			return textId + presetName;
	}
}

export function parseTeam(id: string): string {
	const team = Data.teams?.map?.[id];
	if (team) return team.name;
	commandState.invalid = true;
	return parseUnlinkedId(id);
}

export function parseHexColor(hex: string): string {
	return setStringColor('#' + hex);
}

export function parseActorSelector(selector: string): string | undefined {
	switch (selector) {
		case 'enemy':
		case 'friend':
		case 'team':
		case 'team-except-self':
		case 'any-except-self':
		case 'any':
			return t('actorFilter.' + selector);
	}
}

export function parseFileName(id: string): string {
	if (id === '') return Token('none');
	const meta = Data.manifest?.guidMap[id];
	const textId = setTextId(`file-string-${id}`);
	if (meta) return textId + setFileColor(File.parseMetaName!(meta));
	commandState.invalid = true;
	return textId + setFileColor(parseUnlinkedId(id));
}

export function parseAudioType(type: string): string | undefined {
	switch (type) {
		case 'bgm':
			return 'BGM';
		case 'bgs':
			return 'BGS';
		case 'cv':
			return 'CV';
		case 'se':
		case 'se-attenuated':
			return 'SE';
		case 'all':
			return 'ALL';
	}
}

export function parseWait(wait: boolean): string {
	switch (wait) {
		case false:
			return '';
		case true:
			return t('transition.wait');
	}
}

export function parseEasing(easingId: string, duration: number, wait: boolean): string {
	if (duration === 0) return '';
	const easing = Data.easings?.map?.[easingId];
	const time = parseVariableNumber(duration, 'ms');
	const info = (easing?.name ?? `#${easingId}`) + Token(', ') + time;
	return wait ? info + Token(', ') + t('transition.wait') : info;
}

export function parseUnlinkedId(name: string): string {
	return name ? `#${name}` : '';
}

const _textTagRegex = /\$_(\S+?)_\$([\s\S]*?)\$_\/_\$/g;

export function parseTextTags(contents: TextContent[]): TextContent[] {
	let i = contents.length;
	while (--i >= 0) {
		const content = contents[i];
		if (content.text !== undefined) {
			const text = content.text;
			const inserts: TextContent[] = [];
			let end = 0;
			let match;
			while ((match = _textTagRegex.exec(text))) {
				const start = match.index;
				if (end < start) {
					inserts.push({ text: text.slice(end, start) });
				}
				if (match[1] === 'textId') {
					inserts.push({ textId: match[2] });
				} else if (match[1] === 'tooltip') {
					inserts.push({ tooltip: match[2] });
				} else if (match[1] === 'class') {
					inserts.push({ class: match[2] });
				} else if (match[2] === '$_none_$') {
					inserts.push({ color: match[1] });
				} else {
					inserts.push({ color: match[1] }, { text: match[2] }, { color: 'restore' });
				}
				end = start + match[0].length;
			}
			if (inserts.length !== 0) {
				if (end < text.length) {
					inserts.push({ text: text.slice(end) });
				}
				contents.splice(i, 1, ...inserts);
			}
		}
	}
	return contents;
}

const _removeTagRegex = /\$_textId_\$(?:\S+?)_\/_\$|\$_(?:\S+?)_\$/g;

export function removeTextTags(string: string): string {
	return string ? string.replace(_removeTagRegex, '') : '';
}
