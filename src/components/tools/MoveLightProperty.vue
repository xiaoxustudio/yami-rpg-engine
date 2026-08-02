<template>
		<WindowFrame id="moveLight-property">
		<TitleBar>Point Light Property<div class="close"></div></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><SelectBox id="moveLight-property-key" /> <text>X</text
				><NumberVar
					id="moveLight-property-x"
					min="0"
					max="512"
					step="0.1"
					decimals="4"
				/>
				<text>Y</text
				><NumberVar
					id="moveLight-property-y"
					min="0"
					max="512"
					step="0.1"
					decimals="4"
				/>
				<text>Range</text
				><NumberVar
					id="moveLight-property-range"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Intensity</text
				><NumberVar
					id="moveLight-property-intensity"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Anchor X</text
				><NumberVar
					id="moveLight-property-anchorX"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Anchor Y</text
				><NumberVar
					id="moveLight-property-anchorY"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Width</text
				><NumberVar
					id="moveLight-property-width"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Height</text
				><NumberVar
					id="moveLight-property-height"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Angle</text
				><NumberVar
					id="moveLight-property-angle"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
					unit="deg"
				/>
				<text>Red</text
				><NumberVar id="moveLight-property-red" min="0" max="255" step="5" />
				<text>Green</text
				><NumberVar id="moveLight-property-green" min="0" max="255" step="5" />
				<text>Blue</text
				><NumberVar id="moveLight-property-blue" min="0" max="255" step="5" />
			</grid-box>
			<button id="moveLight-property-confirm" name="confirm">Confirm</button>
			<button id="moveLight-property-cancel" name="cancel">Cancel</button>
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
