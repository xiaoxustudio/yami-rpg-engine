<template>
		<WindowFrame id="moveLight-property">
		<TitleBar>Point Light Property<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Property</text><select-box id="moveLight-property-key" /> <text>X</text
				><number-var
					id="moveLight-property-x"
					min="0"
					max="512"
					step="0.1"
					decimals="4"
				/>
				<text>Y</text
				><number-var
					id="moveLight-property-y"
					min="0"
					max="512"
					step="0.1"
					decimals="4"
				/>
				<text>Range</text
				><number-var
					id="moveLight-property-range"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Intensity</text
				><number-var
					id="moveLight-property-intensity"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Anchor X</text
				><number-var
					id="moveLight-property-anchorX"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Anchor Y</text
				><number-var
					id="moveLight-property-anchorY"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				/>
				<text>Width</text
				><number-var
					id="moveLight-property-width"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Height</text
				><number-var
					id="moveLight-property-height"
					min="0"
					max="128"
					decimals="4"
					unit="tile"
				/>
				<text>Angle</text
				><number-var
					id="moveLight-property-angle"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
					unit="deg"
				/>
				<text>Red</text
				><number-var id="moveLight-property-red" min="0" max="255" step="5" />
				<text>Green</text
				><number-var id="moveLight-property-green" min="0" max="255" step="5" />
				<text>Blue</text
				><number-var id="moveLight-property-blue" min="0" max="255" step="5" />
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
