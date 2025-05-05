#!/usr/bin/env node

const {
	createCommand,
	keypairCommand,
	reviewCommand,
	signCommand,
	verifyCommand,
	randomCommand,
	versionCommand,
	helpCommand
} = require("./modules/commands");

const { command } = require("./modules/args");

switch (command) {
	case "create":
		createCommand();
		break;

	case "keypair":
		keypairCommand();
		break;

	case "review":
		reviewCommand();
		break;

	case "sign":
		signCommand();
		break;

	case "verify":
		verifyCommand();
		break;

	case "random":
		randomCommand();
		break;

	case "version":
		versionCommand();
		break;

	default:
		helpCommand();
		break;
}
