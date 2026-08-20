import { Command } from '@app/commands/command-object';
import type { CustomBoxApiOptions } from '@ui-kit';
import { Attribute } from '@app/legacy/attribute/attribute-window';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { ActorGetter } from '@app/commands/accessors/actor-accessor-window';
import { AncestorGetter } from '@app/commands/accessors/ancestor-accessor-window';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window';
import { ElementGetter } from '@app/commands/accessors/element-accessor-window';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window';
import { ItemGetter } from '@app/commands/accessors/item-accessor-window';
import { LightGetter, ObjectGetter } from '@app/commands/accessors/preset-accessor-factory';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window';
import { RegionGetter } from '@app/commands/accessors/region-accessor-window';
import { SkillGetter } from '@app/commands/accessors/skill-accessor-window';
import { StateGetter } from '@app/commands/accessors/state-accessor-window';
import { TilemapGetter } from '@app/commands/accessors/tilemap-accessor-window';
import { TriggerGetter } from '@app/commands/accessors/trigger-accessor-window';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window';
import { Enum } from '@app/legacy/enum/enum-window';
import { File } from '@app/legacy/file/file-system-core';
import { GameLocal } from '@app/legacy/local/local-object';
import { ArrayList } from '@app/legacy/tools/array-window';
import { ImageClip } from '@app/legacy/tools/image-crop-window';
import { t } from '@app/i18n';
import { PresetElement } from '@app/legacy/tools/preset-element-window';
import { PresetObject } from '@app/legacy/tools/scene-preset-window';
import { Variable } from '@app/legacy/variable/variable';

interface GetterElement {
	dataValue: unknown;
	read(): unknown;
	write(value: string): void;
	input(...args: unknown[]): void;
	filter: string | null;
	previousSibling: Node | null;
	[k: string]: any;
}

const parseText = (
	value: unknown,
	parse: ((value: unknown) => string | undefined) | undefined
): { text: string } => {
	if (value == null || value === '') {
		return { text: t('common.none') };
	}
	if (!parse) {
		return { text: String(value) };
	}
	const parsed = parse(value);
	const text = Command.removeTextTags?.(parsed) ?? parsed ?? '';
	return { text: text || t('common.none') };
};

const parseWithInvalid = (fn: (value: string) => string) => {
	return (value: unknown) => {
		Command.invalid = false;
		if (value == null || value === '') {
			return { text: t('common.none') };
		}
		const text = fn(value as string);
		const parsed = Command.removeTextTags?.(text) ?? text;
		return { text: parsed || t('common.none'), invalid: Command.invalid };
	};
};

