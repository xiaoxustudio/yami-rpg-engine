<template>
	<WindowFrame id="setGameSpeed">
		<TitleBar>Set Game Speed<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Speed</text
				><number-var
					id="setGameSpeed-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				/>
				<text>Easing</text><select-box id="setGameSpeed-easingId" name="easing" />
				<text>Duration</text
				><number-var
					id="setGameSpeed-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<text>Wait</text><select-box id="setGameSpeed-wait" name="wait" />
			</grid-box>
			<button id="setGameSpeed-confirm" name="confirm">Confirm</button>
			<button id="setGameSpeed-cancel" name="cancel">Cancel</button>
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
