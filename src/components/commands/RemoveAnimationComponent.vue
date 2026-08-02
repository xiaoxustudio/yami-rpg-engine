<template>
<WindowFrame id="removeAnimationComponent">
	<TitleBar>Remove Animation Component<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="removeAnimationComponent-actor" type="actor" /><text>Animation</text
			><CustomBox
				id="removeAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><SelectBox id="removeAnimationComponent-motion" /></grid-box>
		<button id="removeAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="removeAnimationComponent-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
