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
				:label="t('components.scene-shift-x.label')"
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
				:label="t('components.scene-shift-y.label')"
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
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { getFormFields, setFormFields } from '@app/composables/form-fields';
import { sceneEls } from '@app/scene/element-registry';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { SceneShift, type SceneShiftForm } from '@app/scene/move-scene.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import {
	provideSceneShiftBridge,
	resetSceneShiftBridge
} from '@app/composables/scene-shift-bridge';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = reactive<SceneShiftForm>({ x: 0, y: 0 });

const setForm = (data: Partial<SceneShiftForm>): void =>
	setFormFields<SceneShiftForm>(form, data, FIELD_BY_ID);

const getForm = (): SceneShiftForm => getFormFields<SceneShiftForm>(form, FIELD_BY_ID);

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
	// 表单桥走模块而不是元素属性：元素契约收尾后 el 上不该再挂业务方法。
	const api = { setForm, getForm };
	provideSceneShiftBridge(api);
	onUnmounted(() => resetSceneShiftBridge(api));
});
</script>

<style>
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
