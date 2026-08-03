<template>
	<WindowFrame id="deleteElement">
		<TitleBar>Delete Element<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="deleteElement-operation" />
				<div class="text">Element</div><CustomBox id="deleteElement-element" type="element" />
			</div>
			<button id="deleteElement-confirm" name="confirm">Confirm</button>
			<button id="deleteElement-cancel" name="cancel">Cancel</button>
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
