<template>
	<WindowFrame id="command" show-apply @apply="onApply">
		<template #title><TitleBar>Custom Command<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="command-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="command-list"
					padded
					:node-extras="nodeExtras"
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
import { h, onMounted, type VNode } from 'vue';
import { CustomCommand } from '@/command/custom-command-window.ts';
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

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { enabled?: boolean };
	const element = container.parentNode as HTMLElement | null;
	element?.classList.add('plugin-item');
	if (node.enabled) {
		element?.classList.remove('weak');
	} else {
		element?.classList.add('weak');
	}
	return [];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	CustomCommand?.listSelect?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	CustomCommand?.listPopup?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	CustomCommand?.listOpen?.(event);
};
const onListChange = (event: Event & { value?: unknown }) => {
	CustomCommand?.listChange?.(event);
};

const onApply = () => {
	CustomCommand?.apply?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
