<template>
	<WindowFrame id="getObjectProperty">
		<TitleBar>getObjectProperty<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><CustomBox
					id="getObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<text>getObjectProperty</text><ParamList id="getObjectProperty-list" />
				<text>saveVariable</text
				><CustomBox
					id="getObjectProperty-save-variable"
					type="variable"
					filter="object"
				/>
			</grid-box>
			<button id="getObjectProperty-confirm" name="confirm">Confirm</button>
			<button id="getObjectProperty-cancel" name="cancel">Cancel</button>
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
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
