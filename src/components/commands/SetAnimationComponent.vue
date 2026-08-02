<template>
<WindowFrame id="setAnimationComponent">
	<TitleBar>Set Animation Component<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="setAnimationComponent-actor" type="actor" /><text>Animation</text
			><CustomBox
				id="setAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><SelectBox id="setAnimationComponent-motion" /><text>Operation</text><SelectBox id="setAnimationComponent-operation" /><text>Angle</text
			><CustomBox id="setAnimationComponent-angle" type="angle" /><text>Scale</text
			><NumberVar
				id="setAnimationComponent-scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Speed</text
			><NumberVar
				id="setAnimationComponent-speed"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Opacity</text
			><NumberVar
				id="setAnimationComponent-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			 /><text>Priority</text
			><NumberBox id="setAnimationComponent-priority" min="-100" max="100" /><text>Offset Y</text
			><NumberBox
				id="setAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /><text>Sprite Name</text><SelectBox id="setAnimationComponent-spriteId" /><text>Image</text
			><CustomBox id="setAnimationComponent-image" type="file" filter="image" /><text>Play Motion</text><SelectBox id="setAnimationComponent-playMotion" /><text>Wait</text><SelectBox id="setAnimationComponent-wait" name="wait" /></grid-box>
		<button id="setAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="setAnimationComponent-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
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
