import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus, read, write } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';
function getWindow() {
	return (window as any).Window;
}
export const IndexBind = {
	target: null,
	type: null,
	initialize() {
		this.target = null;
		this.type = 'get-object-index';
		$('#ObjectProperty-index-confirm')?.on('click', this.confirm);
	},
	parse(item: any) {
		return `${item.text}`;
	},
	open(item: any) {
		getWindow().open('ObjectProperty-index');
		getFocus($('#ObjectProperty-index-name'));
		if (item) {
			write($('#ObjectProperty-index-name'), item.text);
		} else {
			write($('#ObjectProperty-index-name'), '');
		}
	},
	save() {
		const elementReader = getElementReader('ObjectProperty-index');
		const data = { text: elementReader('name') };
		write($('#ObjectProperty-index-name'), '');
		getWindow().close('ObjectProperty-index');
		return data;
	},
	confirm() {
		return IndexBind.target.save();
	}
};

Command.cases.getObjectProperty = new CommandSchema({
	name: 'getObjectProperty',
	onInitialize() {
		$('#getObjectProperty-confirm').on('click', () => this.save());
		$('#getObjectProperty-list').bind(IndexBind);
		$('#getObjectProperty').on('closed', () => {
			clear($('#getObjectProperty-list'));
		});
	},
	customParse({ variable, saveVariable, properties }: any) {
		const contents = [];
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text });
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.getObjectProperty') + ' ' },
			{ text: Command.parseVariable(saveVariable, 'any') + '=' },
			{ text: Command.parseVariable(variable, 'any') + '.' }
		].concat(contents.slice(1));
	},
	customLoad({
		variable = { type: 'local', key: '' },
		saveVariable = { type: 'local', key: '' },
		properties = []
	}) {
		write($('#getObjectProperty-save-variable'), saveVariable);
		write($('#getObjectProperty-variable'), variable);
		getFocus($('#getObjectProperty-variable'));
		const elementWriter = getElementWriter('getObjectProperty');
		elementWriter('list', properties);
	},
	customSave() {
		const elVariable = $('#getObjectProperty-variable');
		const variable = read(elVariable);
		if (VariableGetter.isNone(variable)) {
			return getFocus(elVariable);
		}
		const elsaveVariable = $('#getObjectProperty-save-variable');
		const saveVariable = read(elsaveVariable);
		if (VariableGetter.isNone(saveVariable)) {
			return getFocus(elsaveVariable);
		}
		const elementReader = getElementReader('getObjectProperty');
		const properties = elementReader('list');
		if (properties.length === 0) {
			return getFocus($('#getObjectProperty-list'));
		}
		Command.save({ variable, saveVariable, properties });
	}
});

Command.cases.setObjectProperty = new CommandSchema({
	name: 'setObjectProperty',
	onInitialize() {
		$('#setObjectProperty-confirm').on('click', () => this.save());
		$('#setObjectProperty-list').bind(IndexBind);
		$('#setObjectProperty').on('closed', () => {
			clear($('#setObjectProperty-list'));
		});
	},
	customParse({ variable, valueVariable, properties }: any) {
		const contents = [];
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text });
		}
		return [
			{ color: 'variable' },
			{ text: Local.get('command.setObjectProperty') + ' ' },
			{ text: Command.parseVariable(variable, 'any') + '.' }
		]
			.concat(contents.slice(1))
			.concat([{ text: '=' + Command.parseVariable(valueVariable, 'any') }]);
	},
	customLoad({
		variable = { type: 'local', key: '' },
		valueVariable = { type: 'local', key: '' },
		properties = []
	}) {
		write($('#setObjectProperty-value-variable'), valueVariable);
		write($('#setObjectProperty-variable'), variable);
		getFocus($('#setObjectProperty-variable'));
		const elementWriter = getElementWriter('setObjectProperty');
		elementWriter('list', properties);
	},
	customSave() {
		const elVariable = $('#setObjectProperty-variable');
		const variable = read(elVariable);
		if (VariableGetter.isNone(variable)) {
			return getFocus(elVariable);
		}
		const elvalueVariable = $('#setObjectProperty-value-variable');
		const valueVariable = read(elvalueVariable);
		if (VariableGetter.isNone(valueVariable)) {
			return getFocus(elvalueVariable);
		}
		const elementReader = getElementReader('setObjectProperty');
		const properties = elementReader('list');
		if (properties.length === 0) {
			return getFocus($('#setObjectProperty-list'));
		}
		Command.save({ variable, valueVariable, properties });
	}
});
