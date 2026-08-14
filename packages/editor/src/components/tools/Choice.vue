<template>
	<WindowFrame ref="frame" id="choice">
		<template #title><TitleBar>Choice<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Content</div
				><TextBox
					id="choice-content"
					v-model="form.content"
					menu="tag-local-var tag-global-var tag-localization"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { ChoicesForm } from '@/command/show-options-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const form = reactive<ChoicesForm>({ content: '' });

const setForm = (data: Partial<ChoicesForm>): void => {
	Object.assign(form, data);
	if ('content' in data) {
		const control = document.getElementById('choice-content') as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data.content as never);
		}
	}
};

const getForm = (): ChoicesForm => {
	const data = { ...form } as ChoicesForm;
	const control = document.getElementById('choice-content') as
		| (HTMLElement & { read?: () => unknown })
		| null;
	if (control && typeof control.read === 'function') {
		data.content = control.read() as string;
	}
	return data;
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
	inspector.syncState();
	local.syncState();
});
</script>
