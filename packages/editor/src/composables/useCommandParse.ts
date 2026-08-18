import { getVariable, reportError } from '@app/legacy/util/safe.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { FileItem } from '@app/legacy/file/file-item.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';
import { t } from '@app/i18n';

interface CommandObjectShape {
	type: string;
	[k: string]: any;
}

interface CommandNode {
	id: string;
	params?: CommandObjectShape;
	children?: CommandNode[];
	[k: string]: any;
}

interface TextContent {
	text?: string;
	textId?: string;
	tooltip?: string;
	class?: string;
	color?: string;
	[k: string]: any;
}

export function parseBlend(this: typeof Command, blend: string): string {
	return t('blend.' + blend);
}

export function fetchVariables(
	this: typeof Command,
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
	this.returnType = Data.events[eventId]?.returnType ?? 'none';
	this.saveVars = true;
	const fetchParameters = (guid: string): void => {
		const globalEvent = Data.events[guid];
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
			Command.variables.push({
				name: key,
				type: varType,
				comment: this.eventName || '⭐️' + t(`eventParameterTypes.${type}`),
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
			Command.currentCommand = command;
			if (id === 'callEvent') {
				if (params?.type === 'global' && calledEvents.append(params.eventId)) {
					const file = Data.manifest.guidMap[params.eventId]?.file;
					if (
						file instanceof FileItem &&
						!(file as unknown as { data?: { namespace?: unknown } }).data?.namespace
					) {
						let lastEventName = this.eventName;
						let lasteventIndex = this.eventIndex;
						this.eventName = file.basename;
						this.eventIndex = ++eventIndex;
						fetchParameters(params.eventId);
						fetchVariables(
							(file as unknown as { data?: { commands?: CommandNode[] } }).data
								?.commands ?? []
						);
						this.eventName = lastEventName;
						this.eventIndex = lasteventIndex;
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
		Command.currentCommand = null;
	};
	fetchParameters(eventId);
	fetchVariables(commands);
	const { variables } = this;
	this.eventIndex = 0;
	this.eventName = '';
	this.saveVars = false;
	this.variables = [];
	return variables;
}

export function parseVariable(
	this: typeof Command,
	variable: CommandObjectShape,
	valueType: string = '',
	isLeftValue: boolean = false
): string | undefined {
	const key = variable.key;
	switch (variable.type) {
		case 'local': {
			if (Command.saveVars) {
				if (key !== '') {
					Command.variables.push({
						name: key,
						type: valueType,
						comment: Command.eventName,
						evIndex: Command.eventIndex,
						isLeftValue: isLeftValue,
						refCount: 0,
						command: Command.currentCommand
					});
				}
			}
			let varName = Command.setVariableColor!(key || t('common.none'));
			if (valueType) {
				const textId = Command.setTextId!(`local-${valueType}-${key}`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'global': {
			let varName = Command.parseGlobalVariable!(key);
			if (valueType) {
				const gVar = getVariable(variable.key);
				const type = gVar ? typeof gVar.value : valueType;
				const textId = Command.setTextId!(`global-${type}-${variable.key}`);
				varName = textId + Command.setGlobalVariableColor!(varName);
			}
			return varName;
		}
		case 'self': {
			let varName = Command.setVariableColor!(t('variable.self'));
			if (valueType) {
				const textId = Command.setTextId!(`self-${valueType}-unnamed`);
				varName = textId + varName;
			}
			return varName;
		}
		case 'actor': {
			const actor = Command.parseActor!(variable.actor);
			const attrName = Command.parseVariableAttr!('actor', key);
			return typeof key === 'string'
				? actor + Token('.') + attrName
				: actor + Token('[') + attrName + Token(']');
		}
		case 'skill': {
			const skill = Command.parseSkill!(variable.skill);
			const attrName = Command.parseVariableAttr!('skill', key);
			return typeof key === 'string'
				? skill + Token('.') + attrName
				: skill + Token('[') + attrName + Token(']');
		}
		case 'state': {
			const state = Command.parseState!(variable.state);
			const attrName = Command.parseVariableAttr!('state', key);
			return typeof key === 'string'
				? state + Token('.') + attrName
				: state + Token('[') + attrName + Token(']');
		}
		case 'equipment': {
			const equipment = Command.parseEquipment!(variable.equipment);
			const attrName = Command.parseVariableAttr!('equipment', key);
			return typeof key === 'string'
				? equipment + Token('.') + attrName
				: equipment + Token('[') + attrName + Token(']');
		}
		case 'item': {
			const item = Command.parseItem!(variable.item);
			const attrName = Command.parseVariableAttr!('item', key);
			return typeof key === 'string'
				? item + Token('.') + attrName
				: item + Token('[') + attrName + Token(']');
		}
		case 'element': {
			const element = Command.parseElement!(variable.element);
			const attrName = Command.parseVariableAttr!('element', key);
			return typeof key === 'string'
				? element + Token('.') + attrName
				: element + Token('[') + attrName + Token(']');
		}
	}
}

export function parseGlobalVariable(this: typeof Command, id: string): string {
	if (id === '') return Token('none');
	const variable = getVariable(id);
	return variable ? variable.name : Command.parseUnlinkedId!(id);
}

export function parseAttributeGroup(this: typeof Command, groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Attribute.getGroup!(groupKey);
	if (group) return GameLocal.replace!((group as { groupName?: string }).groupName!);
	this.invalid = true;
	return Command.parseUnlinkedId!(groupKey);
}

const _attrKeySpaceRegex = / +/g;

export function parseAttributeKey(
	this: typeof Command,
	groupKey: string,
	attrId: string,
	valueType?: string
): string {
	const attr = groupKey
		? Attribute.getGroupAttribute!(groupKey, attrId)
		: Attribute.getAttribute!(attrId);
	if (attr) {
		const type = valueType ?? (attr.type === 'enum' ? 'string' : attr.type);
		const textId = Command.setTextId!(`attribute-${type}-${attr.key ?? attrId}-${attrId}`);
		return (
			textId +
			Command.setVariableColor!(GameLocal.replace!(attr.name.replace(_attrKeySpaceRegex, '')))
		);
	}
	this.invalid = true;
	const textId = Command.setTextId!(`attribute-${valueType ?? 'any'}-${attrId}-${attrId}`);
	return textId + Command.setVariableColor!(Command.parseUnlinkedId!(attrId));
}

export function parseAttributeTag(this: typeof Command, id: string, valueType?: string): string {
	return Token('<') + Command.parseAttributeKey!('', id, valueType) + Token('>');
}

const _localVarRegex = /(?<=<)local:([\s\S]+?)(?=>)/g;
const _globalVarRegex = /(?<=<)global(::?)([0-9a-f]{16})(?=>)/g;
const _localVarCtx = { type: 'local', key: '' };
const _globalVarCtx = { type: 'global', key: '' };

function _localVarReplacer(match: string, varKey: string): string {
	_localVarCtx.key = varKey;
	return Command.parseVariable!(_localVarCtx, 'any');
}

function _globalVarReplacer(match: string, delimiter: string, varKey: string): string {
	_globalVarCtx.key = varKey;
	const varSign = delimiter === '::' ? '@' : '';
	return varSign + Command.parseVariable!(_globalVarCtx, 'any');
}

export function parseVariableTag(string: string): string {
	return string
		.replace(_localVarRegex, _localVarReplacer)
		.replace(_globalVarRegex, _globalVarReplacer);
}

export function parseVariableNumber(
	this: typeof Command,
	number: CommandObjectShape | number,
	unit?: string
): string | undefined {
	switch (typeof number) {
		case 'number': {
			const text = Command.setNumberColor!(number);
			return unit ? text + unit : text;
		}
		case 'object': {
			const text = Command.parseVariable!(number, 'number');
			return unit ? text + ' ' + unit : text;
		}
	}
}

export function parseVariableString(
	this: typeof Command,
	string: CommandObjectShape | string
): string | undefined {
	switch (typeof string) {
		case 'string':
			return Command.setStringColor!(`"${Command.parseMultiLineString!(string)}"`);
		case 'object':
			return Command.parseVariable!(string, 'string');
	}
}

export function parseVariableTemplate(
	this: typeof Command,
	content: CommandObjectShape | string,
	maxLength: number = 0
): string | undefined {
	switch (typeof content) {
		case 'string': {
			const tag = Command.parseVariableTag!(GameLocal.replace!(content));
			let string = Command.parseMultiLineString!(tag);
			if (maxLength !== 0 && string.length > maxLength) {
				string = string.slice(0, maxLength) + '...';
			}
			return Command.setStringColor!(`"${string}"`, true);
		}
		case 'object':
			return Command.parseVariable!(content, 'any');
	}
}

export function parseVariableAttr(
	this: typeof Command,
	groupKey: string,
	attrId: CommandObjectShape | string
): string | undefined {
	switch (typeof attrId) {
		case 'string':
			return Command.parseAttributeKey!(groupKey, attrId);
		case 'object':
			return Command.parseVariable!(attrId, 'string');
	}
}

export function parseVariableEnum(
	this: typeof Command,
	groupKey: string,
	enumId: CommandObjectShape | string
): string | undefined {
	switch (typeof enumId) {
		case 'string':
			return Command.parseGroupEnumString!(groupKey, enumId);
		case 'object':
			return Command.parseVariable!(enumId, 'string');
	}
}

export function parseVariableFile(
	this: typeof Command,
	fileId: CommandObjectShape | string
): string | undefined {
	switch (typeof fileId) {
		case 'string':
			return Command.parseFileName!(fileId);
		case 'object':
			return Command.parseVariable!(fileId, 'string');
	}
}

export function parseVariableTeam(
	this: typeof Command,
	id: CommandObjectShape | string
): string | undefined {
	switch (typeof id) {
		case 'string':
			return Command.parseTeam!(id);
		case 'object':
			return Command.parseVariable!(id, 'string');
	}
}

const _newlineRegex = /\n/g;

export function parseMultiLineString(this: typeof Command, string: string): string {
	return string.replace(_newlineRegex, '\\n');
}

export function parseSpriteName(
	this: typeof Command,
	animationId: string,
	spriteId: string
): string {
	if (spriteId === '') return Token('none');
	const animation = Data.animations[animationId];
	const sprite = animation?.sprites.find((a: { id: string; name: string }) => a.id === spriteId);
	if (sprite) return sprite.name;
	this.invalid = true;
	return Command.parseUnlinkedId!(spriteId);
}

export function parseEventType(this: typeof Command, groupKey: string, eventType: string): string {
	return t('eventTypes.' + eventType) || Command.parseGroupEnumString!(groupKey, eventType);
}

export function parseEnumGroup(this: typeof Command, groupKey: string): string {
	if (groupKey === '') return Token('none');
	const group = Enum.getGroup!(groupKey);
	if (group) return GameLocal.replace!((group as { groupName?: string }).groupName!);
	this.invalid = true;
	return Command.parseUnlinkedId!(groupKey);
}

export function parseEnumString(this: typeof Command, stringId: string): string {
	if (stringId === '') return Token('none');
	const string = Enum.getString!(stringId);
	if (string) {
		const textId = Command.setTextId!(`enum-string-${string.value ?? stringId}-${stringId}`);
		return textId + Command.setStringColor!(GameLocal.replace!(string.name));
	}
	this.invalid = true;
	const textId = Command.setTextId!(`enum-string-${stringId}-${stringId}`);
	return textId + Command.setStringColor!(Command.parseUnlinkedId!(stringId));
}

export function parseEnumStringTag(this: typeof Command, stringId: string): string {
	return Token('<') + Command.parseEnumString!(stringId) + Token('>');
}

export function parseGroupEnumString(
	this: typeof Command,
	groupKey: string,
	stringId: string
): string {
	if (stringId === '') return Token('none');
	const string = Enum.getGroupString!(groupKey, stringId);
	const textId = Command.setTextId!(`enum-string-${stringId}-${stringId}`);
	if (string) return textId + Command.setStringColor!(GameLocal.replace!(string.name));
	this.invalid = true;
	return textId + Command.setStringColor!(Command.parseUnlinkedId!(stringId));
}

export function parseListItem(
	this: typeof Command,
	variable: CommandObjectShape,
	index: CommandObjectShape | number
): string {
	const listName = Command.parseVariable!(variable, 'object');
	const listIndex = Command.parseVariableNumber!(index);
	return listName + Token('[') + listIndex + Token(']');
}

export function parseParameter(this: typeof Command, key: CommandObjectShape | string): string {
	const label = t('parameter.param');
	const paramKey = Command.parseVariableString!(key);
	return label + Token('(') + paramKey + Token(')');
}

export function parseActor(this: typeof Command, actor: CommandObjectShape): string | undefined {
	switch (actor.type) {
		case 'trigger':
			return Command.setTextId!('actor-object-trigger') + t('actor.trigger');
		case 'caster':
			return Command.setTextId!('actor-object-caster') + t('actor.caster');
		case 'latest':
			return Command.setTextId!('actor-object-latest') + t('actor.latest');
		case 'target':
			return Command.setTextId!('actor-object-target') + t('actor.target');
		case 'player':
			return Command.setTextId!('actor-object-player') + t('actor.player');
		case 'member':
			return (
				Command.setTextId!('actor-object-member') +
				t('actor.member') +
				Token('[') +
				Command.parseVariableNumber!(actor.memberId) +
				Token(']')
			);
		case 'global':
			return (
				Command.setTextId!(`actor-object-${actor.actorId}`) +
				Command.parseFileName!(actor.actorId)
			);
		case 'by-id':
			return Command.parsePresetObject!(actor.presetId);
		case 'variable': {
			const label = t('actor.common');
			const textId = Command.setTextId!('actor-object-variable');
			const variable = Command.parseVariable!(actor.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseSkill(this: typeof Command, skill: CommandObjectShape): string | undefined {
	switch (skill.type) {
		case 'trigger':
			return Command.setTextId!('skill-object-trigger') + t('skill.trigger');
		case 'latest':
			return Command.setTextId!('skill-object-latest') + t('skill.latest');
		case 'by-key': {
			const actor = Command.parseActor!(skill.actor);
			const label = t('skill.common');
			const textId = Command.setTextId!('skill-object-by-key');
			const key = Command.parseVariableEnum!('shortcut-key', skill.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = Command.parseActor!(skill.actor);
			const file = Command.parseFileName!(skill.skillId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('skill.common');
			const textId = Command.setTextId!('skill-object-variable');
			const variable = Command.parseVariable!(skill.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseState(this: typeof Command, state: CommandObjectShape): string | undefined {
	switch (state.type) {
		case 'trigger':
			return Command.setTextId!('state-object-trigger') + t('state.trigger');
		case 'latest':
			return Command.setTextId!('state-object-latest') + t('state.latest');
		case 'by-id': {
			const actor = Command.parseActor!(state.actor);
			const file = Command.parseFileName!(state.stateId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('state.common');
			const textId = Command.setTextId!('state-object-variable');
			const variable = Command.parseVariable!(state.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseEquipment(
	this: typeof Command,
	equipment: CommandObjectShape
): string | undefined {
	switch (equipment.type) {
		case 'trigger':
			return Command.setTextId!('equipment-object-trigger') + t('equipment.trigger');
		case 'latest':
			return Command.setTextId!('equipment-object-latest') + t('equipment.latest');
		case 'by-slot': {
			const actor = Command.parseActor!(equipment.actor);
			const label = t('equipment.common');
			const textId = Command.setTextId!('equipment-object-by-slot');
			const slot = Command.parseVariableEnum!('equipment-slot', equipment.slot);
			return actor + Token(' -> ') + textId + label + Token('<') + slot + Token('>');
		}
		case 'by-id-equipped':
		case 'by-id-inventory': {
			const actor = Command.parseActor!(equipment.actor);
			const file = Command.parseFileName!(equipment.equipmentId);
			const source = Command.setWeakColor!(t('equipment.' + equipment.type));
			return actor + Token(' -> ') + file + ' ' + Token('(') + source + Token(')');
		}
		case 'variable': {
			const label = t('equipment.common');
			const textId = Command.setTextId!('equipment-object-variable');
			const variable = Command.parseVariable!(equipment.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseItem(this: typeof Command, item: CommandObjectShape): string | undefined {
	switch (item.type) {
		case 'trigger':
			return Command.setTextId!('item-object-trigger') + t('item.trigger');
		case 'latest':
			return Command.setTextId!('item-object-latest') + t('item.latest');
		case 'by-key': {
			const actor = Command.parseActor!(item.actor);
			const label = t('item.common');
			const textId = Command.setTextId!('item-object-by-key');
			const key = Command.parseVariableEnum!('shortcut-key', item.key);
			return actor + Token(' -> ') + textId + label + Token('<') + key + Token('>');
		}
		case 'by-id': {
			const actor = Command.parseActor!(item.actor);
			const file = Command.parseFileName!(item.itemId);
			return actor + Token(' -> ') + file;
		}
		case 'variable': {
			const label = t('item.common');
			const variable = Command.parseVariable!(item.variable, 'object');
			const textId = Command.setTextId!('item-object-variable');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parsePosition(
	this: typeof Command,
	position: CommandObjectShape
): string | undefined {
	switch (position.type) {
		case 'absolute': {
			const x = Command.parseVariableNumber!(position.x);
			const y = Command.parseVariableNumber!(position.y);
			return t('position.common') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'relative': {
			const x = Command.parseVariableNumber!(position.x);
			const y = Command.parseVariableNumber!(position.y);
			return t('position.relative') + Token('(') + x + Token(', ') + y + Token(')');
		}
		case 'actor':
			return (
				t('position.common') + Token('(') + Command.parseActor!(position.actor) + Token(')')
			);
		case 'trigger':
			return (
				t('position.common') +
				Token('(') +
				Command.parseTrigger!(position.trigger) +
				Token(')')
			);
		case 'light':
			return (
				t('position.common') + Token('(') + Command.parseLight!(position.light) + Token(')')
			);
		case 'region': {
			const region = Command.parseRegion!(position.region);
			const mode = t('position.region.mode.' + position.mode);
			return t('position.common') + Token('(') + region + Token(', ') + mode + Token(')');
		}
		case 'object':
			return (
				t('position.common') +
				Token('(') +
				Command.parsePresetObject!(position.objectId) +
				Token(')')
			);
		case 'mouse':
			return t('position.common') + Token('(') + t('position.mouse') + Token(')');
	}
}

export function parseAngle(this: typeof Command, angle: CommandObjectShape): string | undefined {
	const type = angle.type;
	const desc = t('angle.' + type);
	switch (type) {
		case 'position':
			return `${desc} ${Command.parsePosition!(angle.position)}`;
		case 'absolute':
		case 'relative':
		case 'direction':
			return `${desc} ${Command.parseVariableNumber!(angle.degrees, '°')}`;
		case 'random':
			return desc;
	}
}

export function parseTrigger(
	this: typeof Command,
	trigger: CommandObjectShape
): string | undefined {
	switch (trigger.type) {
		case 'trigger':
			return Command.setTextId!('trigger-object-trigger') + t('trigger.trigger');
		case 'latest':
			return Command.setTextId!('trigger-object-latest') + t('trigger.latest');
		case 'variable': {
			const label = t('trigger.common');
			const textId = Command.setTextId!('trigger-object-variable');
			const variable = Command.parseVariable!(trigger.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseLight(this: typeof Command, light: CommandObjectShape): string | undefined {
	switch (light.type) {
		case 'trigger':
			return Command.setTextId!('light-object-trigger') + t('light.trigger');
		case 'latest':
			return Command.setTextId!('light-object-latest') + t('light.latest');
		case 'by-id':
			return Command.parsePresetObject!(light.presetId);
		case 'variable': {
			const label = t('light.common');
			const textId = Command.setTextId!('light-object-variable');
			const variable = Command.parseVariable!(light.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseRegion(this: typeof Command, region: CommandObjectShape): string | undefined {
	switch (region.type) {
		case 'trigger':
			return Command.setTextId!('region-object-trigger') + t('region.trigger');
		case 'by-id':
			return Command.parsePresetObject!(region.presetId);
	}
}

export function parseTilemap(
	this: typeof Command,
	tilemap: CommandObjectShape
): string | undefined {
	switch (tilemap.type) {
		case 'trigger':
			return Command.setTextId!('tilemap-object-trigger') + t('tilemap.trigger');
		case 'by-id':
			return Command.parsePresetObject!(tilemap.presetId);
		case 'variable':
			return Command.parseVariable!(tilemap.variable, 'object');
	}
}

export function parseObject(this: typeof Command, object: CommandObjectShape): string | undefined {
	switch (object.type) {
		case 'trigger':
			return Command.setTextId!('preset-object-trigger') + t('object.trigger');
		case 'latest':
			return Command.setTextId!('preset-object-latest') + t('object.latest');
		case 'by-id':
			return Command.parsePresetObject!(object.presetId);
		case 'variable': {
			const label = t('object.common');
			const textId = Command.setTextId!('preset-object-variable');
			const variable = Command.parseVariable!(object.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parseElement(
	this: typeof Command,
	element: CommandObjectShape
): string | undefined {
	switch (element.type) {
		case 'trigger':
			return Command.setTextId!('element-object-trigger') + t('element.trigger');
		case 'latest':
			return Command.setTextId!('element-object-latest') + t('element.latest');
		case 'by-id':
			return Command.parsePresetElement!(element.presetId, false);
		case 'by-ancestor-and-id': {
			const ancestor = Command.parseElement!(element.ancestor);
			const descendant = Command.parsePresetElement!(element.presetId, false);
			return ancestor + Token(' -> ') + descendant;
		}
		case 'by-index': {
			const parent = Command.parseElement!(element.parent);
			const label = t('element.common');
			const textId = Command.setTextId!('element-object-by-index');
			const index = Command.parseVariableNumber!(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return parent + Token(' -> ') + child;
		}
		case 'by-button-index': {
			const focus = Command.parseElement!(element.focus);
			const label = t('element.button');
			const textId = Command.setTextId!('element-object-by-button-index');
			const index = Command.parseVariableNumber!(element.index);
			const child = textId + label + Token('[') + index + Token(']');
			return focus + Token(' -> ') + child;
		}
		case 'selected-button': {
			const focus = Command.parseElement!(element.focus);
			const button = t('element.selected-button');
			const textId = Command.setTextId!('element-object-selected-button');
			return focus + Token(' -> ') + textId + button;
		}
		case 'focus':
			return Command.setTextId!('element-object-focus') + t('element.focus');
		case 'parent': {
			const label = t('element.parent');
			const textId = Command.setTextId!('element-object-parent');
			const parent = Command.parseVariable!(element.variable, 'object');
			return textId + label + Token('(') + parent + Token(')');
		}
		case 'variable': {
			const label = t('element.common');
			const textId = Command.setTextId!('element-object-variable');
			const variable = Command.parseVariable!(element.variable, 'object');
			return textId + label + Token('(') + variable + Token(')');
		}
	}
}

export function parsePresetObject(this: typeof Command, presetId: string): string {
	if (presetId === '') return Token('none');
	const name = Data.scenePresets[presetId]?.data.name;
	const textId = Command.setTextId!(`scene-object-${presetId}`);
	return typeof name === 'string'
		? textId + Command.setPresetColor!(name)
		: textId + Command.setPresetColor!(Command.parseUnlinkedId!(presetId));
}

export function parsePresetElement(
	this: typeof Command,
	presetId: string,
	detailed: boolean = true
): string {
	if (presetId === '') return Token('none');
	const uiId = Data.uiPresets[presetId]?.uiId ?? '';
	const preset = Data.uiPresets[presetId]?.data;
	const textId = Command.setTextId!(`ui-object-${presetId}`);
	let presetName = preset?.name;
	if (presetName === undefined) {
		this.invalid = true;
		presetName = Command.setPresetColor!(Command.parseUnlinkedId!(presetId));
	} else if (presetName) {
		presetName = Command.setPresetColor!(presetName);
	}
	switch (detailed) {
		case true: {
			const uiName = Command.parseFileName!(uiId);
			return uiName + ' ' + Token('{') + textId + presetName + Token('}');
		}
		case false:
			return textId + presetName;
	}
}

export function parseTeam(this: typeof Command, id: string): string {
	const team = Data.teams.map[id];
	if (team) return team.name;
	this.invalid = true;
	return Command.parseUnlinkedId!(id);
}

export function parseHexColor(this: typeof Command, hex: string): string {
	return Command.setStringColor!('#' + hex);
}

export function parseActorSelector(this: typeof Command, selector: string): string | undefined {
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

export function parseFileName(this: typeof Command, id: string): string {
	if (id === '') return Token('none');
	const meta = Data.manifest.guidMap[id];
	const textId = Command.setTextId!(`file-string-${id}`);
	if (meta) return textId + Command.setFileColor!(File.parseMetaName!(meta));
	this.invalid = true;
	return textId + Command.setFileColor!(Command.parseUnlinkedId!(id));
}

export function parseAudioType(this: typeof Command, type: string): string | undefined {
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

export function parseWait(this: typeof Command, wait: boolean): string {
	switch (wait) {
		case false:
			return '';
		case true:
			return t('transition.wait');
	}
}

export function parseEasing(
	this: typeof Command,
	easingId: string,
	duration: number,
	wait: boolean
): string {
	if (duration === 0) return '';
	const easing = Data.easings.map[easingId];
	const time = Command.parseVariableNumber!(duration, 'ms');
	const info = (easing?.name ?? `#${easingId}`) + Token(', ') + time;
	return wait ? info + Token(', ') + t('transition.wait') : info;
}

export function parseUnlinkedId(this: typeof Command, name: string): string {
	return name ? `#${name}` : '';
}

const _textTagRegex = /\$_(\S+?)_\$([\s\S]*?)\$_\/_\$/g;

export function parseTextTags(this: typeof Command, contents: TextContent[]): TextContent[] {
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

export function removeTextTags(this: typeof Command, string: string): string {
	return string.replace(_removeTagRegex, '');
}
