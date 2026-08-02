<template>
<WindowFrame id="setShortcut">
	<TitleBar>Set Shortcut<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="setShortcut-actor" type="actor" />
			<text>Operation</text><SelectBox id="setShortcut-operation" />
			<text>Shortcut Key</text><SelectVar id="setShortcut-key" />
			<text>Shortcut Key 2</text><SelectVar id="setShortcut-key2" />
			<text>Item</text><FileVar id="setShortcut-itemId" type="file" filter="item" />
			<text>Skill</text
			><FileVar id="setShortcut-skillId" type="file" filter="skill" />
		</grid-box>
		<button id="setShortcut-confirm" name="confirm">Confirm</button>
		<button id="setShortcut-cancel" name="cancel">Cancel</button>
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
