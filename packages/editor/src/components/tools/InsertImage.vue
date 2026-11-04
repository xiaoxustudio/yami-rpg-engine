<template>
	<WindowFrame id="insertImage" @confirm="onConfirm" scrollable>
		<template #title
			><TitleBar
				>{{ t('components.insertImage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.insertImage-mode.label') }}</div>
			<SelectBox
				:label="t('components.insertImage-mode.label')"
				id="insertImage-mode"
				v-tip="t('components.insertImage-mode.tip')"
				:ref="controlRef('insertImage-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.insertImage-image.label') }}</div>
			<CustomBox
				id="insertImage-image"
				v-tip="t('components.insertImage-image.tip')"
				:ref="controlRef('insertImage-image')"
				type="file"
				filter="image"
				v-model="form.image"
			/>
			<div class="text">{{ t('components.insertImage-clip.label') }}</div>
			<CustomBox
				id="insertImage-clip"
				v-tip="t('components.insertImage-clip.tip')"
				:ref="controlRef('insertImage-clip')"
				type="clip"
				image="insertImage-image"
				v-model="form.clip"
			/>
			<div class="text">{{ t('components.insertImage-width.label') }}</div>
			<NumberBox
				:label="t('components.insertImage-width.label')"
				id="insertImage-width"
				v-tip="t('components.insertImage-width.tip')"
				:ref="controlRef('insertImage-width')"
				min="0"
				max="10000"
				v-model="form.width"
			/>
			<div class="text">{{ t('components.insertImage-height.label') }}</div>
			<NumberBox
				:label="t('components.insertImage-height.label')"
				id="insertImage-height"
				v-tip="t('components.insertImage-height.tip')"
				:ref="controlRef('insertImage-height')"
				min="0"
				max="10000"
				v-model="form.height"
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'insertImage-clip'
	| 'insertImage-height'
	| 'insertImage-image'
	| 'insertImage-mode'
	| 'insertImage-width';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = useTextCaptureWindow().image.form;

const onConfirm = () => {
	Selection?.image?.confirm?.(new Event('click'));
};

/** 模式候选与隐藏行关系是窗口自己的配置（原在 `Selection.image.initialize` 里按 id 取元素）。 */
onMounted(() => {
	const mode = controls['insertImage-mode'];
	mode?.loadItems?.([
		{ name: 'Image', value: 'image' },
		{ name: 'Image - Size', value: 'image-size' },
		{ name: 'Image - Clip', value: 'image-clip' },
		{ name: 'Image - Clip - Size', value: 'image-clip-size' }
	]);
	mode?.enableHiddenMode?.();
	mode?.relate?.([
		{ case: 'image', targets: [controlRoot(controls['insertImage-image'])] },
		{
			case: 'image-size',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-width']),
				controlRoot(controls['insertImage-height'])
			]
		},
		{
			case: 'image-clip',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-clip'])
			]
		},
		{
			case: 'image-clip-size',
			targets: [
				controlRoot(controls['insertImage-image']),
				controlRoot(controls['insertImage-clip']),
				controlRoot(controls['insertImage-width']),
				controlRoot(controls['insertImage-height'])
			]
		}
	]);
});
</script>

<style>
#insertImage {
	width: 324px;
	height: 194px;
}

#insertImage-confirm {
	right: 108px;
	bottom: 10px;
}

#insertImage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
