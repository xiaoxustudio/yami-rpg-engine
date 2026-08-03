<template>
<WindowFrame id="changeActorState">
	<TitleBar>Change Actor State<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="changeActorState-actor" type="actor" /><text>Operation</text><SelectBox id="changeActorState-operation" /><text>State</text
			><CustomBox id="changeActorState-stateId" type="file" filter="state" /><text>State</text><CustomBox id="changeActorState-state" type="state" /></div>
		<button id="changeActorState-confirm" name="confirm">Confirm</button>
		<button id="changeActorState-cancel" name="cancel">Cancel</button>
	</div>
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
