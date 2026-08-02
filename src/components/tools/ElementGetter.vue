<template>
	<WindowFrame id="elementGetter">
		<TitleBar>Element<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="elementGetter-type" /> <text>Ancestor</text
				><CustomBox id="elementGetter-ancestor" type="ancestor-element" />
				<text>Data ID</text
				><CustomBox id="elementGetter-presetId" type="preset-element" />
				<text>Index</text><NumberVar id="elementGetter-index" min="0" max="10000" />
				<text>Variable</text
				><CustomBox id="elementGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="elementGetter-confirm" name="confirm">Confirm</button>
			<button id="elementGetter-cancel" name="cancel">Cancel</button>
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
