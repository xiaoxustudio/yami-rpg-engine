<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame id="skillGetter">
		<TitleBar>Actor<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="skillGetter-type" /> <text>Actor</text
				><custom-box id="skillGetter-actor" type="actor" /> <text>Shortcut Key</text
				><select-var id="skillGetter-key" /> <text>Skill</text
				><custom-box id="skillGetter-skillId" type="file" filter="skill" />
				<text>Variable</text
				><custom-box id="skillGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="skillGetter-confirm" name="confirm">Confirm</button>
			<button id="skillGetter-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
