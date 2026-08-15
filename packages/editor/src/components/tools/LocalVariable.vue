<template>
	<WindowFrame ref="frame" id="localVariable" @confirm="onConfirm">
		<template #title><TitleBar>Set Local Variable<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Local Variable</div><TextBox id="localVariable-key" :model-value="form.key" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { LocalVariableForm } from '@/tools/text-capture.ts';
import { Selection } from '@/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const form = reactive<LocalVariableForm>({
	key: ''
});

const setForm = (data: Partial<LocalVariableForm>): void => {
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

const getForm = (): LocalVariableForm => {
	const data = { ...form } as LocalVariableForm;
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

const FIELD_BY_ID: Record<string, keyof LocalVariableForm> = {
	'localVariable-key': 'key'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.localVariable?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
