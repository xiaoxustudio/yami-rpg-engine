import { Command } from '@/command/command-object.ts';
import {
	addClass,
	on,
	removeClass,
	dispatchChangeEvent,
	hideChildNodes,
	showChildNodes
} from '@/util/element-utils.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { ActorGetter } from '@/command/actor-accessor-window.ts';
import { AncestorGetter } from '@/command/ancestor-accessor-window.ts';
import { AngleGetter } from '@/command/angle-accessor-window.ts';
import { ElementGetter } from '@/command/element-accessor-window.ts';
import { EquipmentGetter } from '@/command/equipment-accessor-window.ts';
import { ItemGetter } from '@/command/item-accessor-window.ts';
import { LightGetter } from '@/command/preset-accessor-factory.ts';
import { PositionGetter } from '@/command/position-accessor-window.ts';
import { RegionGetter } from '@/command/region-accessor-window.ts';
import { ObjectGetter } from '@/command/preset-accessor-factory.ts';
import { SkillGetter } from '@/command/skill-accessor-window.ts';
import { StateGetter } from '@/command/state-accessor-window.ts';
import { TilemapGetter } from '@/command/tilemap-accessor-window.ts';
import { TriggerGetter } from '@/command/trigger-accessor-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Enum } from '@/enum/enum-window.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { GameLocal } from '@/local/local-object.ts';
import { ArrayList } from '@/tools/array-window.ts';
import { ImageClip } from '@/tools/image-crop-window.ts';
import { Local } from '@/tools/localization.ts';
import { PresetElement } from '@/tools/preset-element-window.ts';
import { PresetObject } from '@/tools/scene-preset-window.ts';
import { Variable } from '@/variable/variable.ts';

interface CustomBoxElement extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;
	type: string | null;
	filter: string | null;
	openDialogDir(input: { read(): any; write(v: any): void }): void;
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

