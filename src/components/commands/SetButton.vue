<template>
	<WindowFrame id="setButton">
		<TitleBar>Set Button<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Element</text><CustomBox id="setButton-element" type="element" />
				<text>Properties</text><ParamList id="setButton-properties" />
			</div>
			<button id="setButton-confirm" name="confirm">Confirm</button>
			<button id="setButton-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
