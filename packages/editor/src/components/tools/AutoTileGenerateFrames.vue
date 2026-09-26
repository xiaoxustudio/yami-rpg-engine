<template>
	<WindowFrame
		id="autoTile-generateFrames"
		:ref="registryRef(paletteEls, 'autoTile-generateFrames')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.autoTile-generateFrames.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.autoTile-generateFrames-strideX.label') }}</div>
			<NumberBox
				id="autoTile-generateFrames-strideX"
				v-tip="t('components.autoTile-generateFrames-strideX.tip')"
				v-focus
				min="-128"
				max="128"
				v-model="form.strideX"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-strideY.label') }}</div>
			<NumberBox
				id="autoTile-generateFrames-strideY"
				v-tip="t('components.autoTile-generateFrames-strideY.tip')"
				min="-128"
				max="128"
				v-model="form.strideY"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-count.label') }}</div>
			<NumberBox
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
import { paletteEls } from '@app/palette/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { FrameGenerator } from '@app/palette/tile-frame-generator.ts';

// autoTile-generateFrames-confirm 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	FrameGenerator?.confirm?.(new Event('click'));
};
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = FrameGenerator.form;
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
