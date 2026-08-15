<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame id="tilemapGetter">
		<template #title><TitleBar>Tilemap<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="tilemapGetter-type" /> <div class="text">Tilemap</div
				><CustomBox
					id="tilemapGetter-presetId"
					type="preset-object"
					filter="tilemap"
				/>
				<div class="text">Variable</div
				><CustomBox id="tilemapGetter-variable" type="variable" filter="object" />
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
