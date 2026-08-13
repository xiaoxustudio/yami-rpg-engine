<template>
		<WindowFrame id="scriptCommand" @confirm="onConfirm">
		<template #title><TitleBar>Custom Command<div class="close"></div></TitleBar></template>
		
			<ParameterPane id="scriptCommand-parameter-pane">
				<DetailBox id="scriptCommand-parameter-detail" open>
					<div class="detail-grid" id="scriptCommand-parameter-grid" />
				</DetailBox>
			</ParameterPane>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.custom?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
