import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus } from '@app/utils/element-utils';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { createSelectBox } from '@app/legacy/components/select-box.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { GameLocal } from '@app/legacy/local/local-object.ts';

import { IListInterface } from '@app/legacy/types/list-interface.ts';
import { IEditableHistory } from '@app/legacy/types/history.ts';

interface AttributeItemShape {
	key: string;
	value: string | number | boolean;
}

export class AttributeListInterface implements IListInterface {
	target!: HTMLElement | null;
	type!: string;
	group!: string;
	history!: IEditableHistory | null;
	editor!: { target?: unknown } | null;
	owner!: { history?: unknown } | null;

	constructor(editor?: { target?: unknown }, owner?: { history?: unknown }) {
		this.editor = editor ?? null;
		this.owner = owner ?? null;
	}

	initialize(list: HTMLElement): void {
		this.target = null;
		this.type = 'object-attribute';
		let match = list.id.match(/^config-(.+)-tempAttributes$/);
		if (!match) {
			match = list.id.match(/^file([A-Z][a-zA-Z]*)/);
		}
		this.group = list.getAttribute('group') ?? (match ? match[1].toLowerCase() : '');

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory(editor, owner, list);
		}
	}

	parse(
		item: AttributeItemShape
	): AttributeItemShape | Array<{ content: unknown; class: string }> {
		if (item instanceof Object) {
			let { key, value } = item;
			if (typeof value === 'string') {
				value = Command.parseMultiLineString(value);
			}
			const attr = Attribute.getGroupAttribute(this.group, key);
			let attrName = '';
			let attrClass = '';
			let valueClass = '';
			switch (attr?.type) {
				case 'boolean':
				case 'number':
				case 'string':
					attrName = attr.name;
					if (typeof value !== attr.type) {
						valueClass = 'invalid';
					}
					if (typeof value === 'string') {
						value = GameLocal.replace(value);
					}
					break;
				case 'enum': {
					attrName = attr.name;
					const item = Enum.getGroupString(attr.enum, value as string);
					if (item) {
						value = item.name;
					} else {
						value = Command.parseUnlinkedId(value);
						valueClass = 'invalid';
					}
					break;
				}
				case undefined:
					attrName = Command.parseUnlinkedId(key);
					attrClass = 'invalid';
					break;
			}
			attrName = GameLocal.replace(attrName);
			return [
				{ content: attrName, class: attrClass },
				{ content: value, class: valueClass }
			];
		}
		return item;
	}

	open(item: AttributeItemShape = { key: '', value: 0 }) {
		AttributeListInterface.target = this.target;
		Window.open!('object-attribute');
		const isNew = item.key === '';
		if (isNew) {
			item.key = Attribute.getDefAttributeId(this.group);
			switch (Attribute.getGroupAttribute(this.group, item.key)?.type) {
				case 'boolean':
					item.value = false;
					break;
				case 'number':
					item.value = 0;
					break;
				case 'string':
					item.value = '';
					break;
				case 'enum':
					item.value = '';
					break;
			}
		}
		const key = item.key;
		const type = Attribute.getGroupAttribute(this.group, key)?.type ?? typeof item.value;
		const booleanValue = type === 'boolean' ? item.value : false;
		const numberValue = type === 'number' ? item.value : 0;
		const stringValue = type === 'string' ? item.value : '';
		const enumValue = type === 'enum' ? item.value : '';
		const keyBox = $('#object-attribute-key');
		keyBox.loadItems(Attribute.getAttributeItems(this.group, 'boolean number string'));
		const invalid = !Attribute.getGroupAttribute(this.group, key);
		if (invalid) AttributeListInterface.typeBox.write(type);
		const write = getElementWriter('object-attribute');
		write('key', key);
		write('boolean-value', booleanValue);
		write('number-value', numberValue);
		write('string-value', stringValue);
		if (enumValue) {
			write('enum-value', enumValue);
		}
		if (isNew || invalid) {
			return getFocus($('#object-attribute-key'));
		}
		switch (type) {
			case 'boolean':
				return getFocus($('#object-attribute-boolean-value'));
			case 'number':
				return getFocus($('#object-attribute-number-value'), 'all');
			case 'string':
				return getFocus($('#object-attribute-string-value'), 'all');
			case 'enum': {
				const attr = Attribute.getGroupAttribute(this.group, key);
				const enumBox = $('#object-attribute-enum-value');
				if (attr && enumBox) {
					enumBox.loadItems(Enum.getStringItems(attr.enum));
				}
				return getFocus($('#object-attribute-enum-value'));
			}
		}
	}

	save() {
		const read = getElementReader('object-attribute');
		const type = AttributeListInterface.typeBox.read();
		const key = read('key');
		if (key === '') {
			return getFocus($('#object-attribute-key'));
		}
		let value;
		switch (type) {
			case 'boolean':
				value = read('boolean-value');
				break;
			case 'number':
				value = read('number-value');
				break;
			case 'string':
				value = read('string-value');
				break;
			case 'enum':
				value = read('enum-value');
				if (value === '') {
					return getFocus($('#object-attribute-enum-value'));
				}
				break;
		}
		Window.close!('object-attribute');
		return { key, value };
	}

	static target: HTMLElement | null = null;

	static initialize() {
		this.typeBox.loadItems([
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Number', value: 'number' },
			{ name: 'String', value: 'string' },
			{ name: 'Enum', value: 'enum' }
		]);

		this.typeBox.enableHiddenMode().relate([
			{
				case: 'boolean',
				targets: [$('#object-attribute-boolean-value')]
			},
			{ case: 'number', targets: [$('#object-attribute-number-value')] },
			{ case: 'string', targets: [$('#object-attribute-string-value')] },
			{ case: 'enum', targets: [$('#object-attribute-enum-value')] }
		]);

		const boolValEl = $('#object-attribute-boolean-value');
		if (!boolValEl) return;
		boolValEl.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		// key write 经 Vue 模板转发（ObjectAttribute.vue @write → AttributeListInterface.keyWrite）
	}

	static keyWrite(event: { value: string }) {
		let group = this.target?.getAttribute?.('group') as unknown as string;
		if (!group && this.target) {
			let match = this.target.id.match(/^config-(.+)-tempAttributes$/);
			if (!match) {
				match = this.target.id.match(/^file([A-Z][a-zA-Z]*)/);
			}
			group = match ? match[1].toLowerCase() : '';
		}
		const attr = Attribute.getGroupAttribute(group, event.value);
		if (attr) {
			AttributeListInterface.typeBox.write(attr.type);
			if (attr.type === 'enum') {
				const enumBox = $('#object-attribute-enum-value');
				enumBox.loadItems(Enum.getStringItems(attr.enum));
				enumBox.write?.(Enum.getDefStringId(attr.enum));
			}
		}
	}

	static _typeBox: ReturnType<typeof createSelectBox> | null = null;

	static get typeBox() {
		if (!this._typeBox) this._typeBox = createSelectBox();
		return this._typeBox;
	}
}
