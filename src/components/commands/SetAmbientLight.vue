<template>
	<WindowFrame id="setAmbientLight">
		<TitleBar>Set Ambient Light<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Red</div
				><NumberVar id="setAmbientLight-red" min="0" max="255" step="5" />
				<div class="text">Green</div
				><NumberVar id="setAmbientLight-green" min="0" max="255" step="5" />
				<div class="text">Blue</div
				><NumberVar id="setAmbientLight-blue" min="0" max="255" step="5" />
				<div class="text">Easing</div><SelectBox id="setAmbientLight-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberVar
					id="setAmbientLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="setAmbientLight-wait" name="wait" />
			</div>
			<button id="setAmbientLight-confirm" name="confirm">Confirm</button>
			<button id="setAmbientLight-cancel" name="cancel">Cancel</button>
		</div>
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
