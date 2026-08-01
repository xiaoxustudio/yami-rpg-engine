<template>
	<window-frame id="setBoolean">
		<title-bar>Set Boolean<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="setBoolean-variable"
					type="variable"
					filter="writable-boolean"
				/>
				<text>Operation</text><select-box id="setBoolean-operation" />
				<text>Type</text><select-box id="setBoolean-operand-type" />
				<text>Constant</text><select-box id="setBoolean-constant-value" />
				<text>Variable</text
				><custom-box id="setBoolean-common-variable" type="variable" filter="all" />
				<text>Index</text
				><number-var id="setBoolean-list-index" min="0" max="1000000000" />
				<text>Param Name</text><string-var id="setBoolean-parameter-key" />
				<text>Script</text><text-box id="setBoolean-script" />
			</grid-box>
			<button id="setBoolean-confirm" name="confirm">Confirm</button>
			<button id="setBoolean-cancel" name="cancel">Cancel</button>
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
