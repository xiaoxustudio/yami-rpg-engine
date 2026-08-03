<template>
	<WindowFrame id="controlDialog">
		<TitleBar>Control Dialog<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Element</text><CustomBox id="controlDialog-element" type="element" />
				<text>Operation</text><SelectBox id="controlDialog-operation" />
			</div>
			<button id="controlDialog-confirm" name="confirm">Confirm</button>
			<button id="controlDialog-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
