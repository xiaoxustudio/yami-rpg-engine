<template>
	<WindowFrame id="setObjectAnimation">
		<TitleBar>Set Object Animation<close /></TitleBar>
		<content-frame>
			<grid-box id="setObjectAnimation-grid-box">
				<text>Sort</text><SelectBox id="setObjectAnimation-sort" />
				<text>Actor</text><CustomBox id="setObjectAnimation-actor" type="actor" />
				<text>Trigger</text
				><CustomBox id="setObjectAnimation-trigger" type="trigger" />
				<text>Animation</text
				><CustomBox id="setObjectAnimation-animation" type="object" />
				<text>Operation</text><SelectBox id="setObjectAnimation-operation" />
				<text>Tint - Red</text
				><NumberBox id="setObjectAnimation-tint-0" min="-255" max="255" step="5" />
				<text>Tint - Green</text
				><NumberBox id="setObjectAnimation-tint-1" min="-255" max="255" step="5" />
				<text>Tint - Blue</text
				><NumberBox id="setObjectAnimation-tint-2" min="-255" max="255" step="5" />
				<text>Tint - Grayscale</text
				><NumberBox id="setObjectAnimation-tint-3" min="0" max="255" step="5" />
				<text>Opacity</text
				><NumberVar
					id="setObjectAnimation-opacity"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				 />
				<text>OffsetY</text
				><NumberVar
					id="setObjectAnimation-offsetY"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
				 />
				<text>Rotation</text
				><NumberVar
					id="setObjectAnimation-rotation"
					min="-10000"
					max="10000"
					step="1"
					decimals="4"
				 />
				<text>Easing</text
				><SelectBox id="setObjectAnimation-easingId" name="easing" />
				<text>Duration</text
				><NumberBox
					id="setObjectAnimation-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<text>Wait</text><SelectBox id="setObjectAnimation-wait" name="wait" />
			</grid-box>
			<button id="setObjectAnimation-confirm" name="confirm">Confirm</button>
			<button id="setObjectAnimation-cancel" name="cancel">Cancel</button>
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
