<template>
	<div
		ref="root"
		class="custom-box"
		:id="props.id"
		:type="props.type || undefined"
		:filter="props.filter || undefined"
	/>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
	addClass,
	removeClass,
	dispatchChangeEvent,
	hideChildNodes,
	showChildNodes
} from '@/util/element-utils';
import { Command } from '@/command/command-object';
import { Attribute } from '@/attribute/attribute-window';
import { ActorGetter } from '@/command/actor-accessor-window';
import { AncestorGetter } from '@/command/ancestor-accessor-window';
import { AngleGetter } from '@/command/angle-accessor-window';
import { ElementGetter } from '@/command/element-accessor-window';
import { EquipmentGetter } from '@/command/equipment-accessor-window';
import { ItemGetter } from '@/command/item-accessor-window';
import { LightGetter } from '@/command/preset-accessor-factory';
import { PositionGetter } from '@/command/position-accessor-window';
import { RegionGetter } from '@/command/region-accessor-window';
import { ObjectGetter } from '@/command/preset-accessor-factory';
import { SkillGetter } from '@/command/skill-accessor-window';
import { StateGetter } from '@/command/state-accessor-window';
import { TilemapGetter } from '@/command/tilemap-accessor-window';
import { TriggerGetter } from '@/command/trigger-accessor-window';
import { VariableGetter } from '@/command/variable-accessor-window';
import { Enum } from '@/enum/enum-window';
import { FileItem } from '@/file/file-item';
import { File } from '@/file/file-system-core';
import { GameLocal } from '@/local/local-object';
import { ArrayList } from '@/tools/array-window';
import { ImageClip } from '@/tools/image-crop-window';
import { Local } from '@/tools/localization';
import { PresetElement } from '@/tools/preset-element-window';
import { PresetObject } from '@/tools/scene-preset-window';
import { Variable } from '@/variable/variable';

interface CustomBoxElement extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	update(): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: KeyboardEvent): void;
	click(event?: Event): void;
	dragenter(event: DragEvent): void;
	dragleave(event: DragEvent): void;
	dragover(event: DragEvent): void;
	drop(event: DragEvent): void;
}

interface Props {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: any;
}

const props = withDefaults(defineProps<Props>(), {
	type: '',
	filter: '',
	disabled: false,
	modelValue: null
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	write: [value: any];
}>();

const root = ref<CustomBoxElement | null>(null);

const state = reactive({
	dataValue: null as any,
	writeEventEnabled: false,
	inputEventEnabled: false
});

let info: HTMLElement | null = null;

const getType = (): string | null => (root.value ? (root.value as any).type : null);
const getFilter = (): string | null => (root.value ? (root.value as any).filter : null);

const read = (): any => state.dataValue;

const updateFile = (guid: string): void => {
	if (!info) return;
	Command.invalid = false;
	info.textContent = Command.removeTextTags!(Command.parseFileName!(guid));
	if (Command.invalid) addClass(info, 'invalid');
};

const updateDialogDir = (path: string): void => {
	if (!info) return;
	info.textContent = path;
};

const updateClip = (clip: number[]): void => {
	if (!info) return;
	info.textContent = clip.join(', ');
};

const updateVariable = (variable: any): void => {
	if (!info) return;
	if (variable.type === 'self' || variable.key) {
		info.textContent = Command.removeTextTags!(Command.parseVariable!(variable));
	} else {
		info.textContent = (Local.get as any)('common.none');
	}
};

const updateGlobalVariable = (id: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseGlobalVariable!(id));
};

const updateActor = (actor: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseActor!(actor));
};

const updateSkill = (skill: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseSkill!(skill));
};

const updateState = (stateData: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseState!(stateData));
};

const updateEquipment = (equipment: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseEquipment!(equipment));
};

const updateItem = (item: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseItem!(item));
};

const updatePosition = (point: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parsePosition!(point));
};

const updateAngle = (angle: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseAngle!(angle));
};

const updateTrigger = (trigger: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseTrigger!(trigger));
};

const updateLight = (light: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseLight!(light));
};

const updateRegion = (region: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseRegion!(region));
};

const updateTilemap = (tilemap: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseTilemap!(tilemap));
};

const updateObject = (object: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parseObject!(object));
};

const updateElement = (element: any): void => {
	if (!info) return;
	Command.invalid = false;
	info.textContent = Command.removeTextTags!(Command.parseElement!(element));
	if (Command.invalid) addClass(info, 'invalid');
};

const updatePresetObject = (preset: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parsePresetObject!(preset));
};

const updatePresetElement = (preset: any): void => {
	if (!info) return;
	info.textContent = Command.removeTextTags!(Command.parsePresetElement!(preset));
	if (Command.invalid) addClass(info, 'invalid');
};

