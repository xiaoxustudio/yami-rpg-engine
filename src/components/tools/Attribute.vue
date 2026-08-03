<template>
	<WindowFrame id="attribute">
		<TitleBar>Attribute<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="field-set input pad" id="attribute-list-fieldset">
				<div class="legend">List</div>
				<TreeList id="attribute-list" padded />
			</div>
			<div class="field-set" id="attribute-properties-fieldset">
				<div class="legend">Properties</div>
				<div class="flex-box" id="attribute-properties-flex">
					<div class="flex-item"
						><text>Name</text
						><TextBox id="attribute-name" menu="tag-localization" /></div>
					<div class="flex-item"><text>Key</text><TextBox id="attribute-key" /></div>
					<div class="flex-item" id="attribute-type-box"
						><text>Type</text>
						<RadioBox
							id="attribute-type-boolean"
							name="attribute-type"
							class="standard"
							value="boolean"
							><text id="attribute-type-boolean-label">Boolean</text></RadioBox
						>
						<RadioBox
							id="attribute-type-number"
							name="attribute-type"
							class="standard"
							value="number"
							><text id="attribute-type-number-label">Number</text></RadioBox
						>
						<RadioBox
							id="attribute-type-string"
							name="attribute-type"
							class="standard"
							value="string"
							><text id="attribute-type-string-label">String</text></RadioBox
						>
						<RadioBox
							id="attribute-type-enum"
							name="attribute-type"
							class="standard"
							value="enum"
							><text id="attribute-type-enum-label">String(Enum)</text></RadioBox
						>
						<RadioBox
							id="attribute-type-object"
							name="attribute-type"
							class="standard"
							value="object"
							><text id="attribute-type-object-label"
								>Object(For Element)</text
							></RadioBox
						>
					</div>
					<div class="flex-item" id="attribute-enum-box"
						><text>Options</text>
						<CustomBox id="attribute-enum" type="enum-group" /></div>
					<div class="flex-item"><text>Note</text><TextArea id="attribute-note" /></div>
				</div>
			</div>
			<TextBox id="attribute-searcher" name="search" />
			<button id="attribute-confirm" name="confirm">Confirm</button>
			<button id="attribute-cancel" name="cancel">Cancel</button>
			<button id="attribute-apply" name="apply">Apply</button>
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
