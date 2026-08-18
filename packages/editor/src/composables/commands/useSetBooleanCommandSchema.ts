import '@app/legacy/module/command/setBoolean.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { reactive } from 'vue';

const form = reactive<Record<string, unknown>>({});

const writeHandler = (event: { value: string }): void => {
	let filter = 'all';
	switch (event.value) {
		case 'variable':
			filter = 'boolean';
			break;
		case 'list':
			filter = 'object';
			break;
	}
	const element = document.getElementById('setBoolean-common-variable');
	if (element) {
		element.filter = filter;
	}
};

const load = ({
	variable = { type: 'local', key: '' },
	operation = 'set',
	operand = { type: 'constant', value: false }
}: {
	variable?: unknown;
	operation?: string;
	operand?: {
		type: string;
		value?: boolean;
		variable?: { type: string; key: string };
		index?: number;
		key?: string;
		script?: string;
	};
} = {}): void => {
	let constantValue = false;
	let commonVariable = { type: 'local', key: '' };
	let listIndex = 0;
	let parameterKey = '';
	let script = '';
	const op = operand ?? ({ type: 'constant', value: false } as typeof operand);
	switch (op.type) {
		case 'constant':
			constantValue = op.value!;
			break;
		case 'variable':
			commonVariable = op.variable!;
			break;
		case 'list':
			commonVariable = op.variable!;
			listIndex = op.index!;
			break;
		case 'parameter':
			parameterKey = op.key!;
			break;
		case 'script':
			script = op.script!;
			break;
	}
	form.variable = variable;
	form.operation = operation;
	form['operand-type'] = operand.type;
	form['constant-value'] = constantValue;
	form['common-variable'] = commonVariable;
	form['list-index'] = listIndex;
	form['parameter-key'] = parameterKey;
	form.script = script;
	write(document.getElementById('setBoolean-variable'), form.variable);
	write(document.getElementById('setBoolean-operation'), form.operation);
	write(document.getElementById('setBoolean-operand-type'), form['operand-type']);
	write(document.getElementById('setBoolean-constant-value'), form['constant-value']);
	write(document.getElementById('setBoolean-common-variable'), form['common-variable']);
	write(document.getElementById('setBoolean-list-index'), form['list-index']);
	write(document.getElementById('setBoolean-parameter-key'), form['parameter-key']);
	write(document.getElementById('setBoolean-script'), form.script);
	getFocus(document.getElementById('setBoolean-variable'));
};

const save = (): unknown => {
	const variable = read(document.getElementById('setBoolean-variable')) ?? form.variable;
	if (VariableGetter.isNone!(variable as any)) {
		return getFocus(document.getElementById('setBoolean-variable'));
	}
	const operation = read(document.getElementById('setBoolean-operation')) ?? form.operation;
	const type = read(document.getElementById('setBoolean-operand-type')) ?? form['operand-type'];
	let operand;
	switch (type) {
		case 'constant': {
			const value =
				read(document.getElementById('setBoolean-constant-value')) ??
				form['constant-value'];
			operand = { type, value };
			break;
		}
		case 'variable': {
			const commonVariable =
				read(document.getElementById('setBoolean-common-variable')) ??
				form['common-variable'];
			if (VariableGetter.isNone!(commonVariable as any)) {
				return getFocus(document.getElementById('setBoolean-common-variable'));
			}
			operand = { type, variable: commonVariable };
			break;
		}
		case 'list': {
			const commonVariable =
				read(document.getElementById('setBoolean-common-variable')) ??
				form['common-variable'];
			if (VariableGetter.isNone!(commonVariable as any)) {
				return getFocus(document.getElementById('setBoolean-common-variable'));
			}
			const index =
				read(document.getElementById('setBoolean-list-index')) ?? form['list-index'];
			operand = { type, variable: commonVariable, index };
			break;
		}
		case 'parameter': {
			const key =
				read(document.getElementById('setBoolean-parameter-key')) ?? form['parameter-key'];
			if (key === '') {
				return getFocus(document.getElementById('setBoolean-parameter-key'));
			}
			operand = { type, key };
			break;
		}
		case 'script': {
			const script = (
				(read(document.getElementById('setBoolean-script')) ?? form.script) as string
			).trim();
			if (script === '') {
				return getFocus(document.getElementById('setBoolean-script'));
			}
			operand = { type, script };
			break;
		}
	}
	Command.save?.({ variable, operation, operand });
};

const schema = Command.cases.setBoolean;
schema.writeHandler = writeHandler;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useSetBooleanCommandSchema() {
	return { load, save, writeHandler };
}
