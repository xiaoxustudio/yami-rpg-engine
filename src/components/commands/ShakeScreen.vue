<template>
	<WindowFrame id="shakeScreen">
		<TitleBar>Tint Screen<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Shake Mode</text><SelectBox id="shakeScreen-mode" /> <text>Power</text
				><NumberBox id="shakeScreen-power" min="1" max="10" /> <text>Speed</text
				><NumberBox id="shakeScreen-speed" min="1" max="10" /> <text>Easing</text
				><SelectBox id="shakeScreen-easingId" name="easing" /> <text>Duration</text
				><NumberBox
					id="shakeScreen-duration"
					name="duration"
					min="1"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="shakeScreen-wait" name="wait" />
			</grid-box>
			<button id="shakeScreen-confirm" name="confirm">Confirm</button>
			<button id="shakeScreen-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
