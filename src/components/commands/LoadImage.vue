<template>
	<WindowFrame id="loadImage">
		<TitleBar>Load Image<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Element</text><CustomBox id="loadImage-element" type="element" />
				<text>Type</text><SelectBox id="loadImage-type" /> <text>Actor</text
				><CustomBox id="loadImage-actor" type="actor" /> <text>Skill</text
				><CustomBox id="loadImage-skill" type="skill" /> <text>State</text
				><CustomBox id="loadImage-state" type="state" /> <text>Equipment</text
				><CustomBox id="loadImage-equipment" type="equipment" /> <text>Item</text
				><CustomBox id="loadImage-item" type="item" /> <text>Shortcut Key</text
				><SelectVar id="loadImage-key" /> <text>Base64 Coding</text
				><CustomBox id="loadImage-variable" type="variable" filter="string" />
			</grid-box>
			<button id="loadImage-confirm" name="confirm">Confirm</button>
			<button id="loadImage-cancel" name="cancel">Cancel</button>
		</content-frame>
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