export const customBoxOptions: CustomBoxApiOptions = {
	getters: {
		file: (el: GetterElement) => getSelectorInstance()?.open?.(el),
		'dialog-dir': (el: GetterElement) =>
			File.showOpenDialog!({ defaultPath: el.read(), properties: ['openDirectory'] }).then(
				({ filePaths }: { filePaths: string[] }) => {
					if (filePaths.length === 1) el.write(filePaths[0]);
				}
			),
		clip: (el: GetterElement) => ImageClip.open(el),
		variable: (el: GetterElement) =>
			VariableGetter.open(el as unknown as Parameters<typeof VariableGetter.open>[0]),
		'global-variable': (el: GetterElement) => Variable.open!(el),
		actor: (el: GetterElement) => ActorGetter.open!(el),
		skill: (el: GetterElement) => SkillGetter.open!(el),
		state: (el: GetterElement) => StateGetter.open!(el),
		equipment: (el: GetterElement) => EquipmentGetter.open!(el),
		item: (el: GetterElement) => ItemGetter.open!(el),
		position: (el: GetterElement) =>
			PositionGetter.open!(
				el as unknown as Parameters<NonNullable<typeof PositionGetter.open>>[0]
			),
		angle: (el: GetterElement) => AngleGetter.open!(el),
		trigger: (el: GetterElement) => TriggerGetter.open!(el),
		light: (el: GetterElement) => LightGetter.open!(el),
		region: (el: GetterElement) => RegionGetter.open!(el),
		tilemap: (el: GetterElement) => TilemapGetter.open!(el),
		object: (el: GetterElement) => ObjectGetter.open!(el),
		element: (el: GetterElement) =>
			ElementGetter.open!(
				el as unknown as Parameters<NonNullable<typeof ElementGetter.open>>[0]
			),
		'ancestor-element': (el: GetterElement) => AncestorGetter.open!(el),
		'preset-object': (el: GetterElement) =>
			PresetObject.open!(
				el as unknown as Parameters<NonNullable<typeof PresetObject.open>>[0]
			),
		'preset-element': (el: GetterElement) => PresetElement.open!(el),
		array: (el: GetterElement) =>
			ArrayList.open!(el as unknown as Parameters<NonNullable<typeof ArrayList.open>>[0]),
		attribute: (el: GetterElement) => Attribute.open(el, 'attribute'),
		'attribute-group': (el: GetterElement) => Attribute.open(el, 'group'),
		'enum-group': (el: GetterElement) => Enum.open(el, 'group'),
		'enum-string': (el: GetterElement) => Enum.open(el, 'string')
	},
	parsers: {
		file: parseWithInvalid((guid: string) => Command.parseFileName?.(guid) ?? ''),
		'dialog-dir': (path: unknown) => ({
			text: path == null || path === '' ? t('common.none') : (path as string)
		}),
		clip: (clip: unknown) => ({
			text:
				clip == null || clip === '' || (Array.isArray(clip) && clip.length === 0)
					? t('common.none')
					: Array.isArray(clip)
						? (clip as unknown[]).join(', ')
						: String(clip)
		}),
		variable: (variable: unknown) => {
			const data = variable as { type?: string; key?: unknown } | null | undefined;
			if (data == null) {
				return { text: t('common.none') };
			}
			if (data.type === 'self' || data.key) {
				const parseVariable = Command.parseVariable as
					| ((variable: unknown) => string | undefined)
					| undefined;
				const parsed = parseVariable
					? Command.removeTextTags!(parseVariable(data))
					: String(data.key);
				return { text: parsed ?? '' };
			}
			return { text: t('common.none') };
		},
		'global-variable': (id: unknown) =>
			parseText(
				id,
				Command.parseGlobalVariable as ((value: unknown) => string | undefined) | undefined
			),
		actor: (actor: unknown) =>
			parseText(
				actor,
				Command.parseActor as ((value: unknown) => string | undefined) | undefined
			),
		skill: (skill: unknown) =>
			parseText(
				skill,
				Command.parseSkill as ((value: unknown) => string | undefined) | undefined
			),
		state: (stateData: unknown) =>
			parseText(
				stateData,
				Command.parseState as ((value: unknown) => string | undefined) | undefined
			),
		equipment: (equipment: unknown) =>
			parseText(
				equipment,
				Command.parseEquipment as ((value: unknown) => string | undefined) | undefined
			),
		item: (item: unknown) =>
			parseText(
				item,
				Command.parseItem as ((value: unknown) => string | undefined) | undefined
			),
		position: (point: unknown) =>
			parseText(
				point,
				Command.parsePosition as ((value: unknown) => string | undefined) | undefined
			),
		angle: (angle: unknown) =>
			parseText(
				angle,
				Command.parseAngle as ((value: unknown) => string | undefined) | undefined
			),
		trigger: (trigger: unknown) =>
			parseText(
				trigger,
				Command.parseTrigger as ((value: unknown) => string | undefined) | undefined
			),
		light: (light: unknown) =>
			parseText(
				light,
				Command.parseLight as ((value: unknown) => string | undefined) | undefined
			),
		region: (region: unknown) =>
			parseText(
				region,
				Command.parseRegion as ((value: unknown) => string | undefined) | undefined
			),
		tilemap: (tilemap: unknown) =>
			parseText(
				tilemap,
				Command.parseTilemap as ((value: unknown) => string | undefined) | undefined
			),
		object: (object: unknown) =>
			parseText(
				object,
				Command.parseObject as ((value: unknown) => string | undefined) | undefined
			),
		element: parseWithInvalid((element: unknown) => Command.parseElement?.(element) ?? ''),
		'ancestor-element': parseWithInvalid(
			(element: unknown) => Command.parseElement?.(element) ?? ''
		),
		'preset-object': (preset: unknown) =>
			parseText(
				preset,
				Command.parsePresetObject as ((value: unknown) => string | undefined) | undefined
			),
		'preset-element': parseWithInvalid(
			(preset: unknown) => Command.parsePresetElement?.(preset) ?? ''
		),
		array: (array: unknown) => ({
			text:
				(array as unknown[]).length !== 0
					? (Command.parseMultiLineString?.((array as unknown[]).join(', ')) ??
						t('common.empty'))
					: t('common.empty')
		}),
		'attribute-group': parseWithInvalid(
			(groupId: string) => Command.parseAttributeGroup?.(groupId) ?? ''
		),
		attribute: (attrId: unknown) => {
			if (attrId == null || attrId === '') return { text: t('common.none') };
			const attribute = Attribute.getAttribute(attrId as string);
			if (attribute) {
				return { text: GameLocal.replace(attribute.name) };
			}
			return { text: Command.parseUnlinkedId?.(attrId as string) ?? '', invalid: true };
		},
		'enum-group': parseWithInvalid(
			(groupId: string) => Command.parseEnumGroup?.(groupId) ?? ''
		),
		'enum-string': (stringId: unknown) => {
			if (stringId == null || stringId === '') return { text: t('common.none') };
			const string = Enum.getString(stringId as string);
			if (string) {
				return { text: GameLocal.replace(string.name) };
			}
			return { text: Command.parseUnlinkedId?.(stringId as string) ?? '', invalid: true };
		}
	},
	fileDialog: (defaultPath: unknown): Promise<{ filePaths: string[] }> =>
		File.showOpenDialog!({
			defaultPath,
			properties: ['openDirectory']
		}),
	browser: () => ({
		dragging: getBrowserInstance()?.dragging as boolean,
		body: getBrowserInstance()?.body as unknown as
			| { activeFile?: { type?: string; meta?: { guid: string } } }
			| undefined
	}),
	localize: (key: string): string => t(key)
};
