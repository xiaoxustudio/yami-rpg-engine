<template>
	<window-frame id="tintImage">
		<title-bar>Tint Image<close /></title-bar>
		<content-frame>
			<grid-box id="tintImage-grid-box">
				<text>Element</text><custom-box id="tintImage-element" type="element" />
				<text>Mode</text><select-box id="tintImage-mode" /> <text>Tint - Red</text
				><number-box id="tintImage-tint-0" min="-255" max="255" step="5" />
				<text>Tint - Green</text
				><number-box id="tintImage-tint-1" min="-255" max="255" step="5" />
				<text>Tint - Blue</text
				><number-box id="tintImage-tint-2" min="-255" max="255" step="5" />
				<text>Tint - Grayscale</text
				><number-box id="tintImage-tint-3" min="0" max="255" step="5" />
				<text>Easing</text><select-box id="tintImage-easingId" name="easing" />
				<text>Duration</text
				><number-box
					id="tintImage-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<text>Wait</text><select-box id="tintImage-wait" name="wait" />
			</grid-box>
			<filter-box id="tintImage-filter" width="96" height="208" />
			<button id="tintImage-confirm" name="confirm">Confirm</button>
			<button id="tintImage-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
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
