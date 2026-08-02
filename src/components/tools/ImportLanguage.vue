<template>
	<WindowFrame id="importLanguage">
		<TitleBar>Import Language Pack<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Import to</text><SelectBox id="importLanguage-language" />
			</grid-box>
			<button id="importLanguage-confirm" name="confirm">Confirm</button>
			<button id="importLanguage-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
