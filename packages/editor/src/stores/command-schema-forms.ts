import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { pinia } from './pinia';
import type { ForEachForm } from '@app/composables/commands/useForEachCommandSchema';
import type { IfForm } from '@app/composables/commands/useIfCommandSchema';
import type { RegisterEventData } from '@app/composables/commands/useRegisterEventCommandSchema';
import type { ShowChoicesForm } from '@app/composables/commands/useShowChoicesCommandSchema';
import type { SwitchForm } from '@app/composables/commands/useSwitchCommandSchema';

export const useCommandSchemaFormsStore = defineStore('commandSchemaForms', () => {
	const forEachForm = reactive<ForEachForm>({
		data: 'list',
		list: { type: 'local', key: '' },
		actor: { type: 'trigger' },
		element: { type: 'trigger' },
		attributeGroupId: '',
		enumGroupId: '',
		variable: { type: 'local', key: '' },
		saveIndex: { type: 'local', key: '' },
		touchId: { type: 'local', key: '' }
	});

	const ifForm = reactive<IfForm>({
		else: false
	});

	const registerEventData = reactive<RegisterEventData>({
		target: 'global',
		actor: { type: 'trigger' },
		element: { type: 'trigger' },
		operation: 'register',
		type: 'autorun',
		priority: false,
		tag: '',
		namespace: false
	});

	const showChoicesForm = reactive<ShowChoicesForm>({
		parameters: ''
	});

	const switchForm = reactive<SwitchForm>({
		variable: { type: 'local', key: '' },
		default: false
	});

	const castSkillForm = reactive<Record<string, unknown>>({});
	const changeActorEquipmentForm = reactive<Record<string, unknown>>({});
	const getActorForm = reactive<Record<string, unknown>>({});
	const getTargetForm = reactive<Record<string, unknown>>({});
	const setBooleanForm = reactive<Record<string, unknown>>({});
	const setInventoryForm = reactive<Record<string, unknown>>({});
	const transitionForm = reactive<Record<string, unknown>>({});

	return {
		forEachForm,
		ifForm,
		registerEventData,
		showChoicesForm,
		switchForm,
		castSkillForm,
		changeActorEquipmentForm,
		getActorForm,
		getTargetForm,
		setBooleanForm,
		setInventoryForm,
		transitionForm
	};
});

export function getCommandSchemaFormsStore() {
	return useCommandSchemaFormsStore(pinia);
}