export function attachCustomBoxApi(el: HTMLElement): void {
	const box = el as CustomBoxElement;

	const text = document.createElement('text');
	addClass(text, 'custom-box-text');
	box.info = text;
	box.dataValue = null;
	box.writeEventEnabled = false;
	box.inputEventEnabled = false;
	box._initialized = true;

	box.appendChild(text);
	box.tabIndex = 0;

	Object.defineProperty(box, 'type', {
		get: (): string | null => box.getAttribute('type'),
		set: (value: string): void => {
			box.setAttribute('type', value);
		}
	});
	Object.defineProperty(box, 'filter', {
		get: (): string | null => box.getAttribute('filter'),
		set: (value: string): void => {
			box.setAttribute('filter', value);
		}
	});

	const updateFile = (guid: string): void => {
		Command.invalid = false;
		text.textContent = Command.removeTextTags!(Command.parseFileName!(guid));
		if (Command.invalid) addClass(text, 'invalid');
	};

	const updateDialogDir = (path: string): void => {
		text.textContent = path;
	};

	const updateClip = (clip: number[]): void => {
		text.textContent = clip.join(', ');
	};

	const updateVariable = (variable: any): void => {
		if (variable.type === 'self' || variable.key) {
			text.textContent = Command.removeTextTags!(Command.parseVariable!(variable));
		} else {
			text.textContent = (Local.get as any)('common.none');
		}
	};

	const updateGlobalVariable = (id: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseGlobalVariable!(id));
	};

	const updateActor = (actor: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseActor!(actor));
	};

	const updateSkill = (skill: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseSkill!(skill));
	};

	const updateState = (state: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseState!(state));
	};

	const updateEquipment = (equipment: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseEquipment!(equipment));
	};

	const updateItem = (item: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseItem!(item));
	};

	const updatePosition = (point: any): void => {
		text.textContent = Command.removeTextTags!(Command.parsePosition!(point));
	};

	const updateAngle = (angle: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseAngle!(angle));
	};

	const updateTrigger = (trigger: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseTrigger!(trigger));
	};

	const updateLight = (light: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseLight!(light));
	};

	const updateRegion = (region: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseRegion!(region));
	};

	const updateTilemap = (tilemap: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseTilemap!(tilemap));
	};

	const updateObject = (object: any): void => {
		text.textContent = Command.removeTextTags!(Command.parseObject!(object));
	};

	const updateElement = (element: any): void => {
		Command.invalid = false;
		text.textContent = Command.removeTextTags!(Command.parseElement!(element));
		if (Command.invalid) addClass(text, 'invalid');
	};

	const updatePresetObject = (preset: any): void => {
		text.textContent = Command.removeTextTags!(Command.parsePresetObject!(preset));
	};

	const updatePresetElement = (preset: any): void => {
		text.textContent = Command.removeTextTags!(Command.parsePresetElement!(preset));
		if (Command.invalid) addClass(text, 'invalid');
	};

	const updateArray = (array: any[]): void => {
		text.textContent =
			array.length !== 0
				? Command.parseMultiLineString!(array.join(', '))
				: (Local.get as any)('common.empty');
	};

	const updateAttributeGroup = (groupId: string): void => {
		Command.invalid = false;
		text.textContent = Command.removeTextTags!(Command.parseAttributeGroup!(groupId));
		if (Command.invalid) addClass(text, 'invalid');
	};

	const updateAttribute = (attrId: string): void => {
		if (attrId === '') {
			text.textContent = (Local.get as any)('common.none');
			return;
		}
		const attribute = (Attribute as any).getAttribute(attrId);
		if (attribute) {
			text.textContent = GameLocal.replace(attribute.name);
		} else {
			text.textContent = Command.parseUnlinkedId!(attrId);
			addClass(text, 'invalid');
		}
	};

	const updateEnumGroup = (groupId: string): void => {
		Command.invalid = false;
		text.textContent = Command.removeTextTags!(Command.parseEnumGroup!(groupId));
		if (Command.invalid) addClass(text, 'invalid');
	};

	const updateEnumString = (stringId: string): void => {
		if (stringId === '') {
			text.textContent = (Local.get as any)('common.none');
			return;
		}
		const string = (Enum as any).getString(stringId);
		if (string) {
			text.textContent = GameLocal.replace(string.name);
		} else {
			text.textContent = Command.parseUnlinkedId!(stringId);
			addClass(text, 'invalid');
		}
	};

	const update = (): void => {
		removeClass(text, 'invalid');
		const value = box.dataValue;
		switch (box.type) {
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

	box.read = function (): any {
		return box.dataValue;
	};

	box.write = function (value: any): void {
		box.dataValue = value;
		update();
		if (box.writeEventEnabled) {
			const write: any = new Event('write');
			write.value = box.dataValue;
			box.dispatchEvent(write);
		}
	};

	box.input = function (value: any): void {
		if (box.dataValue !== value) {
			box.write(value);
			if (box.inputEventEnabled) {
				const input: any = new Event('input');
				input.value = box.dataValue;
				box.dispatchEvent(input);
			}
			dispatchChangeEvent(box);
		} else {
			if (box.type === 'file') {
				update();
			}
		}
	};

	box.openDialogDir = function (input: { read(): any; write(v: any): void }): void {
		File.showOpenDialog!({
			defaultPath: input.read(),
			properties: ['openDirectory']
		}).then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length === 1) {
				input.write(filePaths[0]);
			}
		});
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			box.tabIndex += 1;
			showChildNodes(box);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			box.tabIndex -= 1;
			hideChildNodes(box);
		}
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'write':
				box.writeEventEnabled = true;
				break;
			case 'input':
				box.inputEventEnabled = true;
				break;
		}
	};

	box.click = function (event?: Event): void {
		switch (box.type) {
			case 'file':
				return ((window as any).Selector as any).open(box);
			case 'dialog-dir':
				return box.openDialogDir(box);
			case 'clip':
				return (ImageClip as any).open(box);
			case 'variable':
				return (VariableGetter as any).open(box);
			case 'global-variable':
				return (Variable as any).open(box);
			case 'actor':
				return (ActorGetter as any).open(box);
			case 'skill':
				return (SkillGetter as any).open(box);
			case 'state':
				return (StateGetter as any).open(box);
			case 'equipment':
				return (EquipmentGetter as any).open(box);
			case 'item':
				return (ItemGetter as any).open(box);
			case 'position':
				return (PositionGetter as any).open(box);
			case 'angle':
				return (AngleGetter as any).open(box);
			case 'trigger':
				return (TriggerGetter as any).open(box);
			case 'light':
				return (LightGetter as any).open(box);
			case 'region':
				return (RegionGetter as any).open(box);
			case 'tilemap':
				return (TilemapGetter as any).open(box);
			case 'object':
				return (ObjectGetter as any).open(box);
			case 'element':
				return (ElementGetter as any).open(box);
			case 'ancestor-element':
				return (AncestorGetter as any).open(box);
			case 'preset-object':
				return (PresetObject as any).open(box);
			case 'preset-element':
				return (PresetElement as any).open(box);
			case 'array':
				return (ArrayList as any).open(box);
			case 'attribute':
				return (Attribute as any).open(box, 'attribute');
			case 'attribute-group':
				return (Attribute as any).open(box, 'group');
			case 'enum-group':
				return (Enum as any).open(box, 'group');
			case 'enum-string':
				return (Enum as any).open(box, 'string');
		}
	};

	box.keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					box.click(event);
				}
				break;
		}
	};

	box.dragenter = function (event: DragEvent): void {
		return box.dragover(event);
	};

	box.dragleave = function (event: DragEvent): void {
		if (!box.contains(event.relatedTarget as Node)) {
			removeClass(box, 'dragover');
		}
	};

	box.dragover = function (event: DragEvent): void {
		if (box.type === 'file' && (window as any).Browser?.dragging) {
			const file = ((window as any).Browser?.body as any)?.activeFile;
			if (
				file instanceof FileItem &&
				(!box.filter || box.filter.indexOf((file as any).type) !== -1)
			) {
				(event as any).dataTransfer.dropEffect = 'move';
				event.preventDefault();
				addClass(box, 'dragover');
			}
		}
	};

	box.drop = function (event: DragEvent): void {
		const file = ((window as any).Browser?.body as any)?.activeFile;
		if (file instanceof FileItem) {
			box.focus();
			box.input((file.meta as any).guid);
			removeClass(box, 'dragover');
		}
	};

	box.update = update;

	on(box, 'keydown', box.keydown);
	on(box, 'click', box.click);
	on(box, 'dragenter', box.dragenter);
	on(box, 'dragleave', box.dragleave);
	on(box, 'dragover', box.dragover);
	on(box, 'drop', box.drop);
}

export function createCustomBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'custom-box';
	attachCustomBoxApi(el);
	return el;
}
