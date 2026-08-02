<template>
	<WindowFrame id="fileEvent-parameter">
		<TitleBar>Parameter<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="fileEvent-parameter-type" /> <text>Key</text
				><TextBox id="fileEvent-parameter-key" /> <text>Note</text
				><TextArea id="fileEvent-parameter-note" />
			</grid-box>
			<button id="fileEvent-parameter-confirm" name="confirm">Confirm</button>
			<button id="fileEvent-parameter-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
