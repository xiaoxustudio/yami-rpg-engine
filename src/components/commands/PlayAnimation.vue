<template>
	<WindowFrame id="playAnimation">
		<TitleBar>Play Animation<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Mode</text><SelectBox id="playAnimation-mode" /> <text>Position</text
				><CustomBox id="playAnimation-position" type="position" /> <text>Actor</text
				><CustomBox id="playAnimation-actor" type="actor" /> <text>Animation</text
				><CustomBox id="playAnimation-animationId" type="file" filter="animation" />
				<text>Motion</text><SelectBox id="playAnimation-motion" />
				<text>Rotatable</text><SelectBox id="playAnimation-rotatable" />
				<text>Priority</text
				><NumberBox id="playAnimation-priority" min="-100" max="100" />
				<text>Offset Y</text
				><NumberVar
					id="playAnimation-offsetY"
					min="-1000000000"
					max="1000000000"
					unit="px"
				 />
				<text>Angle</text
				><NumberVar
					id="playAnimation-angle"
					min="-360"
					max="360"
					decimals="4"
					unit="deg"
				 />
				<text>Speed</text
				><NumberVar
					id="playAnimation-speed"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<text>Wait</text><SelectBox id="playAnimation-wait" name="wait" />
			</div>
			<button id="playAnimation-confirm" name="confirm">Confirm</button>
			<button id="playAnimation-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
