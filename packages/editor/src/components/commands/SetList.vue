<template>
	<WindowFrame id="setList" @confirm="onConfirm">
		<template #title><TitleBar>Set List<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox id="setList-variable" type="variable" filter="object" />
				<div class="text">Operation</div><SelectBox id="setList-operation" />
				<div class="text">Numbers</div
				><CustomBox id="setList-numbers" type="array" filter="number" />
				<div class="text">Strings</div
				><CustomBox id="setList-strings" type="array" filter="string" />
				<div class="text">Index</div><NumberVar id="setList-index" min="0" max="1000000000" />
				<div class="text">Boolean</div><SelectBox id="setList-boolean" /> <div class="text">Number</div
				><NumberBox
					id="setList-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">String</div><TextArea id="setList-string" /> <div class="text">Variable</div
				><CustomBox id="setList-operand" type="variable" filter="all" />
				<div class="text">Separator</div><TextAreaVar id="setList-separator" />
				<div class="text">Attribute Group</div
				><CustomBox id="setList-attribute-groupId" type="attribute-group" />
				<div class="text">Enum Group</div
				><CustomBox id="setList-enum-groupId" type="enum-group" /> <div class="text">Actor</div
				><CustomBox id="setList-actor" type="actor" /> <div class="text">Default</div
				><CheckBox id="setList-index-skip-check" class="standard" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setList?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
