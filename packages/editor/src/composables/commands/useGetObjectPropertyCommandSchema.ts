import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

export type ObjectPropertyItem = { text: string };

export const IndexBind = {
	target: null as unknown as HTMLElement | null,
	type: null as unknown as string | null,
	initialize() {
		this.target = null;
		this.type = 'get-object-index';
	},
	parse(item: ObjectPropertyItem | null) {
		return `${item!.text}`;
	},
	open(item: ObjectPropertyItem | null) {
		Window.open!('ObjectProperty-index');
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
		Window.close!('ObjectProperty-index');
		return data;
	},
	confirm() {
		return IndexBind.target?.save?.();
	}
};

type GetObjectPropertyCommandData = {
	variable: unknown;
	saveVariable: unknown;
	properties: ObjectPropertyItem[];
};

type SetObjectPropertyCommandData = {
	variable: unknown;
	valueVariable: unknown;
	properties: ObjectPropertyItem[];
};

Command.cases.getObjectProperty = new CommandSchema({
	name: 'getObjectProperty',
	fields: [
		{ key: 'variable', default: { type: 'local', key: '' } },
		{ key: 'saveVariable', default: { type: 'local', key: '' }, domId: 'save-variable' },
		{ key: 'properties', default: [], domId: 'list' }
	],
	customParse({ variable, saveVariable, properties }: GetObjectPropertyCommandData) {
		const contents: Array<{ text?: string; color?: string }> = [];
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text });
		}
		return (
			[
				{ color: 'variable' },
				{ text: t('command.getObjectProperty') + ' ' },
				{ text: Command.parseVariable!(saveVariable, 'any') + '=' },
				{ text: Command.parseVariable!(variable, 'any') + '.' }
			] as Array<{ text?: string; color?: string }>
		).concat(contents.slice(1));
	}
});

Command.cases.setObjectProperty = new CommandSchema({
	name: 'setObjectProperty',
	onInitialize() {
		$('#setObjectProperty-list')?.bind?.(IndexBind);
		$('#setObjectProperty')?.on?.('closed', () => {
			clear($('#setObjectProperty-list'));
		});
	},
	customParse({ variable, valueVariable, properties }: SetObjectPropertyCommandData) {
		const contents: Array<{ text?: string; color?: string }> = [];
		for (const i of properties) {
			contents.push({ text: '.' }, { color: 'normal' }, { text: i.text });
		}
		return (
			[
				{ color: 'variable' },
				{ text: t('command.setObjectProperty') + ' ' },
				{ text: Command.parseVariable!(variable, 'any') + '.' }
			] as Array<{ text?: string; color?: string }>
		)
			.concat(contents.slice(1))
			.concat([{ text: '=' + Command.parseVariable!(valueVariable, 'any') }]);
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
		if (VariableGetter.isNone!(variable)) {
			return getFocus(elVariable);
		}
		const elvalueVariable = $('#setObjectProperty-value-variable');
		const valueVariable = read(elvalueVariable);
		if (VariableGetter.isNone!(valueVariable)) {
			return getFocus(elvalueVariable);
		}
		const elementReader = getElementReader('setObjectProperty');
		const properties = elementReader('list');
		if (properties.length === 0) {
			return getFocus($('#setObjectProperty-list'));
		}
		Command.save!({ variable, valueVariable, properties });
	}
});

export function useGetObjectPropertyCommandSchema() {
	const { form, save, load, commit } = useCommandSchema('getObjectProperty', {
		onLoad() {
			getFocus(document.getElementById('getObjectProperty-variable'));
		}
	});
	const onSave = (): void => {
		const variable =
			read(document.getElementById('getObjectProperty-variable')) ?? form.variable;
		if (VariableGetter.isNone!(variable)) {
			getFocus(document.getElementById('getObjectProperty-variable'));
			return;
		}
		const saveVariable =
			read(document.getElementById('getObjectProperty-save-variable')) ?? form.saveVariable;
		if (VariableGetter.isNone!(saveVariable)) {
			getFocus(document.getElementById('getObjectProperty-save-variable'));
			return;
		}
		const properties =
			read(document.getElementById('getObjectProperty-list')) ?? form.properties;
		if (properties.length === 0) {
			getFocus(document.getElementById('getObjectProperty-list'));
			return;
		}
		commit({ variable, saveVariable, properties });
	};
	Command.cases.getObjectProperty.customSave = onSave;
	return { form, save: onSave, load };
}
