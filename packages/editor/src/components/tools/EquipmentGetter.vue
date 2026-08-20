<template>
	<WindowFrame ref="frame" id="equipmentGetter" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.equipmentGetter.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.equipmentGetter-type.label') }}</div><SelectBox id="equipmentGetter-type" /> <div class="text">{{ t('components.equipmentGetter-actor.label') }}</div
				><CustomBox id="equipmentGetter-actor" type="actor" /> <div class="text">{{ t('components.equipmentGetter-slot.label') }}</div
				><SelectVar id="equipmentGetter-slot" /> <div class="text">{{ t('components.equipmentGetter-equipmentId.label') }}</div
				><CustomBox
					id="equipmentGetter-equipmentId"
					type="file"
					filter="equipment"
				/>
				<div class="text">{{ t('components.equipmentGetter-variable.label') }}</div
				><CustomBox id="equipmentGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import {
	useEquipmentGetterWindow,
	type EquipmentGetterForm
} from '@app/composables/useEquipmentGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const equipmentGetter = useEquipmentGetterWindow();
const form = equipmentGetter.form;

const setForm = (data: Partial<EquipmentGetterForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): EquipmentGetterForm => {
	const data = { ...form } as EquipmentGetterForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof EquipmentGetterForm> = {
	'equipmentGetter-type': 'type',
	'equipmentGetter-actor': 'actor',
	'equipmentGetter-slot': 'slot',
	'equipmentGetter-equipmentId': 'equipmentId',
	'equipmentGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	EquipmentGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => equipmentGetter.onWindowClosed());
	}


});
</script>
