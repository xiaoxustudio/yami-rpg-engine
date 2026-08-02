<template>
	<WindowFrame id="moveLight">
		<TitleBar>Move Light<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Light</text><custom-box id="moveLight-light" type="light" />
				<text>Properties</text><param-list id="moveLight-properties" />
				<text>Easing</text><select-box id="moveLight-easingId" name="easing" />
				<text>Duration</text
				><number-box
					id="moveLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><select-box id="moveLight-wait" name="wait" />
			</grid-box>
			<button id="moveLight-confirm" name="confirm">Confirm</button>
			<button id="moveLight-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
