import { Command } from '@/command/command-object';
import { Attribute } from '@/attribute/attribute-window';
import { getSelectorInstance } from '@app/stores/selector.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { ActorGetter } from '@/command/actor-accessor-window';
import { AncestorGetter } from '@/command/ancestor-accessor-window';
import { AngleGetter } from '@/command/angle-accessor-window';
import { ElementGetter } from '@/command/element-accessor-window';
import { EquipmentGetter } from '@/command/equipment-accessor-window';
import { ItemGetter } from '@/command/item-accessor-window';
import { LightGetter, ObjectGetter } from '@/command/preset-accessor-factory';
import { PositionGetter } from '@/command/position-accessor-window';
import { RegionGetter } from '@/command/region-accessor-window';
import { SkillGetter } from '@/command/skill-accessor-window';
import { StateGetter } from '@/command/state-accessor-window';
import { TilemapGetter } from '@/command/tilemap-accessor-window';
import { TriggerGetter } from '@/command/trigger-accessor-window';
import { VariableGetter } from '@/command/variable-accessor-window';
import { Enum } from '@/enum/enum-window';
import { File } from '@/file/file-system-core';
import { GameLocal } from '@/local/local-object';
import { ArrayList } from '@/tools/array-window';
import { ImageClip } from '@/tools/image-crop-window';
import { Local } from '@/tools/localization';
import { PresetElement } from '@/tools/preset-element-window';
import { PresetObject } from '@/tools/scene-preset-window';
import { Variable } from '@/variable/variable';

interface GetterElement {
	dataValue: any;
	read(): unknown;
	write(value: string): void;
	input(...args: unknown[]): any;
	filter: string;
	previousSibling: Node;
	[k: string]: any;
}

const parseWithInvalid = (fn: (value: any) => string) => {
	return (value: unknown) => {
		Command.invalid = false;
		const text = fn(value);
		return { text: Command.removeTextTags!(text), invalid: Command.invalid };
	};
};

