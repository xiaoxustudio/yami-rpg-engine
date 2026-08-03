<template>
<WindowFrame id="showChoices">
	<TitleBar>Show Choices<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Choices</text><ParamList id="showChoices-choices" />
			<text>Parameters</text><TextBox id="showChoices-parameters" />
		</div>
		<button id="showChoices-confirm" name="confirm">Confirm</button>
		<button id="showChoices-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
