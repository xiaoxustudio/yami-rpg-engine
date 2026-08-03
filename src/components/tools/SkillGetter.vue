<template>
	<!-- 技能访问器窗口 -->
	<WindowFrame id="skillGetter">
		<TitleBar>Actor<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="skillGetter-type" /> <div class="text">Actor</div
				><CustomBox id="skillGetter-actor" type="actor" /> <div class="text">Shortcut Key</div
				><SelectVar id="skillGetter-key" /> <div class="text">Skill</div
				><CustomBox id="skillGetter-skillId" type="file" filter="skill" />
				<div class="text">Variable</div
				><CustomBox id="skillGetter-variable" type="variable" filter="object" />
			</div>
			<button id="skillGetter-confirm" name="confirm">Confirm</button>
			<button id="skillGetter-cancel" name="cancel">Cancel</button>
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
