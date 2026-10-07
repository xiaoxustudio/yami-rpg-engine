import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';

export type RequestKeyValueForm = {
	key: string | { key: string };
	value: string | { key: string };
};

export type SwitchConditionType =
	| 'none'
	| 'boolean'
	| 'number'
	| 'string'
	| 'attribute'
	| 'enum'
	| 'keyboard'
	| 'gamepad'
	| 'mouse'
	| 'variable';

export interface SwitchConditionForm {
	type: SwitchConditionType;
	booleanValue: boolean;
	numberValue: number;
	stringValue: string;
	attributeId: string;
	stringId: string;
	mouseButton: number;
	variable: { type: string; key: string };
}

export interface SetObjectPropertyForm {
	variable: { type: string; key: string };
	valueVariable: { type: string; key: string };
	list?: Array<{ text: string }>;
}

export const useCommandFormsStore = defineStore('commandForms', () => {
	const indexForm = reactive<{ name: string }>({ name: '' });

	const requestKeyValueForm = reactive<RequestKeyValueForm>({ key: '', value: '' });

	const switchConditionForm = reactive<SwitchConditionForm>({
		type: 'number',
		booleanValue: false,
		numberValue: 0,
		stringValue: '',
		attributeId: '',
		stringId: '',
		mouseButton: 0,
		variable: { type: 'local', key: '' }
	});

	const objectPropertyForm = reactive<SetObjectPropertyForm>({
		variable: { type: 'local', key: '' },
		valueVariable: { type: 'local', key: '' }
	});

	return { indexForm, requestKeyValueForm, switchConditionForm, objectPropertyForm };
});

export function getCommandFormsStore() {
	return useCommandFormsStore(pinia);
}
