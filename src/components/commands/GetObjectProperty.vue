<template>
	<window-frame id="getObjectProperty">
		<title-bar>getObjectProperty<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="getObjectProperty-variable"
					type="variable"
					filter="object"
				/>
				<text>getObjectProperty</text><param-list id="getObjectProperty-list" />
				<text>saveVariable</text
				><custom-box
					id="getObjectProperty-save-variable"
					type="variable"
					filter="object"
				/>
			</grid-box>
			<button id="getObjectProperty-confirm" name="confirm">Confirm</button>
			<button id="getObjectProperty-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
