<template>
		<WindowFrame id="setProgressBar-property">
		<TitleBar>Image Property<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><SelectBox id="setProgressBar-property-key" />
				<text>Image</text
				><CustomBox id="setProgressBar-property-image" type="file" filter="image" />
				<text>Display</text><SelectBox id="setProgressBar-property-display" />
				<text>Blend</text><SelectBox id="setProgressBar-property-blend" />
				<text>Progress</text
				><NumberVar
					id="setProgressBar-property-progress"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Clip - X</text
				><NumberVar
					id="setProgressBar-property-clip-0"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Y</text
				><NumberVar
					id="setProgressBar-property-clip-1"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Width</text
				><NumberVar
					id="setProgressBar-property-clip-2"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Clip - Height</text
				><NumberVar
					id="setProgressBar-property-clip-3"
					min="0"
					max="10000"
					unit="px"
				/>
				<text>Color - Red</text
				><NumberVar id="setProgressBar-property-color-0" min="0" max="255" />
				<text>Color - Green</text
				><NumberVar id="setProgressBar-property-color-1" min="0" max="255" />
				<text>Color - Blue</text
				><NumberVar id="setProgressBar-property-color-2" min="0" max="255" />
				<text>Color - Alpha</text
				><NumberVar id="setProgressBar-property-color-3" min="0" max="255" />
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
