import { PluginManager } from './plugin.ts';
import type { ParameterShape, PluginScriptShape } from './plugin.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window.ts';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window.ts';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window.ts';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window.ts';
import { StateGetter } from '@app/commands/accessors/state-accessor-window.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { getVariable } from '@app/utils/safe';
import { clamp, roundTo } from '@app/utils/math';

PluginManager.reconstruct = (function IIFE() {
	const guidRegExp = /^[0-9a-f]{16}$/;
	const colorRegExp = /^[0-9a-f]{8}$/;
	const checkValue = (parameter: ParameterShape, key: string, value: unknown) => {
		if (parameter.key !== key) {
			return false;
		}
		const { type } = parameter;
		switch (type) {
			case 'boolean':
			case 'string':
				return typeof value === type;
			case 'number':
				if (typeof value === type) {
					const { min, max, decimals } = parameter;
					return clamp(roundTo(value as number, decimals!), min!, max!) === value;
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return clamp(roundTo(n, decimals!), min!, max!) === n;
					}
				}
				return false;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return clamp(roundTo(value, decimals!), min!, max!) === value;
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return clamp(roundTo(n, decimals!), min!, max!) === n;
					}
				}
				return VariableGetter.checkDataForPlugin!(value as { getter?: string });
			case 'option':
				return parameter.options!.includes(value as string | number | boolean);
			case 'easing':
				return !!Data.easings.map[value as string];
			case 'team':
				return !!Data.teams.map[value as string];
			case 'variable':
				return value === '' || !!getVariable(value as string);
			case 'attribute':
			case 'attribute-key':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Attribute.getAttribute(value as string);
				return !!Attribute.getGroupAttribute(parameter.filter as string, value as string);
			case 'attribute-group':
				return value === '' || !!Attribute.getGroup(value as string);
			case 'enum':
			case 'enum-value':
				if (value === '') return true;
				if (parameter.filter === 'any') return !!Enum.getString(value as string);
				return !!Enum.getGroupString(parameter.filter as string, value as string);
			case 'enum-group':
				return value === '' || !!Enum.getGroup(value as string);
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
			case 'tilemap':
			case 'element':
			case 'element-id':
				return typeof value === 'string';
			case 'file':
				return value === '' || guidRegExp.test(value as string);
			case 'variable-getter':
			case 'variable-setter':
				return VariableGetter.checkDataForPlugin!(value as { getter?: string });
			case 'actor-getter':
				return ActorGetter.checkDataForPlugin!(value);
			case 'skill-getter':
				return SkillGetter.checkDataForPlugin!(value);
			case 'state-getter':
				return StateGetter.checkDataForPlugin!(value);
			case 'equipment-getter':
				return EquipmentGetter.checkDataForPlugin!(value);
			case 'item-getter':
				return ItemGetter.checkDataForPlugin!(value);
			case 'element-getter':
				return ElementGetter.checkDataForPlugin!(value);
			case 'position-getter':
				return PositionGetter.checkDataForPlugin!(value as { getter?: string });
			case 'number[]':
			case 'string[]':
				if (value instanceof Array) {
					const t = type.slice(0, -2);
					for (const item of value) {
						if (typeof item !== t) {
							if (
								t === 'number' &&
								typeof item === 'string' &&
								!Number.isNaN(Number(item))
							) {
								continue;
							}
							return false;
						}
					}
					return true;
				}
				return false;
			case 'keycode':
				return typeof value === 'string';
			case 'color':
				return colorRegExp.test(value as string);
			case 'repeatable-group':
				return value instanceof Array;
		}
		return true;
	};

	const readValue = (parameter: ParameterShape, value: unknown) => {
		const { type } = parameter;
		switch (type) {
			case 'boolean':
			case 'string':
				if (typeof value === type) return value;
				return parameter.value;
			case 'number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return clamp(roundTo(value, decimals!), min!, max!);
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return clamp(roundTo(n, decimals!), min!, max!);
					}
				}
				return parameter.value;
			case 'variable-number':
				if (typeof value === 'number') {
					const { min, max, decimals } = parameter;
					return clamp(roundTo(value, decimals!), min!, max!);
				} else if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n)) {
						const { min, max, decimals } = parameter;
						return clamp(roundTo(n, decimals!), min!, max!);
					}
				} else if (VariableGetter.checkDataForPlugin!(value as { getter?: string })) {
					return value;
				}
				return parameter.value;
			case 'option': {
				if (parameter.options!.includes(value as string | number | boolean)) return value;
				if (typeof value === 'number' && parameter.options![value] !== undefined) {
					return parameter.options![value];
				}
				if (typeof value === 'string') {
					const n = Number(value);
					if (!Number.isNaN(n) && parameter.options!.includes(n)) {
						return n;
					}
				}
				if (typeof value === 'number' && parameter.options!.includes(String(value))) {
					return String(value);
				}
				return parameter.value;
			}
			case 'easing':
				if (Data.easings.map[value as string]) return value;
				return Data.easings[0].id;
			case 'team':
				if (Data.teams.map[value as string]) return value;
				return Data.teams.list[0].id;
			case 'variable':
				if (getVariable(value as string)) return value;
				return '';
			case 'attribute':
			case 'attribute-key':
				if (parameter.filter === 'any') {
					if (Attribute.getAttribute(value as string)) return value;
				} else {
					if (Attribute.getGroupAttribute(parameter.filter as string, value as string))
						return value;
				}
				return '';
			case 'attribute-group':
				if (Attribute.getGroup(value as string)) return value;
				return '';
			case 'enum':
			case 'enum-value':
				if (parameter.filter === 'any') {
					if (Enum.getString(value as string)) return value;
				} else {
					if (Enum.getGroupString(parameter.filter as string, value as string))
						return value;
				}
				return '';
			case 'enum-group':
				if (Enum.getGroup(value as string)) return value;
				return '';
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
			case 'tilemap':
			case 'element':
			case 'element-id':
				if (typeof value === 'string') return value;
				return '';
			case 'file':
				if (guidRegExp.test(value as string)) return value;
				return '';
			case 'variable-getter':
			case 'variable-setter':
				if (VariableGetter.checkDataForPlugin!(value as { getter?: string })) return value;
				return VariableGetter.createDefaultForPlugin!();
			case 'actor-getter':
				if (ActorGetter.checkDataForPlugin!(value)) return value;
				return ActorGetter.createDefaultForPlugin!();
			case 'skill-getter':
				if (SkillGetter.checkDataForPlugin!(value)) return value;
				return SkillGetter.createDefaultForPlugin!();
			case 'state-getter':
				if (StateGetter.checkDataForPlugin!(value)) return value;
				return StateGetter.createDefaultForPlugin!();
			case 'equipment-getter':
				if (EquipmentGetter.checkDataForPlugin!(value)) return value;
				return EquipmentGetter.createDefaultForPlugin!();
			case 'item-getter':
				if (ItemGetter.checkDataForPlugin!(value)) return value;
				return ItemGetter.createDefaultForPlugin!();
			case 'element-getter':
				if (ElementGetter.checkDataForPlugin!(value)) return value;
				return ElementGetter.createDefaultForPlugin!();
			case 'position-getter':
				if (PositionGetter.checkDataForPlugin!(value as { getter?: string })) return value;
				return PositionGetter.createDefaultForPlugin!();
			case 'number[]':
			case 'string[]':
				if (value instanceof Array) {
					const t = type.slice(0, -2);
					const arr: (string | number)[] = [];
					for (const item of value) {
						if (typeof item !== t) {
							if (
								t === 'number' &&
								typeof item === 'string' &&
								!Number.isNaN(Number(item))
							) {
								arr.push(Number(item));
								continue;
							}
							return parameter.value;
						}
						arr.push(item);
					}
					return arr;
				}
				return parameter.value;
			case 'keycode':
				if (typeof value === 'string') return value;
				return parameter.value;
			case 'color':
				if (colorRegExp.test(value as string)) {
					return value;
				}
				return parameter.value;
			case 'repeatable-group':
				if (value instanceof Array) return value;
				return parameter.value;
		}
	};
	return function (this: typeof PluginManager, script: PluginScriptShape) {
		const { id, parameters } = script;
		const oEntries = Object.entries(parameters ?? {});
		const meta = Data.manifest.guidMap[id];
		const mParameters = meta?.parameters;
		// 未找到元数据参数时保留脚本参数
		if (mParameters === undefined) {
			return false;
		}
		meta.manager.update(parameters);
		let reconstruct = false;
		const length = mParameters.length;
		if (length !== oEntries.length) {
			reconstruct = true;
		} else {
			const oMap = {} as Record<string, unknown>;
			for (const [k, v] of oEntries) {
				oMap[k] = v;
			}
			for (const mParam of mParameters) {
				if (!(mParam.key in oMap) || !checkValue(mParam, mParam.key, oMap[mParam.key])) {
					reconstruct = true;
					break;
				}
			}
		}
		if (reconstruct) {
			const newParameters = {} as Record<string, unknown>;
			for (const mParam of mParameters) {
				const key = mParam.key;
				const arg = parameters?.[key];
				const value = readValue(mParam, arg);
				newParameters[key] = value;
			}
			script.parameters = newParameters;
			return true;
		}
		return false;
	};
})() as (...args: unknown[]) => boolean;
