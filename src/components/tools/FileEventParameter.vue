<template>
	<WindowFrame id="fileEvent-parameter">
		<TitleBar>Parameter<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="fileEvent-parameter-type" /> <div class="text">Key</div
				><TextBox id="fileEvent-parameter-key" /> <div class="text">Note</div
				><TextArea id="fileEvent-parameter-note" />
			</div>
			<button id="fileEvent-parameter-confirm" name="confirm">Confirm</button>
			<button id="fileEvent-parameter-cancel" name="cancel">Cancel</button>
		</div>
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
