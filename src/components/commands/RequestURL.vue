<template>
<WindowFrame id="requestURL">
	<TitleBar>requestURL<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>URL</text><StringVar id="requestURL-url" /> <text>Header</text
			><ParamList id="requestURL-header" /> <text>Method</text
			><SelectBox id="requestURL-method" /> <text>Data</text
			><ParamList id="requestURL-data" /> <text>CallBack</text
			><CustomBox id="requestURL-callback" type="file" filter="event" />
		</div>
		<button id="requestURL-confirm" name="confirm">Confirm</button>
		<button id="requestURL-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
