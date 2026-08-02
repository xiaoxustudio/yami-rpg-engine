<template>
	<WindowFrame id="setList">
		<TitleBar>Set List<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box id="setList-variable" type="variable" filter="object" />
				<text>Operation</text><select-box id="setList-operation" />
				<text>Numbers</text
				><custom-box id="setList-numbers" type="array" filter="number" />
				<text>Strings</text
				><custom-box id="setList-strings" type="array" filter="string" />
				<text>Index</text><number-var id="setList-index" min="0" max="1000000000" />
				<text>Boolean</text><select-box id="setList-boolean" /> <text>Number</text
				><number-box
					id="setList-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>String</text><text-area id="setList-string" /> <text>Variable</text
				><custom-box id="setList-operand" type="variable" filter="all" />
				<text>Separator</text><text-area-var id="setList-separator" />
				<text>Attribute Group</text
				><custom-box id="setList-attribute-groupId" type="attribute-group" />
				<text>Enum Group</text
				><custom-box id="setList-enum-groupId" type="enum-group" /> <text>Actor</text
				><custom-box id="setList-actor" type="actor" /> <text>Default</text
				><check-box id="setList-index-skip-check" class="standard" />
			</grid-box>
			<button id="setList-confirm" name="confirm">Confirm</button>
			<button id="setList-cancel" name="cancel">Cancel</button>
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
