<template>
	<WindowFrame id="if-branch">
		<TitleBar>Branch<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Mode</text><SelectBox id="if-branch-mode" /> <text>Conditions</text
				><ParamList id="if-branch-conditions" />
			</grid-box>
			<button id="if-branch-confirm" name="confirm">Confirm</button>
			<button id="if-branch-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
