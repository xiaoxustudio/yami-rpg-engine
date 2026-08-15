<template>
	<WindowFrame ref="frame" id="arrayList-number">
		<template #title><TitleBar>Number<div class="close" /></TitleBar></template>
		
			<NumberBox
				id="arrayList-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				:model-value="form.value"
			/>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useArrayWindow, type ArrayNumberForm } from '@app/composables/useArrayWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const arrayWindow = useArrayWindow();
const form = arrayWindow.numberForm;

const setForm = (data: Partial<ArrayNumberForm>): void => {
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

const getForm = (): ArrayNumberForm => {
	const data = { ...form } as ArrayNumberForm;
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

const FIELD_BY_ID: Record<string, keyof ArrayNumberForm> = {
	'arrayList-number-value': 'value'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}


});
</script>
