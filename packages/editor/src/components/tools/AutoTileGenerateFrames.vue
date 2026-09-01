<template>
	<WindowFrame id="autoTile-generateFrames">
		<template #title
			><TitleBar
				>{{ t('components.autoTile-generateFrames.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.autoTile-generateFrames-strideX.label') }}</div>
			<NumberBox
				id="autoTile-generateFrames-strideX"
				v-focus
				min="-128"
				max="128"
				v-model="form.strideX"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-strideY.label') }}</div>
			<NumberBox
				id="autoTile-generateFrames-strideY"
				min="-128"
				max="128"
				v-model="form.strideY"
			/>
			<div class="text">{{ t('components.autoTile-generateFrames-count.label') }}</div>
			<NumberBox id="autoTile-generateFrames-count" min="1" max="255" v-model="form.count" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { FrameGenerator } from '@app/palette/tile-frame-generator.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const form = FrameGenerator.form;
</script>
