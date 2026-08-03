<template>
	<WindowFrame id="setList">
		<TitleBar>Set List<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Variable</text
				><CustomBox id="setList-variable" type="variable" filter="object" />
				<text>Operation</text><SelectBox id="setList-operation" />
				<text>Numbers</text
				><CustomBox id="setList-numbers" type="array" filter="number" />
				<text>Strings</text
				><CustomBox id="setList-strings" type="array" filter="string" />
				<text>Index</text><NumberVar id="setList-index" min="0" max="1000000000" />
				<text>Boolean</text><SelectBox id="setList-boolean" /> <text>Number</text
				><NumberBox
					id="setList-number"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>String</text><TextArea id="setList-string" /> <text>Variable</text
				><CustomBox id="setList-operand" type="variable" filter="all" />
				<text>Separator</text><TextAreaVar id="setList-separator" />
				<text>Attribute Group</text
				><CustomBox id="setList-attribute-groupId" type="attribute-group" />
				<text>Enum Group</text
				><CustomBox id="setList-enum-groupId" type="enum-group" /> <text>Actor</text
				><CustomBox id="setList-actor" type="actor" /> <text>Default</text
				><CheckBox id="setList-index-skip-check" class="standard" />
			</div>
			<button id="setList-confirm" name="confirm">Confirm</button>
			<button id="setList-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
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

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
