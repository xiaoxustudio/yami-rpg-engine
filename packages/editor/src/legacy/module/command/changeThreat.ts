import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

type ActorRef = {
	type: string;
	[k: string]: unknown;
};

type ChangeThreatData = {
	actor: ActorRef;
	target: ActorRef;
	operation: string;
	threat: number | ActorRef;
};

Command.cases.changeThreat = new CommandSchema({
	name: 'changeThreat',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'target', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase' },
		{ key: 'threat', default: 0 }
	],
	parseActors(actor: ActorRef, target: ActorRef) {
		const sActor = Command.parseActor!(actor);
		const dActor = Command.parseActor!(target);
		return sActor + Token(' -> ') + dActor;
	},
	parseOperation(operation: string) {
		return Local.get!('command.changeThreat.' + operation);
	},
	customParse({ actor, target, operation, threat }: ChangeThreatData) {
		const words = Command.words
			.push(this.parseActors!(actor, target))
			.push(this.parseOperation!(operation))
			.push(Command.parseVariableNumber!(threat));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changeThreat') + Token(': ') },
			{ text: words.join() }
		];
	}
});
