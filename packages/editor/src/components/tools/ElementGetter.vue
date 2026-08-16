<template>
	<WindowFrame ref="frame" id="elementGetter" @confirm="onConfirm">
		<template #title><TitleBar>Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="elementGetter-type" /> <div class="text">Ancestor</div
				><CustomBox id="elementGetter-ancestor" type="ancestor-element" />
				<div class="text">Data ID</div
				><CustomBox id="elementGetter-presetId" type="preset-element" />
				<div class="text">Index</div><NumberVar id="elementGetter-index" min="0" max="10000" />
				<div class="text">Variable</div
				><CustomBox id="elementGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElementGetter } from '@/command/element-accessor-window.ts';
import {
	useElementGetterWindow,
	type ElementGetterForm
} from '@app/composables/useElementGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const elementGetter = useElementGetterWindow();
const form = elementGetter.form;

const setForm = (data: Partial<ElementGetterForm>): void => {
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

const getForm = (): ElementGetterForm => {
	const data = { ...form } as ElementGetterForm;
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

const FIELD_BY_ID: Record<string, keyof ElementGetterForm> = {
	'elementGetter-type': 'type',
	'elementGetter-ancestor': 'ancestor',
	'elementGetter-presetId': 'presetId',
	'elementGetter-index': 'index',
	'elementGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	ElementGetter?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => elementGetter.onWindowClosed());
	}


});
</script>
