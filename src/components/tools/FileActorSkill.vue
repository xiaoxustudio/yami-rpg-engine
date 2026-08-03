<template>
	<WindowFrame id="fileActor-skill">
		<TitleBar>Skill<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Skill</div
				><CustomBox id="fileActor-skill-id" type="file" filter="skill" />
				<div class="text">Shortcut Key</div><SelectBox id="fileActor-skill-key" />
			</div>
			<button id="fileActor-skill-confirm" name="confirm">Confirm</button>
			<button id="fileActor-skill-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
