<template>
<WindowFrame id="setMovementSpeed">
	<TitleBar>Set Movement Speed<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="setMovementSpeed-actor" type="actor" /><text>Property</text><SelectBox id="setMovementSpeed-property" /><text>Base Speed</text
			><NumberVar
				id="setMovementSpeed-base"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
			 /><text>Speed Factor</text
			><NumberVar id="setMovementSpeed-factor" min="0" max="4" decimals="4" /></grid-box>
		<button id="setMovementSpeed-confirm" name="confirm">Confirm</button>
		<button id="setMovementSpeed-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
