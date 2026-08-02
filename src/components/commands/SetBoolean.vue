<template>
	<WindowFrame id="setBoolean">
		<TitleBar>Set Boolean<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><CustomBox
					id="setBoolean-variable"
					type="variable"
					filter="writable-boolean"
				/>
				<text>Operation</text><SelectBox id="setBoolean-operation" />
				<text>Type</text><SelectBox id="setBoolean-operand-type" />
				<text>Constant</text><SelectBox id="setBoolean-constant-value" />
				<text>Variable</text
				><CustomBox id="setBoolean-common-variable" type="variable" filter="all" />
				<text>Index</text
				><NumberVar id="setBoolean-list-index" min="0" max="1000000000" />
				<text>Param Name</text><StringVar id="setBoolean-parameter-key" />
				<text>Script</text><TextBox id="setBoolean-script" />
			</grid-box>
			<button id="setBoolean-confirm" name="confirm">Confirm</button>
			<button id="setBoolean-cancel" name="cancel">Cancel</button>
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
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
