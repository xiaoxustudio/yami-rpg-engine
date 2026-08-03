<template>
<WindowFrame id="getTarget">
	<TitleBar>Get Target<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="getTarget-actor" type="actor" /><text>Selector</text><SelectBox id="getTarget-selector" /><text>Condition</text><SelectBox id="getTarget-condition" /><text>Attribute</text><SelectBox id="getTarget-attribute" /><text>Attribute 2</text><SelectBox id="getTarget-divisor" /></div>
		<button id="getTarget-confirm" name="confirm">Confirm</button>
		<button id="getTarget-cancel" name="cancel">Cancel</button>
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