const updateArray = (array: any[]): void => {
	if (!info) return;
	info.textContent =
		array.length !== 0
			? Command.parseMultiLineString!(array.join(', '))
			: (Local.get as any)('common.empty');
};

const updateAttributeGroup = (groupId: string): void => {
	if (!info) return;
	Command.invalid = false;
	info.textContent = Command.removeTextTags!(Command.parseAttributeGroup!(groupId));
	if (Command.invalid) addClass(info, 'invalid');
};

const updateAttribute = (attrId: string): void => {
	if (!info) return;
	if (attrId === '') {
		info.textContent = (Local.get as any)('common.none');
		return;
	}
	const attribute = (Attribute as any).getAttribute(attrId);
	if (attribute) {
		info.textContent = GameLocal.replace(attribute.name);
	} else {
		info.textContent = Command.parseUnlinkedId!(attrId);
		addClass(info, 'invalid');
	}
};

const updateEnumGroup = (groupId: string): void => {
	if (!info) return;
	Command.invalid = false;
	info.textContent = Command.removeTextTags!(Command.parseEnumGroup!(groupId));
	if (Command.invalid) addClass(info, 'invalid');
};

const updateEnumString = (stringId: string): void => {
	if (!info) return;
	if (stringId === '') {
		info.textContent = (Local.get as any)('common.none');
		return;
	}
	const string = (Enum as any).getString(stringId);
	if (string) {
		info.textContent = GameLocal.replace(string.name);
	} else {
		info.textContent = Command.parseUnlinkedId!(stringId);
		addClass(info, 'invalid');
	}
};

const update = (): void => {
	if (!info) return;
	removeClass(info, 'invalid');
	const value = state.dataValue;
	switch (getType()) {
		case 'file':
			return updateFile(value);
		case 'dialog-dir':
			return updateDialogDir(value);
		case 'clip':
			return updateClip(value);
		case 'variable':
			return updateVariable(value);
		case 'global-variable':
			return updateGlobalVariable(value);
		case 'actor':
			return updateActor(value);
		case 'skill':
			return updateSkill(value);
		case 'state':
			return updateState(value);
		case 'equipment':
			return updateEquipment(value);
		case 'item':
			return updateItem(value);
		case 'position':
			return updatePosition(value);
		case 'angle':
			return updateAngle(value);
		case 'trigger':
			return updateTrigger(value);
		case 'light':
			return updateLight(value);
		case 'region':
			return updateRegion(value);
		case 'tilemap':
			return updateTilemap(value);
		case 'object':
			return updateObject(value);
		case 'element':
		case 'ancestor-element':
			return updateElement(value);
		case 'preset-object':
			return updatePresetObject(value);
		case 'preset-element':
			return updatePresetElement(value);
		case 'array':
			return updateArray(value);
		case 'attribute':
			return updateAttribute(value);
		case 'attribute-group':
			return updateAttributeGroup(value);
		case 'enum-group':
			return updateEnumGroup(value);
		case 'enum-string':
			return updateEnumString(value);
	}
};

const write = (value: any): void => {
	state.dataValue = value;
	if (value !== null && value !== undefined) {
		update();
	}
	const el = root.value;
	if (el) {
		el.dataValue = value;
		if (state.writeEventEnabled) {
			const write: any = new Event('write');
			write.value = state.dataValue;
			el.dispatchEvent(write);
		}
	}
	emit('write', state.dataValue);
};

const input = (value: any): void => {
	if (state.dataValue !== value) {
		write(value);
		const el = root.value;
		if (el) {
			if (state.inputEventEnabled) {
				const input: any = new Event('input');
				input.value = state.dataValue;
				el.dispatchEvent(input);
			}
			dispatchChangeEvent(el);
		}
		emit('input', state.dataValue);
		emit('update:modelValue', state.dataValue);
	} else {
		if (getType() === 'file') {
			update();
		}
	}
};

const openDialogDir = (input: { read(): any; write(v: any): void }): void => {
	File.showOpenDialog!({
		defaultPath: input.read(),
		properties: ['openDirectory']
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length === 1) {
			input.write(filePaths[0]);
		}
	});
};

const enable = (): void => {
	const el = root.value;
	if (el && removeClass(el, 'disabled')) {
		el.tabIndex += 1;
		showChildNodes(el);
	}
};

const disable = (): void => {
	const el = root.value;
	if (el && addClass(el, 'disabled')) {
		el.tabIndex -= 1;
		hideChildNodes(el);
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'write':
			state.writeEventEnabled = true;
			break;
		case 'input':
			state.inputEventEnabled = true;
			break;
	}
};

