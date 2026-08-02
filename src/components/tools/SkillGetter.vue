<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame id="skillGetter">
		<TitleBar>Actor<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="skillGetter-type" /> <text>Actor</text
				><CustomBox id="skillGetter-actor" type="actor" /> <text>Shortcut Key</text
				><SelectVar id="skillGetter-key" /> <text>Skill</text
				><CustomBox id="skillGetter-skillId" type="file" filter="skill" />
				<text>Variable</text
				><CustomBox id="skillGetter-variable" type="variable" filter="object" />
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
