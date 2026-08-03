<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame id="tilemapGetter">
		<TitleBar>Tilemap<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Type</text><SelectBox id="tilemapGetter-type" /> <text>Tilemap</text
				><CustomBox
					id="tilemapGetter-presetId"
					type="preset-object"
					filter="tilemap"
				/>
				<text>Variable</text
				><CustomBox id="tilemapGetter-variable" type="variable" filter="object" />
			</div>
			<button id="tilemapGetter-confirm" name="confirm">Confirm</button>
			<button id="tilemapGetter-cancel" name="cancel">Cancel</button>
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
	inspector.syncState();
	local.syncState();
});
</script>
