<template>
	<WindowFrame ref="frame" id="lightGetter" @confirm="onConfirm">
		<template #title><TitleBar>Light<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="lightGetter-type" /> <div class="text">Light</div
				><CustomBox id="lightGetter-presetId" type="preset-object" filter="light" />
				<div class="text">Variable</div
				><CustomBox id="lightGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { LightGetter } from '@app/legacy/command/preset-accessor-factory.ts';
import { useLightGetterWindow, type PresetGetterForm } from '@app/composables/usePresetGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const lightGetter = useLightGetterWindow();
const form = lightGetter.form;

const setForm = (data: Partial<PresetGetterForm>): void => {
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

const getForm = (): PresetGetterForm => {
	const data = { ...form } as PresetGetterForm;
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

const FIELD_BY_ID: Record<string, keyof PresetGetterForm> = {
	'lightGetter-type': 'type',
	'lightGetter-presetId': 'presetId',
	'lightGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	LightGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => lightGetter.onWindowClosed());
	}
});
</script>
