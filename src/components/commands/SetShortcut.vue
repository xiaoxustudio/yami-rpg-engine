<template>
<WindowFrame id="setShortcut">
	<TitleBar>Set Shortcut<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setShortcut-actor" type="actor" />
			<div class="text">Operation</div><SelectBox id="setShortcut-operation" />
			<div class="text">Shortcut Key</div><SelectVar id="setShortcut-key" />
			<div class="text">Shortcut Key 2</div><SelectVar id="setShortcut-key2" />
			<div class="text">Item</div><FileVar id="setShortcut-itemId" type="file" filter="item" />
			<div class="text">Skill</div
			><FileVar id="setShortcut-skillId" type="file" filter="skill" />
		</div>
		<button id="setShortcut-confirm" name="confirm">Confirm</button>
		<button id="setShortcut-cancel" name="cancel">Cancel</button>
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
import FileVar from '@app/components/common/FileVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
