<template>
	<WindowFrame id="castSkill">
		<TitleBar>Cast Skill<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Actor</text><CustomBox id="castSkill-actor" type="actor" />
				<text>Mode</text><SelectBox id="castSkill-mode" /> <text>Shortcut Key</text
				><SelectBox id="castSkill-key" /> <text>Shortcut Key</text
				><StringVar id="castSkill-keyVar" /> <text>Skill</text
				><CustomBox id="castSkill-skillId" type="file" filter="skill" />
				<text>Skill</text><CustomBox id="castSkill-skill" type="skill" />
				<text>Wait</text><SelectBox id="castSkill-wait" name="wait" />
			</grid-box>
			<button id="castSkill-confirm" name="confirm">Confirm</button>
			<button id="castSkill-cancel" name="cancel">Cancel</button>
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
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
