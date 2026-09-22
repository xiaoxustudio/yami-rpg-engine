<template>
	<WindowFrame ref="frame" id="autoTile-selectNode" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.autoTile-selectNode.title') }}
				<div class="close" /></TitleBar
		></template>

		<canvas
			id="autoTile-selectNode-canvas"
			:ref="registryRef(composableEls, 'autoTile-selectNode-canvas')"
			width="0"
			height="0"
		/>
		<div
			class="box"
			id="autoTile-selectNode-screen"
			:ref="registryRef(composableEls, 'autoTile-selectNode-screen')"
		>
			<MarqueeArea
				id="autoTile-selectNode-marquee"
				:ref="registryRef(composableEls, 'autoTile-selectNode-marquee')"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryRef, registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const { t } = useI18n();

const tileNode = useTileNodeWindow();

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	registerElement(composableEls, 'autoTile-selectNode', frame.value);
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => tileNode.windowClosed());
	}
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#autoTile-selectNode {
	width: auto;
	height: auto;
}

#autoTile-selectNode-canvas {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#autoTile-selectNode-screen {
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
