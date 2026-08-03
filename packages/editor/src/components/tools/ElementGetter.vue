<template>
	<WindowFrame id="elementGetter">
		<TitleBar>Element<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="elementGetter-type" /> <div class="text">Ancestor</div
				><CustomBox id="elementGetter-ancestor" type="ancestor-element" />
				<div class="text">Data ID</div
				><CustomBox id="elementGetter-presetId" type="preset-element" />
				<div class="text">Index</div><NumberVar id="elementGetter-index" min="0" max="10000" />
				<div class="text">Variable</div
				><CustomBox id="elementGetter-variable" type="variable" filter="object" />
			</div>
			<button id="elementGetter-confirm" name="confirm">Confirm</button>
			<button id="elementGetter-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
