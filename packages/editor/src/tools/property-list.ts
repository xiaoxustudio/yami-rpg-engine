import { reactive } from 'vue';
import { createElementRegistry } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { createSelectBox } from '@app/components/select-box.ts';
import { requestFocus } from '@app/directives/focus';
import { Enum } from '@app/enum/enum-window.ts';
import { ParamHistory } from '@app/composables/useParamHistory';
import { GameLocal } from '@app/local/local-object.ts';

import { IListInterface } from '@app/types/list-interface.ts';
import { IUndoRedoHistory } from '@app/types/history.ts';

/** P5b 批次 3：元素注册表——由对应窗口 SFC 在模板里登记 */
export const objectAttributeEls = createElementRegistry();

interface AttributeItemShape {
	key: string;
	value: string | number | boolean;
}

export interface AttributeForm {
	key: string;
	booleanValue: boolean;
	numberValue: number;
	stringValue: string;
	enumValue: string;
}

export const form = reactive<AttributeForm>({
	key: '',
	booleanValue: false,
	numberValue: 0,
	stringValue: '',
	enumValue: ''
});

export class AttributeListInterface implements IListInterface {
	target!: HTMLElement | null;
	type!: string;
	group!: string;
	history!: IUndoRedoHistory | null;
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
			// 第 105 轮：字段类型收窄成 `IUndoRedoHistory` 后不再需要 `as unknown as`。
			this.history = new ParamHistory(editor, owner, list);
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
		const booleanValue = type === 'boolean' ? (item.value as boolean) : false;
		const numberValue = type === 'number' ? (item.value as number) : 0;
		const stringValue = type === 'string' ? (item.value as string) : '';
		const enumValue = type === 'enum' ? (item.value as string) : '';
		const keyBox = objectAttributeEls.get('object-attribute-key');
		keyBox?.loadItems?.(Attribute.getAttributeItems(this.group, 'boolean number string'));
		const invalid = !Attribute.getGroupAttribute(this.group, key);
		if (invalid) AttributeListInterface.typeBox.write(type);
		Object.assign(form, { key, booleanValue, numberValue, stringValue, enumValue });
		if (isNew || invalid) {
			return requestFocus('object-attribute-key');
		}
		switch (type) {
			case 'boolean':
				return requestFocus('object-attribute-boolean-value');
			case 'number':
				return requestFocus('object-attribute-number-value', 'all');
			case 'string':
				return requestFocus('object-attribute-string-value', 'all');
			case 'enum': {
				const attr = Attribute.getGroupAttribute(this.group, key);
				const enumBox = objectAttributeEls.get('object-attribute-enum-value');
				if (attr && enumBox) {
					enumBox?.loadItems?.(Enum.getStringItems(attr.enum));
				}
				return requestFocus('object-attribute-enum-value');
			}
		}
	}

	save() {
		const type = AttributeListInterface.typeBox.read();
		const key = form.key;
		if (key === '') {
			return requestFocus('object-attribute-key');
		}
		let value;
		switch (type) {
			case 'boolean':
				value = form.booleanValue;
				break;
			case 'number':
				value = form.numberValue;
				break;
			case 'string':
				value = form.stringValue;
				break;
			case 'enum':
				value = form.enumValue;
				if (value === '') {
					return requestFocus('object-attribute-enum-value');
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
				targets: [objectAttributeEls.get('object-attribute-boolean-value')]
			},
			{ case: 'number', targets: [objectAttributeEls.get('object-attribute-number-value')] },
			{ case: 'string', targets: [objectAttributeEls.get('object-attribute-string-value')] },
			{ case: 'enum', targets: [objectAttributeEls.get('object-attribute-enum-value')] }
		]);

		const boolValEl = objectAttributeEls.get('object-attribute-boolean-value');
		if (!boolValEl) return;
		boolValEl.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);

		// key write 缁?Vue 妯℃澘杞彂锛圤bjectAttribute.vue @write 鈫?AttributeListInterface.keyWrite锛?
	}

	static keyWrite(event: { value: string }) {
		if (!event.value) return;
		let group = this.target?.getAttribute?.('group') as string;
		if (!group && this.target) {
			let match = this.target.id.match(/^config-(.+)-tempAttributes$/);
			if (!match) {
				match = this.target.id.match(/^file([A-Z][a-zA-Z]*)/);
			}
			group = match ? match[1].toLowerCase() : '';
		}
		let attr;
		try {
			attr = Attribute.getGroupAttribute(group, event.value);
		} catch {
			return;
		}
		if (attr) {
			AttributeListInterface.typeBox.write(attr.type);
			if (attr.type === 'enum') {
				const enumBox = objectAttributeEls.get('object-attribute-enum-value');
				enumBox?.loadItems?.(Enum.getStringItems(attr.enum));
				form.enumValue = Enum.getDefStringId(attr.enum);
			}
		}
	}

	static _typeBox: ReturnType<typeof createSelectBox> | null = null;

	static get typeBox() {
		if (!this._typeBox) this._typeBox = createSelectBox();
		return this._typeBox;
	}
}
