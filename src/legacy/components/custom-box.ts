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

export class CustomBox extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;

	constructor() {
		super();

		const text = document.createElement('text');
		addClass(text, 'custom-box-text');
		this.info = text;
		this.dataValue = null;
		this.writeEventEnabled = false;
		this.inputEventEnabled = false;
		this._initialized = false;

		on(this, 'keydown', this.keydown);
		on(this, 'click', this.click);
		on(this, 'dragenter', this.dragenter);
		on(this, 'dragleave', this.dragleave);
		on(this, 'dragover', this.dragover);
		on(this, 'drop', this.drop);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.appendChild(this.info);
		this.tabIndex = 0;
	}

	get type(): string | null {
		return this.getAttribute('type');
	}

	set type(value: string) {
		this.setAttribute('type', value);
	}

	get filter(): string | null {
		return this.getAttribute('filter');
	}

	set filter(value: string) {
		this.setAttribute('filter', value);
	}

	read(): any {
		return this.dataValue;
	}

	write(value: any): void {
		this.dataValue = value;
		this.update();
		if (this.writeEventEnabled) {
			const write: any = new Event('write');
			write.value = this.dataValue;
			this.dispatchEvent(write);
		}
	}

	input(value: any): void {
		if (this.dataValue !== value) {
			this.write(value);
			if (this.inputEventEnabled) {
				const input: any = new Event('input');
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			dispatchChangeEvent(this);
		} else {
			if (this.type === 'file') {
				this.update();
			}
		}
	}

	update(): void {
		removeClass(this.info, 'invalid');
		const value = this.dataValue;
		switch (this.type) {
			case 'file':
				return this.updateFile(value);
			case 'dialog-dir':
				return this.updateDialogDir(value);
			case 'clip':
				return this.updateClip(value);
			case 'variable':
				return this.updateVariable(value);
			case 'global-variable':
				return this.updateGlobalVariable(value);
			case 'actor':
				return this.updateActor(value);
			case 'skill':
				return this.updateSkill(value);
			case 'state':
				return this.updateState(value);
			case 'equipment':
				return this.updateEquipment(value);
			case 'item':
				return this.updateItem(value);
			case 'position':
				return this.updatePosition(value);
			case 'angle':
				return this.updateAngle(value);
			case 'trigger':
				return this.updateTrigger(value);
			case 'light':
				return this.updateLight(value);
			case 'region':
				return this.updateRegion(value);
			case 'tilemap':
				return this.updateTilemap(value);
			case 'object':
				return this.updateObject(value);
			case 'element':
			case 'ancestor-element':
				return this.updateElement(value);
			case 'preset-object':
				return this.updatePresetObject(value);
			case 'preset-element':
				return this.updatePresetElement(value);
			case 'array':
				return this.updateArray(value);
			case 'attribute':
				return this.updateAttribute(value);
			case 'attribute-group':
				return this.updateAttributeGroup(value);
			case 'enum-group':
				return this.updateEnumGroup(value);
			case 'enum-string':
				return this.updateEnumString(value);
		}
	}

	updateFile(guid: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags!(Command.parseFileName!(guid));
		if (Command.invalid) addClass(this.info, 'invalid');
	}

	updateDialogDir(path: string): void {
		this.info.textContent = path;
	}

	openDialogDir(input: { read(): any; write(v: any): void }): void {
		File.showOpenDialog!({
			defaultPath: input.read(),
			properties: ['openDirectory']
		}).then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length === 1) {
				input.write(filePaths[0]);
			}
		});
	}

	updateClip(clip: number[]): void {
		this.info.textContent = clip.join(', ');
	}

	updateVariable(variable: any): void {
		if (variable.type === 'self' || variable.key) {
			this.info.textContent = Command.removeTextTags!(Command.parseVariable!(variable));
		} else {
			this.info.textContent = (Local.get as any)('common.none');
		}
	}

	updateGlobalVariable(id: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseGlobalVariable!(id));
	}

	updateActor(actor: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseActor!(actor));
	}

	updateSkill(skill: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseSkill!(skill));
	}

	updateState(state: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseState!(state));
	}

	updateEquipment(equipment: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseEquipment!(equipment));
	}

	updateItem(item: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseItem!(item));
	}

	updatePosition(point: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parsePosition!(point));
	}

	updateAngle(angle: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseAngle!(angle));
	}

	updateTrigger(trigger: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseTrigger!(trigger));
	}

	updateLight(light: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseLight!(light));
	}

	updateRegion(region: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseRegion!(region));
	}

	updateTilemap(tilemap: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseTilemap!(tilemap));
	}

	updateObject(object: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parseObject!(object));
	}

	updateElement(element: any): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags!(Command.parseElement!(element));
		if (Command.invalid) addClass(this.info, 'invalid');
	}

	updatePresetObject(preset: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parsePresetObject!(preset));
	}

	updatePresetElement(preset: any): void {
		this.info.textContent = Command.removeTextTags!(Command.parsePresetElement!(preset));
		if (Command.invalid) addClass(this.info, 'invalid');
	}

	updateArray(array: any[]): void {
		this.info.textContent =
			array.length !== 0
				? Command.parseMultiLineString!(array.join(', '))
				: (Local.get as any)('common.empty');
	}

	updateAttributeGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags!(Command.parseAttributeGroup!(groupId));
		if (Command.invalid) addClass(this.info, 'invalid');
	}

	updateAttribute(attrId: string): void {
		if (attrId === '') {
			this.info.textContent = (Local.get as any)('common.none');
			return;
		}
		const attribute = (Attribute as any).getAttribute(attrId);
		if (attribute) {
			this.info.textContent = GameLocal.replace(attribute.name);
		} else {
			this.info.textContent = Command.parseUnlinkedId!(attrId);
			addClass(this.info, 'invalid');
		}
	}

	updateEnumGroup(groupId: string): void {
		Command.invalid = false;
		this.info.textContent = Command.removeTextTags!(Command.parseEnumGroup!(groupId));
		if (Command.invalid) addClass(this.info, 'invalid');
	}

	updateEnumString(stringId: string): void {
		if (stringId === '') {
			this.info.textContent = (Local.get as any)('common.none');
			return;
		}
		const string = (Enum as any).getString(stringId);
		if (string) {
			this.info.textContent = GameLocal.replace(string.name);
		} else {
			this.info.textContent = Command.parseUnlinkedId!(stringId);
			addClass(this.info, 'invalid');
		}
	}

	enable(): void {
		if (removeClass(this, 'disabled')) {
			this.tabIndex += 1;
			showChildNodes(this);
		}
	}

	disable(): void {
		if (addClass(this, 'disabled')) {
			this.tabIndex -= 1;
			hideChildNodes(this);
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'write':
				this.writeEventEnabled = true;
				break;
			case 'input':
				this.inputEventEnabled = true;
				break;
		}
	}

	keydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					this.click(event);
				}
				break;
		}
	}

	click(event?: Event): void {
		switch (this.type) {
			case 'file':
				return ((window as any).Selector as any).open(this);
			case 'dialog-dir':
				return this.openDialogDir(this);
			case 'clip':
				return (ImageClip as any).open(this);
			case 'variable':
				return (VariableGetter as any).open(this);
			case 'global-variable':
				return (Variable as any).open(this);
			case 'actor':
				return (ActorGetter as any).open(this);
			case 'skill':
				return (SkillGetter as any).open(this);
			case 'state':
				return (StateGetter as any).open(this);
			case 'equipment':
				return (EquipmentGetter as any).open(this);
			case 'item':
				return (ItemGetter as any).open(this);
			case 'position':
				return (PositionGetter as any).open(this);
			case 'angle':
				return (AngleGetter as any).open(this);
			case 'trigger':
				return (TriggerGetter as any).open(this);
			case 'light':
				return (LightGetter as any).open(this);
			case 'region':
				return (RegionGetter as any).open(this);
			case 'tilemap':
				return (TilemapGetter as any).open(this);
			case 'object':
				return (ObjectGetter as any).open(this);
			case 'element':
				return (ElementGetter as any).open(this);
			case 'ancestor-element':
				return (AncestorGetter as any).open(this);
			case 'preset-object':
				return (PresetObject as any).open(this);
			case 'preset-element':
				return (PresetElement as any).open(this);
			case 'array':
				return (ArrayList as any).open(this);
			case 'attribute':
				return (Attribute as any).open(this, 'attribute');
			case 'attribute-group':
				return (Attribute as any).open(this, 'group');
			case 'enum-group':
				return (Enum as any).open(this, 'group');
			case 'enum-string':
				return (Enum as any).open(this, 'string');
		}
	}

	dragenter(event: DragEvent): void {
		return this.dragover(event);
	}

	dragleave(event: DragEvent): void {
		if (!this.contains(event.relatedTarget as Node)) {
			removeClass(this, 'dragover');
		}
	}

	dragover(event: DragEvent): void {
		if (this.type === 'file' && (window as any).Browser?.dragging) {
			const file = ((window as any).Browser?.body as any)?.activeFile;
			if (
				file instanceof FileItem &&
				(!this.filter || this.filter.indexOf((file as any).type) !== -1)
			) {
				(event as any).dataTransfer.dropEffect = 'move';
				event.preventDefault();
				addClass(this, 'dragover');
			}
		}
	}

	drop(event: DragEvent): void {
		const file = ((window as any).Browser?.body as any)?.activeFile;
		if (file instanceof FileItem) {
			this.focus();
			this.input((file.meta as any).guid);
			removeClass(this, 'dragover');
		}
	}
}

customElements.define('custom-box', CustomBox as any);
