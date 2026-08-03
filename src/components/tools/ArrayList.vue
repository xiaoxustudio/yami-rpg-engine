<template>
	<WindowFrame id="arrayList" mode="center">
		<TitleBar>Array<div class="close" /></TitleBar>
		<div class="content-frame">
			<ParamList id="arrayList-list" />
			<button id="arrayList-confirm" name="confirm">Confirm</button>
			<button id="arrayList-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
