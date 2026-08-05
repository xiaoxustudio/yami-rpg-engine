<template>
	<WindowFrame id="insertImage">
		<template #title><TitleBar>Insert Image<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="insertImage-mode" /> <div class="text">Image</div
				><CustomBox id="insertImage-image" type="file" filter="image" />
				<div class="text">Clip</div
				><CustomBox id="insertImage-clip" type="clip" image="insertImage-image" />
				<div class="text">Width</div><NumberBox id="insertImage-width" min="0" max="10000" />
				<div class="text">Height</div><NumberBox id="insertImage-height" min="0" max="10000" />
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
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
