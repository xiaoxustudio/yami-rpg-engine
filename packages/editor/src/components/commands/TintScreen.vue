<template>
	<WindowFrame id="tintScreen">
		<template #title><TitleBar>Tint Screen<div class="close" /></TitleBar></template>
		
			<div class="grid-box" id="tintScreen-grid-box">
				<div class="text">Tint - Red</div
				><NumberBox id="tintScreen-tint-0" min="-255" max="255" step="5" />
				<div class="text">Tint - Green</div
				><NumberBox id="tintScreen-tint-1" min="-255" max="255" step="5" />
				<div class="text">Tint - Blue</div
				><NumberBox id="tintScreen-tint-2" min="-255" max="255" step="5" />
				<div class="text">Tint - Grayscale</div
				><NumberBox id="tintScreen-tint-3" min="0" max="255" step="5" />
				<div class="text">Easing</div><SelectBox id="tintScreen-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberBox
					id="tintScreen-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="tintScreen-wait" name="wait" />
			</div>
			<FilterBox id="tintScreen-filter" width="96" height="160" />
		
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
