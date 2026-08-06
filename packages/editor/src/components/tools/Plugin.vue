<template>
		<WindowFrame id="plugin" show-apply>
		<template #title><TitleBar>Plugin<div class="close"></div></TitleBar></template>
		
			<div class="field-set input pad" id="plugin-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="plugin-list"
					padded
					@select="onListSelect"
					@popup="onListPopup"
					@open="onListOpen"
					@change="onListChange"
				/>
			</div>
			<div class="box" id="plugin-inspector">
				<DetailBox id="plugin-overview-detail" open>
					<DetailSummary>Overview</DetailSummary>
					<div class="box" id="plugin-overview" />
				</DetailBox>
				<ParameterPane id="plugin-parameter-pane">
				<DetailBox id="plugin-parameter-detail" open>
					<DetailSummary>Parameters</DetailSummary>
					<div class="detail-grid" id="plugin-parameter-grid" />
				</DetailBox>
			</ParameterPane>
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
import ParameterPane from '@app/components/common/ParameterPane.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();
const onListSelect = (event: any) => {
	(window as any).PluginManager?.listSelect?.(event);
};
const onListPopup = (event: any) => {
	(window as any).PluginManager?.listPopup?.(event);
};
const onListChange = (event: any) => {
	(window as any).PluginManager?.listChange?.(event);
};
const onListOpen = (event: any) => {
	(window as any).PluginManager?.listOpen?.(event);
};


onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
