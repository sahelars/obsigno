const {
	keypair,
	addNewKeypair,
	generateKeypair,
	reviewMessage,
	interpretMessage,
	formatMessage,
	signMessage,
	saveSignedMessage,
	retrieveSignedMessage,
	verifySignedMessage,
	encodeBase58
} = require("../../index.js");
const { paths } = require("../../src/module/internal");
const { flags, args } = require("./args");
const packageJson = require("../../package.json");

const createCommand = () => {
	if (!flags.keypair) {
		console.log("\n  Usage: obsigno create <--keypair> [secret key]\n");
		return;
	}
	console.log("\n  🔑 Setting up keypair...");
	try {
		const secretKey = args.find((arg, index) => index > 0);
		const success = secretKey ? addNewKeypair(secretKey) : addNewKeypair();
		if (success) {
			console.log(`      ${paths.idPath}`);
			console.log(`      ${paths.dataPath}`);
			console.log(`      ${paths.publicKeyPath}`);
			console.log("  ✨ Keypair setup complete!\n");
		} else {
			console.log(`      ${paths.idPath}`);
			console.log(`      ${paths.dataPath}`);
			console.log(`      ${paths.publicKeyPath}`);
			console.log("  😎 Keypair already exists.\n");
		}
	} catch (e) {
		console.log("\n  🚧 Issue setting up keypair.\n" + e.message);
	}
};

const keypairCommand = () => {
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
};

const reviewCommand = () => {
	try {
		const message = reviewMessage();
		if (message) {
			const keys = keypair();
			const formattedMessage = formatMessage({
				publicKey: keys.publicKey,
				message: message
			});
			console.log(formattedMessage);
		} else {
			throw new Error("Message not found.");
		}
	} catch (e) {
		console.log(
			"\n  🚧 Run 'obsigno create --keypair' to generate keypair or run 'obsigno' to troubleshoot.\n" +
				e.message
		);
	}
};

const signCommand = () => {
	try {
		const keys = keypair();
		const data = interpretMessage();
		const signature = signMessage({
			message: data.content,
			privateKey: keys.privateKey
		});
		if (signature) {
			const signedMessage = formatMessage({
				publicKey: keys.publicKey,
				message: data.content,
				signature: signature,
				accessToken: data.variables.accessToken
			});
			console.log(signedMessage);
			saveSignedMessage(signedMessage);
		} else {
			throw new Error("Signing failed.");
		}
	} catch (e) {
		console.log(
			"\n  🚧 Signing failure. Run 'obsigno review' to troubleshoot message.\n\n" +
				e.message
		);
	}
};

const verifyCommand = () => {
	try {
		const data = retrieveSignedMessage();
		const formattedMessage = formatMessage({
			publicKey: data.publicKey,
			message: data.message,
			signature: data.signature,
			accessToken: data.accessToken
		});
		console.log(formattedMessage);
		const verified = verifySignedMessage({
			publicKey: data.publicKey,
			message: data.message,
			signature: data.signature
		});
		if (verified) {
			console.log("\n  ✅ Signature is verified.\n");
		} else {
			console.log("\n  ❌ Signature is unauthorized.\n");
		}
	} catch (e) {
		console.log(
			"\n  🚧 Issue verifying signature. Make sure public key and signature are valid.\n" +
				e.message
		);
	}
};

const randomCommand = () => {
	const keys = generateKeypair();
	console.log(
		`\n  Public key:   ${encodeBase58(keys.publicKey)}\n  Private key:  ${encodeBase58(keys.privateKey)}\n  Secret key:   ${encodeBase58(keys.secretKey)}\n`
	);
};

const versionCommand = () => {
	console.log(`  obsigno v${packageJson.version}`);
};

const helpCommand = () => {
	console.log(
		`\n  Welcome to obsigno v${packageJson.version}\n\n    To get started, run 'obsigno create --keypair'.\n\n    You can also run 'obsigno create --keypair YOUR_SECRET_KEY' to create a new keypair with an existing secret key.\n`
	);
	console.log("  Usage: obsigno <command> [options]");
	console.log("  Commands:");
	console.log(
		"    create <--keypair> [secret key]                       - Initial setup"
	);
	console.log(
		"    keypair <--public|--private|--secret> [secret key]    - View keypair"
	);
	console.log(
		"    review                                                - Review file message"
	);
	console.log(
		"    sign                                                  - Sign message"
	);
	console.log(
		"    verify                                                - Verify signature"
	);
	console.log(
		"    random                                                - Generate keypair"
	);
	console.log(
		"    version                                               - Show version\n"
	);
};

module.exports = {
	createCommand,
	keypairCommand,
	reviewCommand,
	signCommand,
	verifyCommand,
	randomCommand,
	versionCommand,
	helpCommand
};
