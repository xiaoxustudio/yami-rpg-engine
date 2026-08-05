<template>
		<WindowFrame id="setProgressBar-property">
		<template #title><TitleBar>Image Property<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Property</div><SelectBox id="setProgressBar-property-key" />
				<div class="text">Image</div
				><CustomBox id="setProgressBar-property-image" type="file" filter="image" />
				<div class="text">Display</div><SelectBox id="setProgressBar-property-display" />
				<div class="text">Blend</div><SelectBox id="setProgressBar-property-blend" />
				<div class="text">Progress</div
				><NumberVar
					id="setProgressBar-property-progress"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Clip - X</div
				><NumberVar
					id="setProgressBar-property-clip-0"
					min="0"
					max="10000"
					unit="px"
				/>
				<div class="text">Clip - Y</div
				><NumberVar
					id="setProgressBar-property-clip-1"
					min="0"
					max="10000"
					unit="px"
				/>
				<div class="text">Clip - Width</div
				><NumberVar
					id="setProgressBar-property-clip-2"
					min="0"
					max="10000"
					unit="px"
				/>
				<div class="text">Clip - Height</div
				><NumberVar
					id="setProgressBar-property-clip-3"
					min="0"
					max="10000"
					unit="px"
				/>
				<div class="text">Color - Red</div
				><NumberVar id="setProgressBar-property-color-0" min="0" max="255" />
				<div class="text">Color - Green</div
				><NumberVar id="setProgressBar-property-color-1" min="0" max="255" />
				<div class="text">Color - Blue</div
				><NumberVar id="setProgressBar-property-color-2" min="0" max="255" />
				<div class="text">Color - Alpha</div
				><NumberVar id="setProgressBar-property-color-3" min="0" max="255" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
