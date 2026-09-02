<template>
	<WindowFrame id="autoTile-frameIndex" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.autoTile-frameIndex.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="box" id="autoTile-frameIndex-screen">
			<div class="box" id="autoTile-frameIndex-image-clip">
				<img id="autoTile-frameIndex-image" />
				<div class="box" id="autoTile-frameIndex-mask" />
			</div>
			<MarqueeArea id="autoTile-frameIndex-marquee" />
			<div class="text" id="autoTile-frameIndex-info" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const { t } = useI18n();

onMounted(() => {});
</script>
