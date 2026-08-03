<template>
			<div class="page-frame" id="animation-timeline" value="animation-timeline">
				<div class="box" id="animation-timeline-head">
					<div class="box" id="animation-timeline-toolbar">
						<div
							class="item toolbar-item"
							id="animation-timeline-previousKey"
							value="previousKey"
							hotkey="Z"
						/>
						<div
							class="item toolbar-item"
							id="animation-timeline-previous"
							value="previous"
							hotkey="Q"
						/>
						<div
							class="item toolbar-item"
							id="animation-timeline-play"
							value="play"
							hotkey="R"
						/>
						<div
							class="item toolbar-item"
							id="animation-timeline-next"
							value="next"
							hotkey="E"
						/>
						<div
							class="item toolbar-item"
							id="animation-timeline-nextKey"
							value="nextKey"
							hotkey="X"
						/>
						<div class="item toolbar-item" id="animation-timeline-loop" value="loop" />
					</div>
					<div class="box" id="animation-timeline-ruler-outer">
						<div class="box" id="animation-timeline-ruler-inner" />
					</div>
				</div>
				<TreeList id="animation-layer-list" />
				<div class="box" id="animation-timeline-list-outer" tabindex="0">
					<div class="box" id="animation-timeline-list-inner" />
					<div class="box" id="animation-timeline-cursor" />
					<div class="box" id="animation-timeline-marquee" />
					<div class="box" id="animation-timeline-marquee-shift" />
				</div>
				<div class="box" id="animation-timeline-pointer-area-outer">
					<div class="box" id="animation-timeline-pointer-area-inner">
						<div class="box" id="animation-timeline-pointer" />
					</div>
				</div>
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
