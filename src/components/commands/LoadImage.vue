<template>
	<WindowFrame id="loadImage">
		<TitleBar>Load Image<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="loadImage-element" type="element" />
				<div class="text">Type</div><SelectBox id="loadImage-type" /> <div class="text">Actor</div
				><CustomBox id="loadImage-actor" type="actor" /> <div class="text">Skill</div
				><CustomBox id="loadImage-skill" type="skill" /> <div class="text">State</div
				><CustomBox id="loadImage-state" type="state" /> <div class="text">Equipment</div
				><CustomBox id="loadImage-equipment" type="equipment" /> <div class="text">Item</div
				><CustomBox id="loadImage-item" type="item" /> <div class="text">Shortcut Key</div
				><SelectVar id="loadImage-key" /> <div class="text">Base64 Coding</div
				><CustomBox id="loadImage-variable" type="variable" filter="string" />
			</div>
			<button id="loadImage-confirm" name="confirm">Confirm</button>
			<button id="loadImage-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
