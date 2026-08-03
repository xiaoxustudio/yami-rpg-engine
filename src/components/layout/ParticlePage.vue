<template>
			<div class="page-frame" id="particle" value="particle">
				<div class="box" id="particle-head">
					<div class="box" id="particle-head-start">
						<div
							class="item toolbar-item"
							id="particle-view-wireframe"
							value="wireframe"
						/>
						<div class="item toolbar-item" id="particle-view-anchor" value="anchor" />
					</div>
					<div class="box" id="particle-head-center">
						<div class="box" id="particle-control">
							<div
								class="item toolbar-item"
								id="particle-control-restart"
								value="restart"
								hotkey="R"
							/>
							<div
								class="item toolbar-item"
								id="particle-control-pause"
								value="pause"
								hotkey="P"
							/>
						</div>
						<NumberBox id="particle-speed" min="0" max="4" step="0.05" decimals="2"
							><div class="text label">speed:</div></NumberBox
						>
					</div>
					<div class="box" id="particle-head-end">
						<SliderBox
							id="particle-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</div>
				</div>
				<div class="box" id="particle-body">
					<div class="box" id="particle-screen" tabindex="-1">
						<MarqueeArea id="particle-marquee" />
					</div>
					<div class="text" id="particle-info" />
				</div>
			</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
