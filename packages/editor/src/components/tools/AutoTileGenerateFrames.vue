<template>
	<WindowFrame id="autoTile-generateFrames" @confirm="onConfirm" @closed="onWindowClosed">
		<template #title
			><TitleBar
				>{{ t('components.autoTile-generateFrames.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.autoTile-generateFrames-strideX.label') }}</div>
			<NumberBox
				:label="t('components.autoTile-generateFrames-strideX.label')"
				id="autoTile-generateFrames-strideX"
				v-tip="t('components.autoTile-generateFrames-strideX.tip')"
				v-focus
				min="-128"
				max="128"
				v-model="form.strideX"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-strideY.label') }}</div>
			<NumberBox
				:label="t('components.autoTile-generateFrames-strideY.label')"
				id="autoTile-generateFrames-strideY"
				v-tip="t('components.autoTile-generateFrames-strideY.tip')"
				min="-128"
				max="128"
				v-model="form.strideY"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-count.label') }}</div>
			<NumberBox
				:label="t('components.autoTile-generateFrames-count.label')"
				id="autoTile-generateFrames-count"
				v-tip="t('components.autoTile-generateFrames-count.tip')"
				min="1"
				max="255"
				v-model="form.count"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FrameGenerator } from '@app/palette/tile-frame-generator.ts';

const onConfirm = () => {
	FrameGenerator?.confirm?.(new Event('click'));
};

/** 关闭时通知单例：窗口自己就有 `closed`，不必让单例按 id 去注册表摸根元素。 */
const onWindowClosed = () => {
	FrameGenerator?.windowClosed?.(new Event('closed'));
};
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = FrameGenerator.form;
</script>

<style>
#autoTile-generateFrames {
	width: 324px;
	height: 146px;
}

#autoTile-generateFrames-confirm {
	right: 108px;
	bottom: 10px;
}

#autoTile-generateFrames-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
