<template>
	<window-frame id="event" class="opaque">
		<title-bar id="event-title"
			>Event<maximize></maximize>
			<close></close>
		</title-bar>
		<content-frame>
			<field-set id="event-open-fieldset" class="input pad">
				<legend>Event</legend>
				<node-list id="event-open-list" />
			</field-set>
			<field-set id="event-commands-fieldset" class="input pad">
				<legend>Content</legend>
				<box id="event-commands-gutter-background" />
				<command-list id="event-commands" />
				<box id="event-commands-gutter-outer">
					<box id="event-commands-gutter-inner" />
				</box>
			</field-set>
			<select-box id="event-type" />
			<button id="event-confirm" name="confirm">Confirm</button>
			<button id="event-cancel" name="cancel">Cancel</button>
			<button id="event-apply" name="apply">Apply</button>
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
