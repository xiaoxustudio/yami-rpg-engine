<template>
	<WindowFrame id="autoTile-generateFrames">
		<template #title><TitleBar>{{ t('components.autoTile-generateFrames.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">{{ t('components.autoTile-generateFrames-strideX.label') }}</div
				><NumberBox id="autoTile-generateFrames-strideX" min="-128" max="128" />
				<div class="text">{{ t('components.autoTile-generateFrames-strideY.label') }}</div
				><NumberBox id="autoTile-generateFrames-strideY" min="-128" max="128" />
				<div class="text">{{ t('components.autoTile-generateFrames-count.label') }}</div
				><NumberBox id="autoTile-generateFrames-count" min="1" max="255" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
