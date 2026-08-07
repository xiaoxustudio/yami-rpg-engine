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

const parseWithInvalid = (fn: (value: any) => string) => {
	return (value: any) => {
		Command.invalid = false;
		const text = fn(value);
		return { text: Command.removeTextTags!(text), invalid: Command.invalid };
	};
};

export const customBoxOptions: {
	getters: Record<string, (el: any) => void>;
	parsers: Record<string, (value: any) => { text: string; invalid?: boolean }>;
	fileDialog: (defaultPath: any) => Promise<{ filePaths: string[] }>;
	browser: () => any;
	localize: (key: string) => string;
} = {
	getters: {
		file: (el: any) => getSelectorInstance()?.open?.(el),
		'dialog-dir': (el: any) =>
			File.showOpenDialog!({ defaultPath: el.read(), properties: ['openDirectory'] }).then(
				({ filePaths }: { filePaths: string[] }) => {
					if (filePaths.length === 1) el.write(filePaths[0]);
				}
			),
		clip: (el: any) => (ImageClip as any).open(el),
		variable: (el: any) => (VariableGetter as any).open(el),
		'global-variable': (el: any) => (Variable as any).open(el),
		actor: (el: any) => (ActorGetter as any).open(el),
		skill: (el: any) => (SkillGetter as any).open(el),
		state: (el: any) => (StateGetter as any).open(el),
		equipment: (el: any) => (EquipmentGetter as any).open(el),
		item: (el: any) => (ItemGetter as any).open(el),
		position: (el: any) => (PositionGetter as any).open(el),
		angle: (el: any) => (AngleGetter as any).open(el),
		trigger: (el: any) => (TriggerGetter as any).open(el),
		light: (el: any) => (LightGetter as any).open(el),
		region: (el: any) => (RegionGetter as any).open(el),
		tilemap: (el: any) => (TilemapGetter as any).open(el),
		object: (el: any) => (ObjectGetter as any).open(el),
		element: (el: any) => (ElementGetter as any).open(el),
		'ancestor-element': (el: any) => (AncestorGetter as any).open(el),
		'preset-object': (el: any) => (PresetObject as any).open(el),
		'preset-element': (el: any) => (PresetElement as any).open(el),
		array: (el: any) => (ArrayList as any).open(el),
		attribute: (el: any) => (Attribute as any).open(el, 'attribute'),
		'attribute-group': (el: any) => (Attribute as any).open(el, 'group'),
		'enum-group': (el: any) => (Enum as any).open(el, 'group'),
		'enum-string': (el: any) => (Enum as any).open(el, 'string')
	},
	parsers: {
		file: parseWithInvalid((guid: string) => Command.parseFileName!(guid)),
		'dialog-dir': (path: string) => ({ text: path }),
		clip: (clip: number[]) => ({ text: clip.join(', ') }),
		variable: (variable: any) => {
			if (variable.type === 'self' || variable.key) {
				return { text: Command.removeTextTags!(Command.parseVariable!(variable)) };
			}
			return { text: Local.get('common.none') };
		},
		'global-variable': (id: any) => ({
			text: Command.removeTextTags!(Command.parseGlobalVariable!(id))
		}),
		actor: (actor: any) => ({ text: Command.removeTextTags!(Command.parseActor!(actor)) }),
		skill: (skill: any) => ({ text: Command.removeTextTags!(Command.parseSkill!(skill)) }),
		state: (stateData: any) => ({
			text: Command.removeTextTags!(Command.parseState!(stateData))
		}),
		equipment: (equipment: any) => ({
			text: Command.removeTextTags!(Command.parseEquipment!(equipment))
		}),
		item: (item: any) => ({ text: Command.removeTextTags!(Command.parseItem!(item)) }),
		position: (point: any) => ({
			text: Command.removeTextTags!(Command.parsePosition!(point))
		}),
		angle: (angle: any) => ({ text: Command.removeTextTags!(Command.parseAngle!(angle)) }),
		trigger: (trigger: any) => ({
			text: Command.removeTextTags!(Command.parseTrigger!(trigger))
		}),
		light: (light: any) => ({ text: Command.removeTextTags!(Command.parseLight!(light)) }),
		region: (region: any) => ({ text: Command.removeTextTags!(Command.parseRegion!(region)) }),
		tilemap: (tilemap: any) => ({
			text: Command.removeTextTags!(Command.parseTilemap!(tilemap))
		}),
		object: (object: any) => ({ text: Command.removeTextTags!(Command.parseObject!(object)) }),
		element: parseWithInvalid((element: any) => Command.parseElement!(element)),
		'preset-object': (preset: any) => ({
			text: Command.removeTextTags!(Command.parsePresetObject!(preset))
		}),
		'preset-element': parseWithInvalid((preset: any) => Command.parsePresetElement!(preset)),
		array: (array: any[]) => ({
			text:
				array.length !== 0
					? Command.parseMultiLineString!(array.join(', '))
					: Local.get('common.empty')
		}),
		'attribute-group': parseWithInvalid((groupId: string) =>
			Command.parseAttributeGroup!(groupId)
		),
		attribute: (attrId: string) => {
			if (attrId === '') return { text: Local.get('common.none') };
			const attribute = (Attribute as any).getAttribute(attrId);
			if (attribute) {
				return { text: GameLocal.replace(attribute.name) };
			}
			return { text: Command.parseUnlinkedId!(attrId), invalid: true };
		},
		'enum-group': parseWithInvalid((groupId: string) => Command.parseEnumGroup!(groupId)),
		'enum-string': (stringId: string) => {
			if (stringId === '') return { text: Local.get('common.none') };
			const string = (Enum as any).getString(stringId);
			if (string) {
				return { text: GameLocal.replace(string.name) };
			}
			return { text: Command.parseUnlinkedId!(stringId), invalid: true };
		}
	},
	fileDialog: (defaultPath: any): Promise<{ filePaths: string[] }> =>
		File.showOpenDialog!({
			defaultPath,
			properties: ['openDirectory']
		}),
	browser: (): any => ({
		dragging: getBrowserInstance()?.dragging,
		body: getBrowserInstance()?.body
	}),
	localize: (key: string): string => Local.get(key)
};
