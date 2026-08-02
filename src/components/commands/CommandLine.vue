<template>
	<WindowFrame id="commandLine">
		<TitleBar>Command Line<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="commandLine-type" /> <text>Key</text
				><StringVar id="commandLine-key" /> <text>Value</text
				><StringVar id="commandLine-value" /> <text>Variable</text
				><CustomBox id="commandLine-variable" type="variable" filter="object" />
			</grid-box>
			<button id="commandLine-confirm" name="confirm">Confirm</button>
			<button id="commandLine-cancel" name="cancel">Cancel</button>
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
