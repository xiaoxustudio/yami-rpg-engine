<template>
		<WindowFrame ref="frame" id="setKey" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setKey.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box"> <div class="text">{{ t('components.setKey-key.label') }}</div
			><TextBox id="setKey-key" :model-value="form.key" /> </div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetKeyWindow, type SetKeyForm } from '@app/composables/useSetKeyWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const setKey = useSetKeyWindow();
const form = setKey.form;

const setForm = (data: Partial<SetKeyForm>): void => {
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

const getForm = (): SetKeyForm => {
	const data = { ...form } as SetKeyForm;
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

const FIELD_BY_ID: Record<string, keyof SetKeyForm> = {
	'setKey-key': 'key'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	setKey.confirm();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => setKey.onWindowClosed());
	}


});
</script>
