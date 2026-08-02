<template>
	<WindowFrame id="setSkill">
		<TitleBar>Set Skill<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Skill</text><custom-box id="setSkill-skill" type="skill" />
				<text>Operation</text><select-box id="setSkill-operation" />
				<text>Cooldown</text
				><number-var id="setSkill-cooldown" min="1" max="3600000" unit="ms" />
			</grid-box>
			<button id="setSkill-confirm" name="confirm">Confirm</button>
			<button id="setSkill-cancel" name="cancel">Cancel</button>
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
