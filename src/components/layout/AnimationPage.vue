<template>
			<div class="page-frame" id="animation" value="animation">
				<div class="box" id="animation-head">
					<div class="box" id="animation-head-start">
						<div class="item toolbar-item" id="animation-switch-mark" value="mark" />
						<div
							class="item toolbar-item"
							id="animation-switch-onionskin"
							value="onionskin"
							hotkey="O"
						/>
						<div
							class="item toolbar-item"
							id="animation-switch-mirror"
							value="mirror"
							hotkey="M"
						/>
						<div
							class="item toolbar-item"
							id="animation-switch-settings"
							value="settings"
						/>
					</div>
					<div class="box" id="animation-head-center">
						<NumberBox id="animation-speed" min="0" max="4" step="0.05" decimals="2"
							><div class="text label">speed:</div></NumberBox
						>
					</div>
					<div class="box" id="animation-head-end">
						<SliderBox
							id="animation-zoom"
							name="zoom-0-6"
							min="0"
							max="6"
							hotkey="-/+"
							active-wheel
						/>
					</div>
				</div>
				<div class="box" id="animation-body">
					<div class="box" id="animation-screen" tabindex="-1">
						<MarqueeArea id="animation-marquee" />
					</div>
					<div class="box" id="animation-dirList" />
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
