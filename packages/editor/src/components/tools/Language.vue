<template>
	<WindowFrame id="language">
		<template #title><TitleBar>Language<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Name</div><SelectBox id="language-name" /> <div class="text">Font</div
				><CustomBox id="language-font" type="file" filter="font" />
				<div class="text">Font Size Scaling</div
				><NumberBox id="language-scale" min="0.5" max="2" decimals="10" />
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
