import { getCommandStore } from '@app/stores/command';
import type { CommandParseState, CommandTargetShape } from '@app/stores/command';

export const commandState: CommandParseState = {
	get target() {
		return getCommandStore().parse.target;
	},
	set target(value: CommandTargetShape | null) {
		getCommandStore().parse.target = value;
	},
	get id() {
		return getCommandStore().parse.id;
	},
	set id(value: string | null) {
		getCommandStore().parse.id = value;
	},
	get words() {
		return getCommandStore().parse.words;
	},
	set words(value: CommandParseState['words']) {
		getCommandStore().parse.words = value;
	},
	get invalid() {
		return getCommandStore().parse.invalid;
	},
	set invalid(value: boolean) {
		getCommandStore().parse.invalid = value;
	},
	get saveVars() {
		return getCommandStore().parse.saveVars;
	},
	set saveVars(value: boolean) {
		getCommandStore().parse.saveVars = value;
	},
	get returnType() {
		return getCommandStore().parse.returnType;
	},
	set returnType(value: string) {
		getCommandStore().parse.returnType = value;
	},
	get eventName() {
		return getCommandStore().parse.eventName;
	},
	set eventName(value: string) {
		getCommandStore().parse.eventName = value;
	},
	get eventIndex() {
		return getCommandStore().parse.eventIndex;
	},
	set eventIndex(value: number) {
		getCommandStore().parse.eventIndex = value;
	},
	get variables() {
		return getCommandStore().parse.variables;
	},
	set variables(value: CommandParseState['variables']) {
		getCommandStore().parse.variables = value;
	},
	get varMap() {
		return getCommandStore().parse.varMap;
	},
	set varMap(value: Record<string, unknown>) {
		getCommandStore().parse.varMap = value;
	},
	get dependsOn() {
		return getCommandStore().parse.dependsOn;
	},
	set dependsOn(value: string[]) {
		getCommandStore().parse.dependsOn = value;
	},
	get currentCommand() {
		return getCommandStore().parse.currentCommand;
	},
	set currentCommand(value: Record<string, unknown> | null) {
		getCommandStore().parse.currentCommand = value;
	}
};

export type { CommandParseState as CommandState, CommandTargetShape };
