import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Window } from '@app/tools/window-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';
import { getCommandFormsStore } from '@app/stores/command-forms';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import type { YamiElement } from '@app/types/element-api';

export type ObjectPropertyItem = { text: string };

export const indexForm: { name: string } = {
	get name() {
		return getCommandFormsStore().indexForm.name;
	},
	set name(value: string) {
		getCommandFormsStore().indexForm.name = value;
	}
};

export const IndexBind = {
	target: null as YamiElement | null,
	type: null as string | null,
	initialize() {
		this.target = null;
		this.type = 'get-object-index';
	},
	parse(item: ObjectPropertyItem | null) {
		return `${item!.text}`;
	},
	open(item: ObjectPropertyItem | null) {
		Window.open!('ObjectProperty-index');
		requestFocus('ObjectProperty-index-name');
		indexForm.name = item?.text ?? '';
	},
	save() {
		const data = { text: indexForm.name };
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

export interface SetObjectPropertyForm {
	variable: { type: string; key: string };
	valueVariable: { type: string; key: string };
	list?: ObjectPropertyItem[];
}

const setForm: SetObjectPropertyForm = {
	get variable() {
		return getCommandFormsStore().objectPropertyForm.variable;
	},
	set variable(value: { type: string; key: string }) {
		getCommandFormsStore().objectPropertyForm.variable = value;
	},
	get valueVariable() {
		return getCommandFormsStore().objectPropertyForm.valueVariable;
	},
	set valueVariable(value: { type: string; key: string }) {
		getCommandFormsStore().objectPropertyForm.valueVariable = value;
	},
	get list() {
		return getCommandFormsStore().objectPropertyForm.list as ObjectPropertyItem[] | undefined;
	},
	set list(value: ObjectPropertyItem[] | undefined) {
		getCommandFormsStore().objectPropertyForm.list = value;
	}
};

Command.cases.setObjectProperty = new CommandSchema({
	name: 'setObjectProperty',
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
		Object.assign(setForm, { variable, valueVariable, list: properties });
		requestFocus('setObjectProperty-variable');
	},
	customSave() {
		const variable = setForm.variable;
		if (VariableGetter.isNone!(variable)) {
			return requestFocus('setObjectProperty-variable');
		}
		const valueVariable = setForm.valueVariable;
		if (VariableGetter.isNone!(valueVariable)) {
			return requestFocus('setObjectProperty-value-variable');
		}
		const properties = setForm.list ?? [];
		if (properties.length === 0) {
			return requestFocus('setObjectProperty-list');
		}
		Command.save!({ variable, valueVariable, properties });
	}
});

export function useGetObjectPropertyCommandSchema() {
	const { form, load, commit } = useCommandSchema('getObjectProperty', {
		skipWrite: true,
		onLoad() {
			requestFocus('getObjectProperty-variable');
		}
	});
	const onSave = (): void => {
		const variable = form.variable;
		if (VariableGetter.isNone!(variable as { key: string })) {
			requestFocus('getObjectProperty-variable');
			return;
		}
		const saveVariable = form.saveVariable;
		if (VariableGetter.isNone!(saveVariable as { key: string })) {
			requestFocus('getObjectProperty-save-variable');
			return;
		}
		const properties = form.properties as ObjectPropertyItem[];
		if (properties.length === 0) {
			requestFocus('getObjectProperty-list');
			return;
		}
		commit({ variable, saveVariable, properties });
	};
	Command.cases.getObjectProperty.customSave = onSave;
	return { form, save: onSave, load };
}

export function useSetObjectPropertyCommandSchema() {
	const load = (params: Record<string, unknown>): void => {
		Command.cases.setObjectProperty.load!(params);
	};
	const save = (): unknown => Command.cases.setObjectProperty.save!();
	Command.cases.setObjectProperty.onInitialize = (): void => {};
	return { form: setForm, load, save };
}
