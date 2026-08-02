<template>
	<WindowFrame id="setState">
		<TitleBar>Set State<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>State</text><CustomBox id="setState-state" type="state" />
				<text>Operation</text><SelectBox id="setState-operation" /> <text>Time</text
				><NumberVar id="setState-time" min="0" max="36000000" unit="ms" />
			</grid-box>
			<button id="setState-confirm" name="confirm">Confirm</button>
			<button id="setState-cancel" name="cancel">Cancel</button>
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
