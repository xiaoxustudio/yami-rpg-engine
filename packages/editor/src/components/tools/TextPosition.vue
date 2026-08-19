<template>
	<!-- 设置文字位置 -->
	<WindowFrame ref="frame" id="textPosition" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.textPosition.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.textPosition-axis.label') }}</div><SelectBox id="textPosition-axis" :model-value="form.axis" /> <div class="text">{{ t('components.textPosition-operation.label') }}</div
				><SelectBox id="textPosition-operation" :model-value="form.operation" /> <div class="text">{{ t('components.textPosition-value.label') }}</div
				><NumberBox id="textPosition-value" min="-1000" max="1000" unit="px" :model-value="form.value" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TextPositionForm } from '@app/legacy/tools/text-capture.ts';
import { Selection } from '@app/legacy/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = reactive<TextPositionForm>({
	axis: 'x',
	operation: 'set',
	value: 0
});

const setForm = (data: Partial<TextPositionForm>): void => {
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

const getForm = (): TextPositionForm => {
	const data = { ...form } as TextPositionForm;
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

const FIELD_BY_ID: Record<string, keyof TextPositionForm> = {
	'textPosition-axis': 'axis',
	'textPosition-operation': 'operation',
	'textPosition-value': 'value'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.textPosition?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
