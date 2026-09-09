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

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#autoTile-frameIndex {
	width: auto;
	height: auto;
}

#autoTile-frameIndex-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: auto;
}

#autoTile-frameIndex-image-clip {
	position: absolute;
	overflow: hidden;
}

#autoTile-frameIndex-image {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#autoTile-frameIndex-mask {
	position: absolute;
	width: 100%;
	height: 100%;
	border-left: 0 solid rgba(0, 0, 0, 0.5);
	border-top: 0 solid rgba(0, 0, 0, 0.5);
}

#autoTile-frameIndex-info {
	position: absolute;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}
</style>

