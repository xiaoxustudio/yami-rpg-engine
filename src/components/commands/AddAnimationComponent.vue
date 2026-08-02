<template>
<WindowFrame id="addAnimationComponent">
	<TitleBar>Add Animation Component<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="addAnimationComponent-actor" type="actor" /><text>Animation</text
			><CustomBox
				id="addAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><SelectBox id="addAnimationComponent-motion" /><text>Rotatable</text><SelectBox id="addAnimationComponent-rotatable" /><text>Sync Angle</text><SelectBox id="addAnimationComponent-syncAngle" /><text>Priority</text
			><NumberBox id="addAnimationComponent-priority" min="-100" max="100" /><text>Offset Y</text
			><NumberBox
				id="addAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /></grid-box>
		<button id="addAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="addAnimationComponent-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
