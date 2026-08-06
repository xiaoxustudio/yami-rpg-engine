<template>
	<WindowFrame id="command" show-apply>
		<template #title><TitleBar>Custom Command<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="command-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="command-list"
					padded
					@select="onListSelect"
					@popup="onListPopup"
					@open="onListOpen"
					@change="onListChange"
				/>
			</div>
			<div class="box" id="command-inspector">
				<DetailBox id="command-overview-detail" open>
					<DetailSummary>Overview</DetailSummary>
					<div class="box" id="command-overview" />
				</DetailBox>
				<DetailBox id="command-settings-detail" open>
					<DetailSummary>Settings</DetailSummary>
					<div class="detail-grid" id="command-settings-grid">
						<div class="text">Alias</div><TextBox id="command-alias" /> <div class="text">Keywords</div
					><TextBox id="command-keywords" />
					</div>
				</DetailBox>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onListSelect = (event: any) => {
	(window as any).CustomCommand?.listSelect?.(event);
};
const onListPopup = (event: any) => {
	(window as any).CustomCommand?.listPopup?.(event);
};
const onListOpen = (event: any) => {
	(window as any).CustomCommand?.listOpen?.(event);
};
const onListChange = (event: any) => {
	(window as any).CustomCommand?.listChange?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
