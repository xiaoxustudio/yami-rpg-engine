<template>
	<WindowFrame id="setProgressBar">
		<TitleBar>Set Progress Bar<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><CustomBox id="setProgressBar-element" type="element" />
				<text>Properties</text><ParamList id="setProgressBar-properties" />
			</grid-box>
			<button id="setProgressBar-confirm" name="confirm">Confirm</button>
			<button id="setProgressBar-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