const click = (event?: Event): void => {
	const el = root.value;
	if (!el) return;
	switch (getType()) {
		case 'file':
			return ((window as any).Selector as any).open(el);
		case 'dialog-dir':
			return openDialogDir(el as any);
		case 'clip':
			return (ImageClip as any).open(el);
		case 'variable':
			return (VariableGetter as any).open(el);
		case 'global-variable':
			return (Variable as any).open(el);
		case 'actor':
			return (ActorGetter as any).open(el);
		case 'skill':
			return (SkillGetter as any).open(el);
		case 'state':
			return (StateGetter as any).open(el);
		case 'equipment':
			return (EquipmentGetter as any).open(el);
		case 'item':
			return (ItemGetter as any).open(el);
		case 'position':
			return (PositionGetter as any).open(el);
		case 'angle':
			return (AngleGetter as any).open(el);
		case 'trigger':
			return (TriggerGetter as any).open(el);
		case 'light':
			return (LightGetter as any).open(el);
		case 'region':
			return (RegionGetter as any).open(el);
		case 'tilemap':
			return (TilemapGetter as any).open(el);
		case 'object':
			return (ObjectGetter as any).open(el);
		case 'element':
			return (ElementGetter as any).open(el);
		case 'ancestor-element':
			return (AncestorGetter as any).open(el);
		case 'preset-object':
			return (PresetObject as any).open(el);
		case 'preset-element':
			return (PresetElement as any).open(el);
		case 'array':
			return (ArrayList as any).open(el);
		case 'attribute':
			return (Attribute as any).open(el, 'attribute');
		case 'attribute-group':
			return (Attribute as any).open(el, 'group');
		case 'enum-group':
			return (Enum as any).open(el, 'group');
		case 'enum-string':
			return (Enum as any).open(el, 'string');
	}
};

const focus = (): void => root.value?.focus();

const keydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!event.cmdOrCtrlKey) {
				event.stopPropagation();
				click(event);
			}
			break;
	}
};

const dragenter = (event: DragEvent): void => {
	dragover(event);
};

const dragleave = (event: DragEvent): void => {
	const el = root.value;
	if (el && !el.contains(event.relatedTarget as Node)) {
		removeClass(el, 'dragover');
	}
};

const dragover = (event: DragEvent): void => {
	const el = root.value;
	if (!el) return;
	if (getType() === 'file' && (window as any).Browser?.dragging) {
		const file = ((window as any).Browser?.body as any)?.activeFile;
		if (
			file instanceof FileItem &&
			(!getFilter() || getFilter()!.indexOf((file as any).type) !== -1)
		) {
			(event as any).dataTransfer.dropEffect = 'move';
			event.preventDefault();
			addClass(el, 'dragover');
		}
	}
};

const drop = (event: DragEvent): void => {
	const el = root.value;
	if (!el) return;
	const file = ((window as any).Browser?.body as any)?.activeFile;
	if (file instanceof FileItem) {
		el.focus();
		input((file.meta as any).guid);
		removeClass(el, 'dragover');
	}
};

defineExpose({ read, write, input, enable, disable, focus, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));
watch(() => props.type, (val) => {
	if (root.value) (root.value as any).type = val;
});
watch(() => props.filter, (val) => {
	if (root.value) (root.value as any).filter = val;
});

onMounted(() => {
	const el = root.value;
	if (!el) return;

	const text = document.createElement('div');
	addClass(text, 'custom-box-text');
	addClass(text, 'text');
	info = text;

	el.appendChild(text);
	el.tabIndex = 0;

	Object.defineProperty(el, 'type', {
		get: (): string | null => el.getAttribute('type'),
		set: (value: string): void => {
			el.setAttribute('type', value);
		}
	});
	Object.defineProperty(el, 'filter', {
		get: (): string | null => el.getAttribute('filter'),
		set: (value: string): void => {
			el.setAttribute('filter', value);
		}
	});

	el.info = text;
	el.dataValue = state.dataValue;
	el.writeEventEnabled = false;
	el.inputEventEnabled = false;
	el._initialized = true;
	el.read = read;
	el.write = write;
	el.input = input;
	el.update = update;
	el.enable = enable;
	el.disable = disable;
	el.on = on;
	el.keydown = keydown;
	el.click = click;
	el.dragenter = dragenter;
	el.dragleave = dragleave;
	el.dragover = dragover;
	el.drop = drop;

	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('click', click as EventListener);
	el.addEventListener('dragenter', dragenter as EventListener);
	el.addEventListener('dragleave', dragleave as EventListener);
	el.addEventListener('dragover', dragover as EventListener);
	el.addEventListener('drop', drop as EventListener);

	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
