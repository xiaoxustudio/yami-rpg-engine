<template>
<WindowFrame id="downloadFile">
	<template #title><TitleBar>downloadFile<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">URL</div><StringVar id="downloadFile-url" /> <div class="text">Header</div
			><ParamList id="downloadFile-header" /> <div class="text">Method</div
			><SelectBox id="downloadFile-method" /> <div class="text">Data</div
			><ParamList id="downloadFile-data" /> <div class="text">CallBack</div
			><CustomBox id="downloadFile-callback" type="file" filter="event" />
			<div class="text">RateCallBack</div
			><CustomBox id="downloadFile-rateCallback" type="file" filter="event" />
			<div class="text">IsBackground</div
			><CheckBox class="standard" id="downloadFile-isBackground" />
			<div class="text">Path</div><StringVar id="downloadFile-isBackground-path" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
