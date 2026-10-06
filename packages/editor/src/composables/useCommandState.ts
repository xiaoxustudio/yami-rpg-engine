import { getCommandStore } from '@app/stores/command';
import type { CommandParseState, CommandTargetShape } from '@app/stores/command';

/**
 * 指令解析态。
 *
 * ⚠️ 真源在 `stores/command.ts` 的 `parse`。
 * 这里保留同名对象，但每个字段都是 store 的**访问器**：命令编辑器有 94 处 `commandState.x`，
 * 换成访问器后一处调用点都不用改，而状态已经进 store（DevTools 可见、可按 pinia 实例隔离）。
 *
 * 用显式访问器而不是 `Object.defineProperty` 桥：字段少、类型能逐字检查，改错会直接编译报错。
 */
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

// 对外类型名保持不变（`commands/command-object.ts:7` 仍在转出这两个名字）
export type { CommandParseState as CommandState, CommandTargetShape };
