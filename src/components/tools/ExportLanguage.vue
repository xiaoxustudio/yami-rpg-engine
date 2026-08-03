<template>
	<WindowFrame id="exportLanguage">
		<TitleBar>Export Language Pack<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">First Lang</div><SelectBox id="exportLanguage-first" />
				<div class="text">Second Lang</div><SelectBox id="exportLanguage-second" />
			</div>
			<button id="exportLanguage-confirm" name="confirm">Confirm</button>
			<button id="exportLanguage-cancel" name="cancel">Cancel</button>
		</div>
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
