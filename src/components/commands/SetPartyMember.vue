<template>
<WindowFrame id="setPartyMember">
	<TitleBar>Set Party Member<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setPartyMember-operation" /><div class="text">Global Actor</div
			><CustomBox id="setPartyMember-actor" type="actor" /></div>
		<button id="setPartyMember-confirm" name="confirm">Confirm</button>
		<button id="setPartyMember-cancel" name="cancel">Cancel</button>
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
