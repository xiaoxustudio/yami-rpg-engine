<template>
	<WindowFrame id="uploadFile">
		<TitleBar>uploadFile<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>URL</text><StringVar id="uploadFile-url" /> <text>LocalPath</text
				><StringVar id="uploadFile-path" /> <text>Method</text
				><SelectBox id="uploadFile-method" /> <text>Field</text
				><StringVar id="uploadFile-field" /> <text>Header</text
				><ParamList id="uploadFile-header" /> <text>CallBack</text
				><CustomBox id="uploadFile-callback" type="file" filter="event" />
				<text>RateCallBack</text
				><CustomBox id="uploadFile-rateCallback" type="file" filter="event" />
			</grid-box>
			<button id="uploadFile-confirm" name="confirm">Confirm</button>
			<button id="uploadFile-cancel" name="cancel">Cancel</button>
		</content-frame>
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
