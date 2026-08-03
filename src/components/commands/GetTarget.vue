<template>
<WindowFrame id="getTarget">
	<TitleBar>Get Target<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="getTarget-actor" type="actor" /><div class="text">Selector</div><SelectBox id="getTarget-selector" /><div class="text">Condition</div><SelectBox id="getTarget-condition" /><div class="text">Attribute</div><SelectBox id="getTarget-attribute" /><div class="text">Attribute 2</div><SelectBox id="getTarget-divisor" /></div>
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
