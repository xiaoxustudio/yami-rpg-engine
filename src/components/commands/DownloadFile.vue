<template>
<WindowFrame id="downloadFile">
	<TitleBar>downloadFile<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>URL</text><StringVar id="downloadFile-url" /> <text>Header</text
			><ParamList id="downloadFile-header" /> <text>Method</text
			><SelectBox id="downloadFile-method" /> <text>Data</text
			><ParamList id="downloadFile-data" /> <text>CallBack</text
			><CustomBox id="downloadFile-callback" type="file" filter="event" />
			<text>RateCallBack</text
			><CustomBox id="downloadFile-rateCallback" type="file" filter="event" />
			<text>IsBackground</text
			><CheckBox class="standard" id="downloadFile-isBackground" />
			<text>Path</text><StringVar id="downloadFile-isBackground-path" />
		</div>
		<button id="downloadFile-confirm" name="confirm">Confirm</button>
		<button id="downloadFile-cancel" name="cancel">Cancel</button>
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
