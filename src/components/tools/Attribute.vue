<template>
	<window-frame id="attribute">
		<title-bar>Attribute<close /></title-bar>
		<content-frame>
			<field-set id="attribute-list-fieldset" class="input pad">
				<legend>List</legend>
				<node-list id="attribute-list" padded />
			</field-set>
			<field-set id="attribute-properties-fieldset">
				<legend>Properties</legend>
				<flex-box id="attribute-properties-flex">
					<flex-item
						><text>Name</text
						><text-box id="attribute-name" menu="tag-localization" /></flex-item
					>
					<flex-item><text>Key</text><text-box id="attribute-key" /></flex-item>
					<flex-item id="attribute-type-box"
						><text>Type</text>
						<radio-box
							id="attribute-type-boolean"
							name="attribute-type"
							class="standard"
							value="boolean"
							><text id="attribute-type-boolean-label">Boolean</text></radio-box
						>
						<radio-box
							id="attribute-type-number"
							name="attribute-type"
							class="standard"
							value="number"
							><text id="attribute-type-number-label">Number</text></radio-box
						>
						<radio-box
							id="attribute-type-string"
							name="attribute-type"
							class="standard"
							value="string"
							><text id="attribute-type-string-label">String</text></radio-box
						>
						<radio-box
							id="attribute-type-enum"
							name="attribute-type"
							class="standard"
							value="enum"
							><text id="attribute-type-enum-label">String(Enum)</text></radio-box
						>
						<radio-box
							id="attribute-type-object"
							name="attribute-type"
							class="standard"
							value="object"
							><text id="attribute-type-object-label"
								>Object(For Element)</text
							></radio-box
						>
					</flex-item>
					<flex-item id="attribute-enum-box"
						><text>Options</text>
						<custom-box id="attribute-enum" type="enum-group" /></flex-item
					>
					<flex-item><text>Note</text><text-area id="attribute-note" /></flex-item>
				</flex-box>
			</field-set>
			<text-box id="attribute-searcher" name="search" />
			<button id="attribute-confirm" name="confirm">Confirm</button>
			<button id="attribute-cancel" name="cancel">Cancel</button>
			<button id="attribute-apply" name="apply">Apply</button>
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
