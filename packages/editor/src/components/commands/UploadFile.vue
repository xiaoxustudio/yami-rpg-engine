<template>
	<WindowFrame id="uploadFile">
		<template #title><TitleBar>uploadFile<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">URL</div><StringVar id="uploadFile-url" /> <div class="text">LocalPath</div
				><StringVar id="uploadFile-path" /> <div class="text">Method</div
				><SelectBox id="uploadFile-method" /> <div class="text">Field</div
				><StringVar id="uploadFile-field" /> <div class="text">Header</div
				><ParamList id="uploadFile-header" /> <div class="text">CallBack</div
				><CustomBox id="uploadFile-callback" type="file" filter="event" />
				<div class="text">RateCallBack</div
				><CustomBox id="uploadFile-rateCallback" type="file" filter="event" />
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
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
