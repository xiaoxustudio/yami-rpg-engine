<template>
<WindowFrame id="useItem">
	<TitleBar>Use Item<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="useItem-actor" type="actor" />
			<text>Mode</text><SelectBox id="useItem-mode" /> <text>Shortcut Key</text
			><SelectBox id="useItem-key" /> <text>Item</text
			><CustomBox id="useItem-itemId" type="file" filter="item" />
			<text>Item</text><CustomBox id="useItem-item" type="item" />
			<text>Wait</text><SelectBox id="useItem-wait" name="wait" />
		</grid-box>
		<button id="useItem-confirm" name="confirm">Confirm</button>
		<button id="useItem-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
