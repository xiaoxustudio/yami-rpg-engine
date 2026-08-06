<template>
	<WindowFrame id="setBoolean">
		<template #title><TitleBar>Set Boolean<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setBoolean-variable"
					type="variable"
					filter="writable-boolean"
				/>
				<div class="text">Operation</div><SelectBox id="setBoolean-operation" />
				<div class="text">Type</div><SelectBox id="setBoolean-operand-type" @write="onWrite" />
				<div class="text">Constant</div><SelectBox id="setBoolean-constant-value" />
				<div class="text">Variable</div
				><CustomBox id="setBoolean-common-variable" type="variable" filter="all" />
				<div class="text">Index</div
				><NumberVar id="setBoolean-list-index" min="0" max="1000000000" />
				<div class="text">Param Name</div><StringVar id="setBoolean-parameter-key" />
				<div class="text">Script</div><TextBox id="setBoolean-script" />
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
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const onWrite = (value: any) => {
	(window as any).Command?.cases?.setBoolean?.writeHandler?.({ value });
};

const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
