<template>
			<div class="page-frame" id="animation-timeline" value="animation-timeline">
				<box id="animation-timeline-head">
					<box id="animation-timeline-toolbar">
						<item
							id="animation-timeline-previousKey"
							class="toolbar-item"
							value="previousKey"
							hotkey="Z"
						/>
						<item
							id="animation-timeline-previous"
							class="toolbar-item"
							value="previous"
							hotkey="Q"
						/>
						<item
							id="animation-timeline-play"
							class="toolbar-item"
							value="play"
							hotkey="R"
						/>
						<item
							id="animation-timeline-next"
							class="toolbar-item"
							value="next"
							hotkey="E"
						/>
						<item
							id="animation-timeline-nextKey"
							class="toolbar-item"
							value="nextKey"
							hotkey="X"
						/>
						<item id="animation-timeline-loop" class="toolbar-item" value="loop" />
					</box>
					<box id="animation-timeline-ruler-outer">
						<box id="animation-timeline-ruler-inner" />
					</box>
				</box>
				<TreeList id="animation-layer-list" />
				<box id="animation-timeline-list-outer" tabindex="0">
					<box id="animation-timeline-list-inner" />
					<box id="animation-timeline-cursor" />
					<box id="animation-timeline-marquee" />
					<box id="animation-timeline-marquee-shift" />
				</box>
				<box id="animation-timeline-pointer-area-outer">
					<box id="animation-timeline-pointer-area-inner">
						<box id="animation-timeline-pointer" />
					</box>
				</box>
			</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
