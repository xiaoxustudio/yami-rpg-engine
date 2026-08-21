<template>
	<!-- 设置文字效果 -->
	<WindowFrame ref="frame" id="textEffect" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.textEffect.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.textEffect-type.label') }}</div><SelectBox id="textEffect-type" :model-value="form.type" /> <div class="text">{{ t('components.textEffect-shadowOffsetX.label') }}</div
				><NumberBox id="textEffect-shadowOffsetX" min="-9" max="9" unit="px" :model-value="form.shadowOffsetX" />
				<div class="text">{{ t('components.textEffect-shadowOffsetY.label') }}</div
				><NumberBox id="textEffect-shadowOffsetY" min="-9" max="9" unit="px" :model-value="form.shadowOffsetY" />
				<div class="text">{{ t('components.textEffect-strokeWidth.label') }}</div
				><NumberBox id="textEffect-strokeWidth" min="1" max="20" unit="px" :model-value="form.strokeWidth" />
				<div class="text">{{ t('components.textEffect-color.label') }}</div><ColorBox id="textEffect-color" :model-value="form.color" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TextEffectForm } from '@app/tools/text-capture.ts';
import { Selection } from '@app/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = reactive<TextEffectForm>({
	type: 'shadow',
	shadowOffsetX: 1,
	shadowOffsetY: 1,
	strokeWidth: 1,
	color: '000000ff'
});

const setForm = (data: Partial<TextEffectForm>): void => {
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

const getForm = (): TextEffectForm => {
	const data = { ...form } as TextEffectForm;
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

const FIELD_BY_ID: Record<string, keyof TextEffectForm> = {
	'textEffect-type': 'type',
	'textEffect-shadowOffsetX': 'shadowOffsetX',
	'textEffect-shadowOffsetY': 'shadowOffsetY',
	'textEffect-strokeWidth': 'strokeWidth',
	'textEffect-color': 'color'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.textEffect?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
