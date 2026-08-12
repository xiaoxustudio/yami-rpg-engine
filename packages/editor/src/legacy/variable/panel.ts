import { $ } from '@/util/dom.ts';
import { disable, enable, hide, read, show, write } from '@/util/element-utils.ts';
import { getVariableStore } from '@app/stores/variable';
import type { VariableItemShape } from '@app/stores/variable';
import { Variable } from './variable.ts';

Variable.openPropertyPanel = function (this: typeof Variable, variable: unknown) {
	const panel = this.panel;
	if (getVariableStore().state.selected !== variable) {
		getVariableStore().state.selected = variable as VariableItemShape;
		show(panel);
		const { inputs } = this;
		const { name, sort, value, note } = variable as {
			name?: unknown;
			sort?: unknown;
			value?: unknown;
			note?: unknown;
		};
		const type = typeof value;
		write(inputs.name, name);
		write(inputs.sort, sort);
		write(inputs.type, type);
		write(inputs.boolean, type === 'boolean' ? value : false);
		write(inputs.number, type === 'number' ? value : 0);
		write(inputs.string, type === 'string' ? value : '');
		write(inputs.note, note);
	}
};

Variable.closePropertyPanel = function () {
	const panel = this.panel;
	if (getVariableStore().state.selected) {
		getVariableStore().state.selected = null;
		hide(panel);
	}
};

Variable.nameInput = function (event: Event) {
	const item = getVariableStore().state.selected!;
	if (item.class !== 'folder') {
		Variable.saveHistory(item, 'name', item.name);
		item.name = (event.target as HTMLInputElement).value;
		Variable.list.updateItemName(item);
		Variable.changed = true;
	}
};

Variable.sortWrite = function (event: Event & { value?: number }) {
	switch (event.value) {
		case 0:
		case 1:
			disable($('#variable-type-object'));
			break;
		case 2:
			enable($('#variable-type-object'));
			break;
	}
};

Variable.sortInput = function (event: Event & { value?: number }) {
	const item = getVariableStore().state.selected!;
	const sort = event.value;
	Variable.saveHistory(item, 'sort', {
		sort: item.sort,
		value: item.value
	});
	// 如果从临时变量对象类型切换到其他分类，修改变量的值为布尔值
	if (item.value === null) {
		item.value = read(Variable.inputs.boolean);
		write(Variable.inputs.type, 'boolean');
		Variable.list.updateIcon(item);
		Variable.list.updateInitText(item);
	}
	item.sort = sort;
	Variable.list.updateItemClass(item);
	Variable.changed = true;
};

Variable.typeWrite = function (event: Event & { value?: string }) {
	const { style } = Variable.inputs.value;
	Variable.manager.switch(event.value);
	switch (event.value) {
		case 'boolean':
		case 'number':
		case 'string':
			style.visibility = 'visible';
			break;
		case 'object':
			style.visibility = 'hidden';
			break;
	}
};

Variable.typeInput = function (event: Event & { value?: string }) {
	const item = getVariableStore().state.selected!;
	const type = event.value;
	Variable.saveHistory(item, 'type', item.value);
	switch (type) {
		case 'boolean':
		case 'number':
		case 'string':
			item.value = read(Variable.inputs[type]);
			break;
		case 'object':
			item.value = null;
			break;
	}
	Variable.list.updateIcon(item);
	Variable.list.updateInitText(item);
	Variable.changed = true;
};

Variable.valueInput = function (this: HTMLElement, event: Event) {
	if ((event as InputEvent).inputType !== 'insertCompositionText') {
		const item = getVariableStore().state.selected!;
		Variable.saveHistory(item, 'value', item.value);
		item.value = read(this);
		Variable.list.updateInitText(item);
		Variable.changed = true;
	}
};

Variable.noteInput = function (this: HTMLElement, event: Event) {
	if ((event as InputEvent).inputType !== 'insertCompositionText') {
		const item = getVariableStore().state.selected!;
		Variable.saveHistory(item, 'note', item.note);
		item.note = read(this);
		Variable.list.updateNoteIcon(item);
		Variable.changed = true;
	}
};
