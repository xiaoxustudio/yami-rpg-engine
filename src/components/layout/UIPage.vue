<template>
			<page-frame id="ui" value="ui">
				<box id="ui-head">
					<box id="ui-head-start">
						<item id="ui-switch-settings" class="toolbar-item" value="settings" />
					</box>
					<box id="ui-head-center">
						<item id="ui-element-image" class="toolbar-item" value="image" />
						<item id="ui-element-text" class="toolbar-item" value="text" />
						<item id="ui-element-textbox" class="toolbar-item" value="textbox" />
						<item id="ui-element-dialogbox" class="toolbar-item" value="dialogbox" />
						<item
							id="ui-element-progressbar"
							class="toolbar-item"
							value="progressbar"
						/>
						<item id="ui-element-button" class="toolbar-item" value="button" />
						<item id="ui-element-animation" class="toolbar-item" value="animation" />
						<item id="ui-element-video" class="toolbar-item" value="video" />
						<item id="ui-element-window" class="toolbar-item" value="window" />
						<item id="ui-element-container" class="toolbar-item" value="container" />
						<item id="ui-element-reference" class="toolbar-item" value="reference" />
					</box>
					<box id="ui-head-end">
						<slider-box
							id="ui-zoom"
							name="zoom"
							min="0"
							max="4"
							hotkey="-/+"
							active-wheel
						/>
					</box>
				</box>
				<box id="ui-body">
					<box id="ui-screen" tabindex="-1">
						<marquee-area id="ui-marquee" />
					</box>
				</box>
			</page-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
