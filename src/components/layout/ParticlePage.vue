<template>
			<div class="page-frame" id="particle" value="particle">
				<box id="particle-head">
					<box id="particle-head-start">
						<item
							id="particle-view-wireframe"
							class="toolbar-item"
							value="wireframe"
						/>
						<item id="particle-view-anchor" class="toolbar-item" value="anchor" />
					</box>
					<box id="particle-head-center">
						<box id="particle-control">
							<item
								id="particle-control-restart"
								class="toolbar-item"
								value="restart"
								hotkey="R"
							/>
							<item
								id="particle-control-pause"
								class="toolbar-item"
								value="pause"
								hotkey="P"
							/>
						</box>
						<NumberBox id="particle-speed" min="0" max="4" step="0.05" decimals="2"
							><text class="label">speed:</text></NumberBox
						>
					</box>
					<box id="particle-head-end">
						<SliderBox
							id="particle-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</box>
				</box>
				<box id="particle-body">
					<box id="particle-screen" tabindex="-1">
						<MarqueeArea id="particle-marquee" />
					</box>
					<text id="particle-info" />
				</box>
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
