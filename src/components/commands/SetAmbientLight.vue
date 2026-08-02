<template>
	<WindowFrame id="setAmbientLight">
		<TitleBar>Set Ambient Light<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Red</text
				><NumberVar id="setAmbientLight-red" min="0" max="255" step="5" />
				<text>Green</text
				><NumberVar id="setAmbientLight-green" min="0" max="255" step="5" />
				<text>Blue</text
				><NumberVar id="setAmbientLight-blue" min="0" max="255" step="5" />
				<text>Easing</text><SelectBox id="setAmbientLight-easingId" name="easing" />
				<text>Duration</text
				><NumberVar
					id="setAmbientLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="setAmbientLight-wait" name="wait" />
			</grid-box>
			<button id="setAmbientLight-confirm" name="confirm">Confirm</button>
			<button id="setAmbientLight-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
