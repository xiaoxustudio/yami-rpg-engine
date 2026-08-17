<template>
	<WindowFrame ref="frame" id="fontSize" @confirm="onConfirm">
		<template #title><TitleBar>Set Font Size<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Size</div
				><NumberBox id="fontSize-size" min="10" max="400" unit="px" :model-value="form.size" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { FontSizeForm } from '@app/legacy/tools/text-capture.ts';
import { Selection } from '@app/legacy/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const form = reactive<FontSizeForm>({
	size: 12
});

const setForm = (data: Partial<FontSizeForm>): void => {
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

const getForm = (): FontSizeForm => {
	const data = { ...form } as FontSizeForm;
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

const FIELD_BY_ID: Record<string, keyof FontSizeForm> = {
	'fontSize-size': 'size'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.fontSize?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
