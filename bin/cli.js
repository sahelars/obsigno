#!/usr/bin/env node

const fs = require("fs");
const {
	keypair,
	addNewKeypair,
	generateKeypair,
	reviewMessage,
	signMessage,
	verifyMessage,
	encodeBase58
} = require("../index.js");
const { paths } = require("../src/module/internal");
const path = require("path");
const packageJson = require("../package.json");

function parseArgs() {
	const args = process.argv.slice(2);
	const flags = {};
	const nonFlags = [];
	for (let arg of args) {
		if (arg.startsWith("--")) {
			flags[arg.slice(2)] = true;
		} else {
			nonFlags.push(arg);
		}
	}
	return { flags, args: nonFlags };
}

const { flags, args } = parseArgs();
const command = args[0];

const setup = (logs = true) => {
	try {
		const secretKey = args.find((arg, index) => index > 0);
		const success = secretKey ? addNewKeypair(secretKey) : addNewKeypair();
		if (success) {
			if (logs) console.log(`      ${paths.idPath}`);
			if (logs) console.log(`      ${paths.dataPath}`);
			if (logs) console.log(`      ${paths.publicKeyPath}`);
			if (logs) console.log("  ✨ Keypair setup complete!\n");
		} else {
			if (logs) console.log(`      ${paths.idPath}`);
			if (logs) console.log(`      ${paths.dataPath}`);
			if (logs) console.log(`      ${paths.publicKeyPath}`);
			if (logs) console.log("  😎 Keypair already exists.\n");
		}
	} catch (e) {
		if (logs) console.log("\n  🚧 Issue setting up keypair.\n\n", e);
	}
};

