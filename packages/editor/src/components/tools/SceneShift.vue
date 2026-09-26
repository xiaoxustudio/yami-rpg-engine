<template>
	<WindowFrame ref="frame" id="scene-shift" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.scene-shift.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.scene-shift-x.label') }}</div>
			<NumberBox
				id="scene-shift-x"
				:ref="registryRef(composableEls, 'scene-shift-x')"
				v-tip="t('components.scene-shift-x.tip')"
				v-focus
				min="-512"
				max="512"
				:model-value="form.x"
			/>
			<div class="text">{{ t('components.scene-shift-y.label') }}</div>
			<NumberBox
				id="scene-shift-y"
				:ref="registryRef(composableEls, 'scene-shift-y')"
				v-tip="t('components.scene-shift-y.tip')"
				min="-512"
				max="512"
				:model-value="form.y"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { sceneEls } from '@app/scene/element-registry';
import { registryElement, registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { SceneShift, type SceneShiftForm } from '@app/scene/move-scene.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = reactive<SceneShiftForm>({ x: 0, y: 0 });

const setForm = (data: Partial<SceneShiftForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = registryElement<HTMLElement & { write?: (value: unknown) => void }>(
			composableEls,
			id
		);
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): SceneShiftForm => {
	const data = { ...form } as SceneShiftForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = registryElement<HTMLElement & { read?: () => unknown }>(composableEls, id);
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof SceneShiftForm> = {
	'scene-shift-x': 'x',
	'scene-shift-y': 'y'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	SceneShift?.confirm?.(new Event('click'));
};

onMounted(() => {
	registerElement(sceneEls, 'scene-shift', frame.value);
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#scene-shift {
	width: 324px;
	height: 122px;
}

#scene-shift-confirm {
	right: 108px;
	bottom: 10px;
}

#scene-shift-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
