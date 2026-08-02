<template>
	<WindowFrame id="actorGetter">
		<TitleBar>Actor<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="actorGetter-type" /> <text>Member ID</text
				><NumberVar id="actorGetter-memberId" min="0" max="10000" />
				<text>Actor</text
				><CustomBox id="actorGetter-actorId" type="file" filter="actor" />
				<text>Data ID</text
				><CustomBox id="actorGetter-presetId" type="preset-object" filter="actor" />
				<text>Variable</text
				><CustomBox id="actorGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="actorGetter-confirm" name="confirm">Confirm</button>
			<button id="actorGetter-cancel" name="cancel">Cancel</button>
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
