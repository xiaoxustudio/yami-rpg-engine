<template>
<WindowFrame id="httpRequest">
	<TitleBar>httpRequest<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>URL</text><StringVar id="httpRequest-url" /> <text>Method</text
			><SelectBox id="httpRequest-method" /> <text>Header</text
			><ParamList id="httpRequest-header" /> <text>Data</text
			><ParamList id="httpRequest-data" /> <text>TimeOut</text
			><NumberBox id="httpRequest-timeout" /> <text>ResponseType</text
			><SelectBox id="httpRequest-responseType" /> <text>WithCredentials</text
			><CheckBox class="standard" id="httpRequest-withCredentials" />
			<text>AuthUser</text><StringVar id="httpRequest-authUser" />
			<text>AuthPass</text><StringVar id="httpRequest-authPass" />
			<text>CallBack</text
			><CustomBox id="httpRequest-callback" type="file" filter="event" />
		</grid-box>
		<button id="httpRequest-confirm" name="confirm">Confirm</button>
		<button id="httpRequest-cancel" name="cancel">Cancel</button>
	</content-frame>
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
import NumberBox from '@app/components/common/NumberBox.vue';
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
