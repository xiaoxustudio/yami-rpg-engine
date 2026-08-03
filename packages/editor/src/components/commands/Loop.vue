<template>
<WindowFrame id="loop">
	<TitleBar>Loop<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Mode</div><SelectBox id="loop-mode" /> <div class="text">Conditions</div
			><ParamList id="loop-conditions" />
		</div>
		<button id="loop-confirm" name="confirm">Confirm</button>
		<button id="loop-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
