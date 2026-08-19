<template>
	<WindowFrame ref="frame" id="ancestorGetter">
		<template #title><TitleBar>{{ t('components.ancestorGetter.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.ancestorGetter-type.label') }}</div><SelectBox id="ancestorGetter-type" /> <div class="text">{{ t('components.ancestorGetter-presetId.label') }}</div
				><CustomBox id="ancestorGetter-presetId" type="preset-element" />
				<div class="text">{{ t('components.ancestorGetter-variable.label') }}</div
				><CustomBox id="ancestorGetter-variable" type="variable" filter="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	useAncestorGetterWindow,
	type AncestorGetterForm
} from '@app/composables/useAncestorGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const ancestorGetter = useAncestorGetterWindow();
const form = ancestorGetter.form;

const setForm = (data: Partial<AncestorGetterForm>): void => {
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

const getForm = (): AncestorGetterForm => {
	const data = { ...form } as AncestorGetterForm;
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

const FIELD_BY_ID: Record<string, keyof AncestorGetterForm> = {
	'ancestorGetter-type': 'type',
	'ancestorGetter-presetId': 'presetId',
	'ancestorGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		el.on('closed', () => ancestorGetter.onWindowClosed());
	}


});
</script>
