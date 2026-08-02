<template>
			<page-frame id="scene" value="scene">
				<box id="scene-head">
					<box id="scene-head-start">
						<item id="scene-switch-grid" class="toolbar-item" value="grid" />
						<item id="scene-switch-light" class="toolbar-item" value="light" />
						<item id="scene-switch-animation" class="toolbar-item" value="animation" />
						<item
							id="scene-switch-settings"
							class="toolbar-item"
							value="settings"
							hotkey="Alt+S"
						/>
					</box>
					<box id="scene-head-center">
						<box id="scene-layer">
							<item
								id="scene-layer-object"
								class="toolbar-item"
								value="object"
								hotkey="`"
							/>
							<item
								id="scene-layer-tilemap-1"
								class="toolbar-item hidden"
								value="1"
								hotkey="1"
							/>
							<item
								id="scene-layer-tilemap-2"
								class="toolbar-item hidden"
								value="2"
								hotkey="2"
							/>
							<item
								id="scene-layer-tilemap-3"
								class="toolbar-item hidden"
								value="3"
								hotkey="3"
							/>
							<item
								id="scene-layer-tilemap-4"
								class="toolbar-item hidden"
								value="4"
								hotkey="4"
							/>
							<item
								id="scene-layer-tilemap-5"
								class="toolbar-item hidden"
								value="5"
								hotkey="5"
							/>
							<item
								id="scene-layer-tilemap-6"
								class="toolbar-item hidden"
								value="6"
								hotkey="6"
							/>
							<item
								id="scene-layer-terrain"
								class="toolbar-item"
								value="terrain"
								hotkey="`"
							/>
						</box>
						<box id="scene-brush">
							<item
								id="scene-brush-eraser"
								class="toolbar-item"
								value="eraser"
								hotkey="Q"
							/>
							<item
								id="scene-brush-pencil"
								class="toolbar-item"
								value="pencil"
								hotkey="E"
							/>
							<item
								id="scene-brush-rect"
								class="toolbar-item"
								value="rect"
								hotkey="R"
							/>
							<item
								id="scene-brush-oval"
								class="toolbar-item"
								value="oval"
								hotkey="T"
							/>
							<item
								id="scene-brush-fill"
								class="toolbar-item"
								value="fill"
								hotkey="Y"
							/>
						</box>
					</box>
					<box id="scene-head-end">
						<SliderBox
							id="scene-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</box>
				</box>
				<box id="scene-body">
					<box id="scene-screen" tabindex="-1">
						<MarqueeArea id="scene-marquee" />
					</box>
					<text id="scene-info" />
				</box>
			</page-frame>
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
