#!/usr/bin/env node

const {
	keypair,
	createKeypair,
	reviewMessage,
	signMessage,
	verifyMessage,
	importPath,
	formatBase58
} = require("../index.js");
const path = require("path");
const packageJson = require("../package.json");

const obsignoPath = path.join(process.cwd(), "obsigno.js");

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
		const success = args[1] ? createKeypair(args[1]) : createKeypair();
		if (success) {
			if (logs) console.log("  ✨ Keypair setup complete!\n");
		} else {
			if (logs) console.log("  😎 Keypair already exists.\n");
		}
	} catch (e) {
		if (logs) console.log("\n  🚧 Issue setting up keypair.\n\n", e);
	}
};

switch (command) {
	case "setup":
		console.log("\n  🔑 Setting up keypair...");
		setup();
		break;

	case "keypair":
		try {
			const secretKey = args.find((arg, index) => index > 0);
			const keys = secretKey ? keypair(secretKey) : keypair();
			if (flags.public) {
				console.log(`\n  Public key:   ${formatBase58(keys.publicKey)}\n`);
			} else if (flags.private) {
				console.log(`\n  Private key:  ${formatBase58(keys.privateKey)}\n`);
			} else if (flags.secret) {
				console.log(`\n  Secret key:   ${formatBase58(keys.secretKey)}\n`);
			} else {
				console.log(
					"\n  Usage: obsigno keypair <--public|--private|--secret> [secret key]\n"
				);
			}
		} catch (e) {
			console.log(
				"\n  🚧 Issue generating keypair. Make sure secret key is 64 bytes.\n"
			);
		}
		break;

	case "create":
		console.log("\n  🔧 Creating up obsigno.js file in current directory...");
		setup(false);
		const fs = require("fs");
		const projectRoot = path.resolve(__dirname, "..");
		const sourceObsignoPath = path.join(projectRoot, "template.js");
		const targetObsignoPath = path.join(process.cwd(), "obsigno.js");
		if (fs.existsSync(targetObsignoPath)) {
			console.log("  😎 obsigno.js already exists in current directory.\n");
			return;
		}
		fs.writeFileSync(
			targetObsignoPath,
			fs.readFileSync(sourceObsignoPath, "utf8")
		);
		console.log("  ✅ Created obsigno.js in current directory.\n");
		break;

	case "review":
		const reviewMsg = reviewMessage();
		if (reviewMsg) {
			console.log(reviewMsg);
		} else {
			console.log("\n  ❌ Review message not found.\n");
			console.log(
				"\n  🚧 Run 'obsigno create' to add obsigno.js file to your current directory.\n"
			);
		}
		break;

	case "sign":
		try {
			const keys = keypair();
			let message;
			if (args[1]) {
				message = args[1];
			} else {
				try {
					const { obsignoCertify } = require(obsignoPath);
					message = obsignoCertify;
				} catch (e) {
					console.log(
						"\n  🚧 obsigno.js not found. Run 'obsigno create' to create it.\n"
					);
					return;
				}
			}
			const signature = signMessage({
				message,
				privateKey: keys.privateKey
			});
			if (signature) {
				if (args[1]) {
					console.log(`\n  Message:    ${message}`);
					console.log(`  Signature:  ${formatBase58(signature)}\n`);
				} else {
					console.log(
						`\n  ----------------------------------------------------------------------------  ${message}\n  Signature:    ${formatBase58(signature)}\n  ----------------------------------------------------------------------------\n`
					);
				}
			} else {
				console.log("\n  ❌ Signing failed.\n");
			}
		} catch (e) {
			console.log(
				"\n  🚧 Signing failure. Run 'obsigno' to troubleshoot.\n\n" + e
			);
		}
		break;

	case "verify":
		try {
			const message = args[1];
			const publicKey = args[2];
			const signature = args[3];
			const verified = verifyMessage({ message, publicKey, signature });
			if (verified) {
				console.log("\n  ✅ Signature verified.\n");
			} else {
				console.log("\n  ❌ Unauthorized signature.\n");
			}
		} catch (e) {
			console.log(
				"\n  🚧 Issue verifying signature. Make sure public key and signature are valid.\n"
			);
		}
		break;

	case "path":
		console.log(
			`\n  📌 Copy and paste this path into your 'require()' statement:\n`
		);
		console.log(`${importPath()}\n`);
		break;

	case "version":
		console.log(`  obsigno v${packageJson.version}`);
		break;

	default:
		console.log(
			`\n  Welcome to obsigno v${packageJson.version}\n\n    To get started, run 'obsigno setup'.\n\n    You can also run 'obsigno setup YOUR_SECRET_KEY' to create a new keypair with an existing secret key.\n`
		);
		console.log("  Usage: obsigno <command> [options]");
		console.log("  Commands:");
		console.log(
			"    setup [secret key]                                    - Setup new keypair"
		);
		console.log(
			"    keypair <--public|--private|--secret> [secret key]    - View keypair"
		);
		console.log(
			"    create                                                - Create obsigno.js"
		);
		console.log(
			"    review                                                - Review file message"
		);
		console.log(
			"    sign [message]                                        - Sign message"
		);
		console.log(
			"    verify <message> <public key> <signature>             - Verify signature"
		);
		console.log(
			"    path                                                  - Local import path"
		);
		console.log(
			"    version                                               - Show version\n"
		);
		break;
}
