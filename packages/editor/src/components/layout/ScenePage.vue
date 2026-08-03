<template>
			<div class="page-frame" id="scene" value="scene">
				<div class="box" id="scene-head">
					<div class="box" id="scene-head-start">
						<div class="item toolbar-item" id="scene-switch-grid" value="grid" />
						<div class="item toolbar-item" id="scene-switch-light" value="light" />
						<div class="item toolbar-item" id="scene-switch-animation" value="animation" />
						<div
							class="item toolbar-item"
							id="scene-switch-settings"
							value="settings"
							hotkey="Alt+S"
						/>
					</div>
					<div class="box" id="scene-head-center">
						<div class="box" id="scene-layer">
							<div
								class="item toolbar-item"
								id="scene-layer-object"
								value="object"
								hotkey="`"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-1"
								value="1"
								hotkey="1"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-2"
								value="2"
								hotkey="2"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-3"
								value="3"
								hotkey="3"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-4"
								value="4"
								hotkey="4"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-5"
								value="5"
								hotkey="5"
							/>
							<div
								class="item toolbar-item hidden"
								id="scene-layer-tilemap-6"
								value="6"
								hotkey="6"
							/>
							<div
								class="item toolbar-item"
								id="scene-layer-terrain"
								value="terrain"
								hotkey="`"
							/>
						</div>
						<div class="box" id="scene-brush">
							<div
								class="item toolbar-item"
								id="scene-brush-eraser"
								value="eraser"
								hotkey="Q"
							/>
							<div
								class="item toolbar-item"
								id="scene-brush-pencil"
								value="pencil"
								hotkey="E"
							/>
							<div
								class="item toolbar-item"
								id="scene-brush-rect"
								value="rect"
								hotkey="R"
							/>
							<div
								class="item toolbar-item"
								id="scene-brush-oval"
								value="oval"
								hotkey="T"
							/>
							<div
								class="item toolbar-item"
								id="scene-brush-fill"
								value="fill"
								hotkey="Y"
							/>
						</div>
					</div>
					<div class="box" id="scene-head-end">
						<SliderBox
							id="scene-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</div>
				</div>
				<div class="box" id="scene-body">
					<div class="box" id="scene-screen" tabindex="-1">
						<MarqueeArea id="scene-marquee" />
					</div>
					<div class="text" id="scene-info" />
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
