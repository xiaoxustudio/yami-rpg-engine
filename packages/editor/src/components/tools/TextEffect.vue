<template>
	<WindowFrame id="textEffect" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.textEffect.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.textEffect-type.label') }}</div>
			<SelectBox
				:label="t('components.textEffect-type.label')"
				id="textEffect-type"
				v-tip="t('components.textEffect-type.tip')"
				:ref="controlRef('textEffect-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.textEffect-shadowOffsetX.label') }}</div>
			<NumberBox
				:label="t('components.textEffect-shadowOffsetX.label')"
				id="textEffect-shadowOffsetX"
				v-tip="t('components.textEffect-shadowOffsetX.tip')"
				:ref="controlRef('textEffect-shadowOffsetX')"
				min="-9"
				max="9"
				unit="px"
				v-model="form.shadowOffsetX"
			/>
			<div class="text">{{ t('components.textEffect-shadowOffsetY.label') }}</div>
			<NumberBox
				:label="t('components.textEffect-shadowOffsetY.label')"
				id="textEffect-shadowOffsetY"
				v-tip="t('components.textEffect-shadowOffsetY.tip')"
				:ref="controlRef('textEffect-shadowOffsetY')"
				min="-9"
				max="9"
				unit="px"
				v-model="form.shadowOffsetY"
			/>
			<div class="text">{{ t('components.textEffect-strokeWidth.label') }}</div>
			<NumberBox
				:label="t('components.textEffect-strokeWidth.label')"
				id="textEffect-strokeWidth"
				v-tip="t('components.textEffect-strokeWidth.tip')"
				:ref="controlRef('textEffect-strokeWidth')"
				min="1"
				max="20"
				unit="px"
				v-model="form.strokeWidth"
			/>
			<div class="text">{{ t('components.textEffect-color.label') }}</div>
			<ColorBox
				:label="t('components.textEffect-color.label')"
				id="textEffect-color"
				v-tip="t('components.textEffect-color.tip')"
				:ref="controlRef('textEffect-color')"
				v-model="form.color"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'textEffect-color'
	| 'textEffect-shadowOffsetX'
	| 'textEffect-shadowOffsetY'
	| 'textEffect-strokeWidth'
	| 'textEffect-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = useTextCaptureWindow().textEffect.form;

const onConfirm = () => {
	Selection?.textEffect?.confirm?.(new Event('click'));
};

/** 候选与隐藏行关系是窗口自己的配置（原在 `Selection.textEffect.initialize` 里按 id 取元素）。 */
onMounted(() => {
	const type = controls['textEffect-type'];
	type?.loadItems?.([
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	type?.enableHiddenMode?.();
	type?.relate?.([
		{
			case: 'shadow',
			targets: [
				controlRoot(controls['textEffect-shadowOffsetX']),
				controlRoot(controls['textEffect-shadowOffsetY']),
				controlRoot(controls['textEffect-color'])
			]
		},
		{
			case: 'stroke',
			targets: [
				controlRoot(controls['textEffect-strokeWidth']),
				controlRoot(controls['textEffect-color'])
			]
		},
		{ case: 'outline', targets: [controlRoot(controls['textEffect-color'])] }
	]);
});
</script>

<style>
#textEffect {
	width: 324px;
	height: 170px;
}

#textEffect-confirm {
	right: 108px;
	bottom: 10px;
}

#textEffect-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
