<template>
<WindowFrame id="setCooldown">
	<TitleBar>Set Cooldown<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="setCooldown-actor" type="actor" />
			<text>Operation</text><SelectBox id="setCooldown-operation" />
			<text>Cooldown Key</text><SelectVar id="setCooldown-key" />
			<text>Cooldown Time</text
			><NumberVar id="setCooldown-cooldown" min="1" max="3600000" unit="ms" />
		</div>
		<button id="setCooldown-confirm" name="confirm">Confirm</button>
		<button id="setCooldown-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
