<template>
	<WindowFrame id="tintImage">
		<template #title><TitleBar>Tint Image<div class="close" /></TitleBar></template>
		
			<div class="grid-box" id="tintImage-grid-box">
				<div class="text">Element</div><CustomBox id="tintImage-element" type="element" />
				<div class="text">Mode</div><SelectBox id="tintImage-mode" /> <div class="text">Tint - Red</div
				><NumberBox id="tintImage-tint-0" min="-255" max="255" step="5" />
				<div class="text">Tint - Green</div
				><NumberBox id="tintImage-tint-1" min="-255" max="255" step="5" />
				<div class="text">Tint - Blue</div
				><NumberBox id="tintImage-tint-2" min="-255" max="255" step="5" />
				<div class="text">Tint - Grayscale</div
				><NumberBox id="tintImage-tint-3" min="0" max="255" step="5" />
				<div class="text">Easing</div><SelectBox id="tintImage-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberBox
					id="tintImage-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<div class="text">Wait</div><SelectBox id="tintImage-wait" name="wait" />
			</div>
			<FilterBox id="tintImage-filter" width="96" height="208" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
