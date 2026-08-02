<template>
	<WindowFrame id="tintImage">
		<TitleBar>Tint Image<close /></TitleBar>
		<content-frame>
			<grid-box id="tintImage-grid-box">
				<text>Element</text><CustomBox id="tintImage-element" type="element" />
				<text>Mode</text><SelectBox id="tintImage-mode" /> <text>Tint - Red</text
				><NumberBox id="tintImage-tint-0" min="-255" max="255" step="5" />
				<text>Tint - Green</text
				><NumberBox id="tintImage-tint-1" min="-255" max="255" step="5" />
				<text>Tint - Blue</text
				><NumberBox id="tintImage-tint-2" min="-255" max="255" step="5" />
				<text>Tint - Grayscale</text
				><NumberBox id="tintImage-tint-3" min="0" max="255" step="5" />
				<text>Easing</text><SelectBox id="tintImage-easingId" name="easing" />
				<text>Duration</text
				><NumberBox
					id="tintImage-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<text>Wait</text><SelectBox id="tintImage-wait" name="wait" />
			</grid-box>
			<FilterBox id="tintImage-filter" width="96" height="208" />
			<button id="tintImage-confirm" name="confirm">Confirm</button>
			<button id="tintImage-cancel" name="cancel">Cancel</button>
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
