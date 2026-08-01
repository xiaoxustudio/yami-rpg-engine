<template>
	<window-frame id="moveElement">
		<title-bar>Move Element<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Element</text><custom-box id="moveElement-element" type="element" />
				<text>Properties</text><param-list id="moveElement-properties" />
				<text>Easing</text><select-box id="moveElement-easingId" name="easing" />
				<text>Duration</text
				><number-box
					id="moveElement-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<text>Wait</text><select-box id="moveElement-wait" name="wait" />
			</grid-box>
			<button id="moveElement-confirm" name="confirm">Confirm</button>
			<button id="moveElement-cancel" name="cancel">Cancel</button>
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
