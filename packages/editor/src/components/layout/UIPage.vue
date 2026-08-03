<template>
			<div class="page-frame" id="ui" value="ui">
				<div class="box" id="ui-head">
					<div class="box" id="ui-head-start">
						<div class="item toolbar-item" id="ui-switch-settings" value="settings" />
					</div>
					<div class="box" id="ui-head-center">
						<div class="item toolbar-item" id="ui-element-image" value="image" />
						<div class="item toolbar-item" id="ui-element-text" value="text" />
						<div class="item toolbar-item" id="ui-element-textbox" value="textbox" />
						<div class="item toolbar-item" id="ui-element-dialogbox" value="dialogbox" />
						<div
							class="item toolbar-item"
							id="ui-element-progressbar"
							value="progressbar"
						/>
						<div class="item toolbar-item" id="ui-element-button" value="button" />
						<div class="item toolbar-item" id="ui-element-animation" value="animation" />
						<div class="item toolbar-item" id="ui-element-video" value="video" />
						<div class="item toolbar-item" id="ui-element-window" value="window" />
						<div class="item toolbar-item" id="ui-element-container" value="container" />
						<div class="item toolbar-item" id="ui-element-reference" value="reference" />
					</div>
					<div class="box" id="ui-head-end">
						<SliderBox
							id="ui-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</div>
				</div>
				<div class="box" id="ui-body">
					<div class="box" id="ui-screen" tabindex="-1">
						<MarqueeArea id="ui-marquee" />
					</div>
				</div>
			</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
