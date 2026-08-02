<template>
<WindowFrame id="createActor">
	<TitleBar>Create Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="createActor-actorId" type="file" filter="actor" /><text>Team</text><SelectBox id="createActor-teamId" /><text>Position</text
			><CustomBox id="createActor-position" type="position" /><text>Angle</text
			><NumberVar
				id="createActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
			 /></grid-box>
		<button id="createActor-confirm" name="confirm">Confirm</button>
		<button id="createActor-cancel" name="cancel">Cancel</button>
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
