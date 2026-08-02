<template>
<WindowFrame id="translateActor">
	<TitleBar>Translate Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="translateActor-actor" type="actor" />
			<text>Angle</text><custom-box id="translateActor-angle" type="angle" />
			<text>Distance</text
			><number-var
				id="translateActor-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 />
			<text>Easing</text><select-box id="translateActor-easingId" name="easing" />
			<text>Duration</text
			><number-var
				id="translateActor-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<text>Wait</text><select-box id="translateActor-wait" name="wait" />
		</grid-box>
		<button id="translateActor-confirm" name="confirm">Confirm</button>
		<button id="translateActor-cancel" name="cancel">Cancel</button>
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
