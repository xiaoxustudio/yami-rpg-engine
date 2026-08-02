<template>
	<WindowFrame id="setObjectProperty">
		<TitleBar>setObjectProperty<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="setObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<text>setObjectProperty</text><param-list id="setObjectProperty-list" />
				<text>valueVariable</text
				><custom-box
					id="setObjectProperty-value-variable"
					type="variable"
					filter="all"
				/>
			</grid-box>
			<button id="setObjectProperty-confirm" name="confirm">Confirm</button>
			<button id="setObjectProperty-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
