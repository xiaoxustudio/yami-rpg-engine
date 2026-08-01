<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileActor-general-grid') || 'General' }}</detail-summary>
			<detail-grid id="fileActor-general-grid">
				<text>{{ local.getLabel('fileActor-portrait') || 'Portrait' }}</text
			><custom-box
				id="fileActor-portrait"
				type="file"
				filter="image"
			/>
			<text>{{ local.getLabel('fileActor-clip') || 'Clip' }}</text
			><custom-box
				id="fileActor-clip"
				type="clip"
				image="fileActor-portrait"
			/>
			<text>{{ local.getLabel('fileActor-animationId') || 'Animation' }}</text
			><custom-box
				id="fileActor-animationId"
				type="file"
				filter="animation"
			/>
				<text>Idle Motion</text
				><select-box id="fileActor-idleMotion" />
				<text>Move Motion</text
				><select-box id="fileActor-moveMotion" />
				<text>Rotatable</text><select-box id="fileActor-rotatable" />
				<text>Passage Terrain</text
				><select-box id="fileActor-passage" />
				<text>Movement Speed</text
				><number-box
					id="fileActor-speed"
					min="0"
					max="32"
					decimals="4"
					unit="t/s"
				/>
				<text>Collision Shape</text
				><select-box id="fileActor-shape" />
				<text>Collision Size</text
				><number-box
					id="fileActor-size"
					min="0"
					max="16"
					step="0.1"
					decimals="4"
					unit="t"
				/>
				<text>Collision Weight</text
				><number-box
					id="fileActor-weight"
					min="0"
					max="8"
					step="0.1"
					decimals="4"
				/>
				<text>Immovable</text><select-box id="fileActor-immovable" />
				<text>Scale</text
				><number-box
					id="fileActor-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				/>
				<text>Priority</text
				><number-box
					id="fileActor-priority"
					min="-512"
					max="512"
					decimals="4"
				/>
				<text>Inherit</text
				><custom-box
					id="fileActor-inherit"
					type="file"
					filter="actor"
				/>
			</detail-grid>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-sprites') || 'Sprites' }}</detail-summary>
			<param-list
				id="fileActor-sprites"
				class="inspector-list"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-attributes') || 'Attributes' }}</detail-summary>
			<param-list
				id="fileActor-attributes"
				class="inspector-list"
				group="actor"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-skills') || 'Skills' }}</detail-summary>
			<param-list
				id="fileActor-skills"
				class="inspector-list"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-equipments') || 'Equipments' }}</detail-summary>
			<param-list
				id="fileActor-equipments"
				class="inspector-list"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-inventory') || 'Inventory' }}</detail-summary>
			<param-list
				id="fileActor-inventory"
				class="inspector-list"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-events') || 'Events' }}</detail-summary>
			<param-list
				id="fileActor-events"
				class="inspector-list"
				filter="actor"
				flexible
			/>
		</detail-box>
		<detail-box open>
			<detail-summary>{{ local.getLabel('fileActor-scripts') || 'Scripts' }}</detail-summary>
			<param-list
				id="fileActor-scripts"
				class="inspector-list"
				flexible
			/>
		</detail-box>
		<parameter-pane id="fileActor-parameter-pane" />
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
