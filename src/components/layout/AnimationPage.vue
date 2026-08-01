<template>
			<page-frame id="animation" value="animation">
				<box id="animation-head">
					<box id="animation-head-start">
						<item id="animation-switch-mark" class="toolbar-item" value="mark" />
						<item
							id="animation-switch-onionskin"
							class="toolbar-item"
							value="onionskin"
							hotkey="O"
						/>
						<item
							id="animation-switch-mirror"
							class="toolbar-item"
							value="mirror"
							hotkey="M"
						/>
						<item
							id="animation-switch-settings"
							class="toolbar-item"
							value="settings"
						/>
					</box>
					<box id="animation-head-center">
						<number-box id="animation-speed" min="0" max="4" step="0.05" decimals="2"
							><text class="label">speed:</text></number-box
						>
					</box>
					<box id="animation-head-end">
						<slider-box
							id="animation-zoom"
							name="zoom-0-6"
							min="0"
							max="6"
							hotkey="-/+"
							active-wheel
						/>
					</box>
				</box>
				<box id="animation-body">
					<box id="animation-screen" tabindex="-1">
						<marquee-area id="animation-marquee" />
					</box>
					<box id="animation-dirList" />
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