export const customBoxOptions: {
	getters: Record<string, (el: GetterElement) => void>;
	parsers: Record<string, (value: any) => { text: string; invalid?: boolean }>;
	fileDialog: (defaultPath: string) => Promise<{ filePaths: string[] }>;
	browser: () => { dragging: unknown; body: { activeFile?: unknown } | undefined };
	localize: (key: string) => string;
} = {
	getters: {
		file: (el: GetterElement) => getSelectorInstance()?.open?.(el),
		'dialog-dir': (el: GetterElement) =>
			File.showOpenDialog!({ defaultPath: el.read(), properties: ['openDirectory'] }).then(
				({ filePaths }: { filePaths: string[] }) => {
					if (filePaths.length === 1) el.write(filePaths[0]);
				}
			),
		clip: (el: GetterElement) => ImageClip.open(el),
		variable: (el: GetterElement) => VariableGetter.open(el),
		'global-variable': (el: GetterElement) => Variable.open(el),
		actor: (el: GetterElement) => ActorGetter.open!(el),
		skill: (el: GetterElement) => SkillGetter.open!(el),
		state: (el: GetterElement) => StateGetter.open!(el),
		equipment: (el: GetterElement) => EquipmentGetter.open!(el),
		item: (el: GetterElement) => ItemGetter.open!(el),
		position: (el: GetterElement) => PositionGetter.open!(el),
		angle: (el: GetterElement) => AngleGetter.open!(el),
		trigger: (el: GetterElement) => TriggerGetter.open!(el),
		light: (el: GetterElement) => LightGetter.open!(el),
		region: (el: GetterElement) => RegionGetter.open!(el),
		tilemap: (el: GetterElement) => TilemapGetter.open!(el),
		object: (el: GetterElement) => ObjectGetter.open!(el),
		element: (el: GetterElement) => ElementGetter.open!(el),
		'ancestor-element': (el: GetterElement) => AncestorGetter.open!(el),
		'preset-object': (el: GetterElement) => PresetObject.open!(el),
		'preset-element': (el: GetterElement) => PresetElement.open!(el),
		array: (el: GetterElement) => ArrayList.open!(el),
		attribute: (el: GetterElement) => Attribute.open(el, 'attribute'),
		'attribute-group': (el: GetterElement) => Attribute.open(el, 'group'),
		'enum-group': (el: GetterElement) => Enum.open(el, 'group'),
		'enum-string': (el: GetterElement) => Enum.open(el, 'string')
	},
	parsers: {
		file: parseWithInvalid((guid: string) => Command.parseFileName!(guid)),
		'dialog-dir': (path: string) => ({ text: path }),
		clip: (clip: number[]) => ({ text: clip.join(', ') }),
		variable: (variable: { type: string; key?: string | number; [k: string]: any }) => {
			if (variable.type === 'self' || variable.key) {
				return { text: Command.removeTextTags!(Command.parseVariable!(variable)) };
			}
			return { text: Local.get!('common.none') };
		},
		'global-variable': (id: string) => ({
			text: Command.removeTextTags!(Command.parseGlobalVariable!(id))
		}),
		actor: (actor: unknown) => ({ text: Command.removeTextTags!(Command.parseActor!(actor)) }),
		skill: (skill: unknown) => ({ text: Command.removeTextTags!(Command.parseSkill!(skill)) }),
		state: (stateData: unknown) => ({
			text: Command.removeTextTags!(Command.parseState!(stateData))
		}),
		equipment: (equipment: unknown) => ({
			text: Command.removeTextTags!(Command.parseEquipment!(equipment))
		}),
		item: (item: unknown) => ({ text: Command.removeTextTags!(Command.parseItem!(item)) }),
		position: (point: unknown) => ({
			text: Command.removeTextTags!(Command.parsePosition!(point))
		}),
		angle: (angle: unknown) => ({ text: Command.removeTextTags!(Command.parseAngle!(angle)) }),
		trigger: (trigger: unknown) => ({
			text: Command.removeTextTags!(Command.parseTrigger!(trigger))
		}),
		light: (light: unknown) => ({ text: Command.removeTextTags!(Command.parseLight!(light)) }),
		region: (region: unknown) => ({
			text: Command.removeTextTags!(Command.parseRegion!(region))
		}),
		tilemap: (tilemap: unknown) => ({
			text: Command.removeTextTags!(Command.parseTilemap!(tilemap))
		}),
		object: (object: unknown) => ({
			text: Command.removeTextTags!(Command.parseObject!(object))
		}),
		element: parseWithInvalid((element: unknown) => Command.parseElement!(element)),
		'preset-object': (preset: unknown) => ({
			text: Command.removeTextTags!(Command.parsePresetObject!(preset))
		}),
		'preset-element': parseWithInvalid((preset: unknown) =>
			Command.parsePresetElement!(preset)
		),
		array: (array: string[]) => ({
			text:
				array.length !== 0
					? Command.parseMultiLineString!(array.join(', '))
					: Local.get!('common.empty')
		}),
		'attribute-group': parseWithInvalid((groupId: string) =>
			Command.parseAttributeGroup!(groupId)
		),
		attribute: (attrId: string) => {
			if (attrId === '') return { text: Local.get!('common.none') };
			const attribute = Attribute.getAttribute(attrId);
			if (attribute) {
				return { text: GameLocal.replace(attribute.name) };
			}
			return { text: Command.parseUnlinkedId!(attrId), invalid: true };
		},
		'enum-group': parseWithInvalid((groupId: string) => Command.parseEnumGroup!(groupId)),
		'enum-string': (stringId: string) => {
			if (stringId === '') return { text: Local.get!('common.none') };
			const string = Enum.getString(stringId);
			if (string) {
				return { text: GameLocal.replace(string.name) };
			}
			return { text: Command.parseUnlinkedId!(stringId), invalid: true };
		}
	},
	fileDialog: (defaultPath: string): Promise<{ filePaths: string[] }> =>
		File.showOpenDialog!({
			defaultPath,
			properties: ['openDirectory']
		}),
	browser: (): { dragging: unknown; body: { activeFile?: unknown } | undefined } => ({
		dragging: getBrowserInstance()?.dragging,
		body: getBrowserInstance()?.body
	}),
	localize: (key: string): string => Local.get!(key)
};
