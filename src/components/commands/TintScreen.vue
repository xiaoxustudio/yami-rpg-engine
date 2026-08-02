<template>
	<WindowFrame id="tintScreen">
		<TitleBar>Tint Screen<close /></TitleBar>
		<content-frame>
			<grid-box id="tintScreen-grid-box">
				<text>Tint - Red</text
				><NumberBox id="tintScreen-tint-0" min="-255" max="255" step="5" />
				<text>Tint - Green</text
				><NumberBox id="tintScreen-tint-1" min="-255" max="255" step="5" />
				<text>Tint - Blue</text
				><NumberBox id="tintScreen-tint-2" min="-255" max="255" step="5" />
				<text>Tint - Grayscale</text
				><NumberBox id="tintScreen-tint-3" min="0" max="255" step="5" />
				<text>Easing</text><SelectBox id="tintScreen-easingId" name="easing" />
				<text>Duration</text
				><NumberBox
					id="tintScreen-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="tintScreen-wait" name="wait" />
			</grid-box>
			<FilterBox id="tintScreen-filter" width="96" height="160" />
			<button id="tintScreen-confirm" name="confirm">Confirm</button>
			<button id="tintScreen-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
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
