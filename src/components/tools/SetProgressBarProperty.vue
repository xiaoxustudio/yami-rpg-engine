<template>
		<WindowFrame id="setProgressBar-property">
		<TitleBar>Image Property<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="setProgressBar-property-key" />
				<text>Image</text
				><custom-box id="setProgressBar-property-image" type="file" filter="image" />
				<text>Display</text><select-box id="setProgressBar-property-display" />
				<text>Blend</text><select-box id="setProgressBar-property-blend" />
				<text>Progress</text
				><number-var
					id="setProgressBar-property-progress"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Clip - X</text
				><number-var
					id="setProgressBar-property-clip-0"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Y</text
				><number-var
					id="setProgressBar-property-clip-1"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Width</text
				><number-var
					id="setProgressBar-property-clip-2"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Height</text
				><number-var
					id="setProgressBar-property-clip-3"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Color - Red</text
				><number-var id="setProgressBar-property-color-0" min="0" max="255" />
				<text>Color - Green</text
				><number-var id="setProgressBar-property-color-1" min="0" max="255" />
				<text>Color - Blue</text
				><number-var id="setProgressBar-property-color-2" min="0" max="255" />
				<text>Color - Alpha</text
				><number-var id="setProgressBar-property-color-3" min="0" max="255" />
			</grid-box>
			<button id="setProgressBar-property-confirm" name="confirm">Confirm</button>
			<button id="setProgressBar-property-cancel" name="cancel">Cancel</button>
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
