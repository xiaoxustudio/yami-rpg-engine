<template>
	<WindowFrame id="attribute" show-apply>
		<template #title><TitleBar>Attribute<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="attribute-list-fieldset">
				<div class="legend">List</div>
				<TreeList id="attribute-list" padded />
			</div>
			<div class="field-set" id="attribute-properties-fieldset">
				<div class="legend">Properties</div>
				<div class="flex-box" id="attribute-properties-flex">
					<div class="flex-item"
						><div class="text">Name</div
						><TextBox id="attribute-name" menu="tag-localization" /></div>
					<div class="flex-item"><div class="text">Key</div><TextBox id="attribute-key" /></div>
					<div class="flex-item" id="attribute-type-box"
						><div class="text">Type</div>
						<RadioBox
							id="attribute-type-boolean"
							name="attribute-type"
							class="standard"
							value="boolean"
							><div class="text" id="attribute-type-boolean-label">Boolean</div></RadioBox
						>
						<RadioBox
							id="attribute-type-number"
							name="attribute-type"
							class="standard"
							value="number"
							><div class="text" id="attribute-type-number-label">Number</div></RadioBox
						>
						<RadioBox
							id="attribute-type-string"
							name="attribute-type"
							class="standard"
							value="string"
							><div class="text" id="attribute-type-string-label">String</div></RadioBox
						>
						<RadioBox
							id="attribute-type-enum"
							name="attribute-type"
							class="standard"
							value="enum"
							><div class="text" id="attribute-type-enum-label">String(Enum)</div></RadioBox
						>
						<RadioBox
							id="attribute-type-object"
							name="attribute-type"
							class="standard"
							value="object"
							><div class="text" id="attribute-type-object-label"
								>Object(For Element)</div
							></RadioBox
						>
					</div>
					<div class="flex-item" id="attribute-enum-box"
						><div class="text">Options</div>
						<CustomBox id="attribute-enum" type="enum-group" /></div>
					<div class="flex-item"><div class="text">Note</div><TextArea id="attribute-note" /></div>
				</div>
			</div>
			<TextBox id="attribute-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