switch (command) {
	case "create":
		if (!flags.keypair && !flags.message) {
			console.log(
				"\n  Usage: obsigno create <--keypair|--message> [secret key]\n"
			);
			return;
		}
		if (flags.keypair) {
			console.log("\n  🔑 Setting up keypair...");
			setup();
		}
		if (flags.message) {
			console.log(
				"\n  🔧 Creating an obsigno.txt file in current directory..."
			);
			const fs = require("fs");
			const projectRoot = path.resolve(__dirname, "..");
			const filePath = args.find((arg, index) => index > 0);
			const sourceObsignoPath = filePath
				? filePath
				: path.join(projectRoot, "template.txt");
			const targetObsignoPath = path.join(process.cwd(), "obsigno.txt");
			console.log(`      ${targetObsignoPath}`);
			if (fs.existsSync(targetObsignoPath)) {
				console.log("  😎 obsigno.txt already exists in current directory.\n");
				return;
			}
			fs.writeFileSync(
				targetObsignoPath,
				fs.readFileSync(sourceObsignoPath, "utf8")
			);
			console.log("  ✅ Created obsigno.txt in current directory.\n");
		}
		break;

	case "keypair":
		try {
			const secretKey = args.find((arg, index) => index > 0);
			const keys = secretKey ? keypair(secretKey) : keypair();
			if (flags.public) {
				console.log(`\n  Public key:   ${encodeBase58(keys.publicKey)}\n`);
			} else if (flags.private) {
				console.log(`\n  Private key:  ${encodeBase58(keys.privateKey)}\n`);
			} else if (flags.secret) {
				console.log(`\n  Secret key:   ${encodeBase58(keys.secretKey)}\n`);
			} else {
				console.log(
					"\n  Usage: obsigno keypair <--public|--private|--secret> [secret key]\n"
				);
			}
		} catch (e) {
			console.log(
				"\n  🚧 Issue generating keypair. Make sure secret key is 64 bytes.\n" +
					e.message
			);
		}
		break;

	case "review":
		const filePath = args.find((arg, index) => index > 0);
		const reviewMsg = filePath ? reviewMessage(filePath) : reviewMessage();
		if (reviewMsg) {
			const keys = keypair();
			const pubkeyStart = `\n----- START PUBLIC KEY -----\n`;
			const pubkey = `${encodeBase58(keys.publicKey)}`;
			const pubkeyEnd = `\n----- END PUBLIC KEY -----\n`;
			const messageStart = `\n----- START MESSAGE -----\n`;
			const message = `${reviewMsg}`;
			const messageEnd = `\n----- END MESSAGE -----\n`;
			const reviewMessage = `${pubkeyStart}${pubkey}${pubkeyEnd}${messageStart}${message}${messageEnd}`;
			console.log(reviewMessage);
		} else {
			console.log("\n  ❌ Message not found.\n");
			console.log(
				"\n  🚧 Run 'obsigno create --message' to add obsigno.txt file to your current directory.\n"
			);
		}
		break;

	case "sign":
		try {
			const keys = keypair();
			const filePath = args[1] && args[1].includes(".txt") ? args[1] : null;
			const msg = filePath ? reviewMessage(filePath) : reviewMessage();
			const signature = signMessage({
				message: msg,
				privateKey: keys.privateKey
			});
			if (signature) {
				const pubkeyStart = `\n----- START PUBLIC KEY -----\n`;
				const pubkey = `${encodeBase58(keys.publicKey)}`;
				const pubkeyEnd = `\n----- END PUBLIC KEY -----\n`;
				const messageStart = `\n----- START MESSAGE -----\n`;
				const message = `${msg}`;
				const messageEnd = `\n----- END MESSAGE -----\n`;
				const signatureStart = `\n----- START SIGNATURE -----\n`;
				const signatureBase58 = `${encodeBase58(signature)}`;
				const signatureEnd = `\n----- END SIGNATURE -----\n`;
				const signedMessage = `${pubkeyStart}${pubkey}${pubkeyEnd}${messageStart}${message}${messageEnd}${signatureStart}${signatureBase58}${signatureEnd}`;
				console.log(signedMessage);
				fs.writeFileSync(
					path.join(process.cwd(), "signed.txt"),
					signedMessage.trim()
				);
			} else {
				console.log("\n  ❌ Signing failed.\n");
			}
		} catch (e) {
			console.log(
				"\n  🚧 Signing failure. Run 'obsigno review' to troubleshoot message.\n\n" +
					e.message
			);
		}
		break;

	case "verify":
		try {
			const filePath =
				args[1] && args[1].includes(".txt") ? args[1] : "signed.txt";
			const verified = verifyMessage({ filePath });
			if (verified) {
				console.log("\n  ✅ Signature verified.\n");
			} else {
				console.log("\n  ❌ Unauthorized signature.\n");
			}
		} catch (e) {
			console.log(
				"\n  🚧 Issue verifying signature. Make sure public key and signature are valid.\n" +
					e.message
			);
		}
		break;

	case "random":
		const keys = generateKeypair();
		console.log(
			`\n  Public key:   ${encodeBase58(keys.publicKey)}\n  Private key:  ${encodeBase58(keys.privateKey)}\n  Secret key:   ${encodeBase58(keys.secretKey)}\n`
		);
		break;

	case "version":
		console.log(`  obsigno v${packageJson.version}`);
		break;

	default:
		console.log(
			`\n  Welcome to obsigno v${packageJson.version}\n\n    To get started, run 'obsigno create --keypair'.\n\n    You can also run 'obsigno create --keypair YOUR_SECRET_KEY' to create a new keypair with an existing secret key.\n`
		);
		console.log("  Usage: obsigno <command> [options]");
		console.log("  Commands:");
		console.log(
			"    create <--keypair|--message> [secret key]             - Initial setup"
		);
		console.log(
			"    keypair <--public|--private|--secret> [secret key]    - View keypair"
		);
		console.log(
			"    review [obsigno.txt file path]                        - Review file message"
		);
		console.log(
			"    sign [obsigno.txt file path]                          - Sign message"
		);
		console.log(
			"    verify [obsigno.txt file path]                        - Verify signature"
		);
		console.log(
			"    random                                                - Generate keypair"
		);
		console.log(
			"    version                                               - Show version\n"
		);
		break;
}
