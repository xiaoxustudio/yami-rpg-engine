<template>
	<WindowFrame id="setSkill">
		<TitleBar>Set Skill<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Skill</text><CustomBox id="setSkill-skill" type="skill" />
				<text>Operation</text><SelectBox id="setSkill-operation" />
				<text>Cooldown</text
				><NumberVar id="setSkill-cooldown" min="1" max="3600000" unit="ms" />
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
