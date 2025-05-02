const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const { toUint8Array, encodeBase58 } = require("../utils/utils");

const homeDir = os.homedir();
const keyDir = path.join(homeDir, ".obsigno");
if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir, { recursive: true });

const publicKeyPath = path.join(keyDir, "ed25519-pub.pem");
const privateKeyPath = path.join(keyDir, "ed25519-priv.pem");
const pubBase58Path = path.join(keyDir, "ed25519-pub.base58");

function keypair(secretKey) {
	if (secretKey) {
		const secretKeyBuffer = toUint8Array(secretKey);
		const privateKey = secretKeyBuffer.subarray(0, 32);
		const publicKey = secretKeyBuffer.subarray(32, 64);
		return {
			publicKey,
			privateKey
		};
	} else {
		const privateKeyFile = crypto.createPrivateKey(
			fs.readFileSync(privateKeyPath, "utf8")
		);
		const publicKeyFile = crypto.createPublicKey(
			fs.readFileSync(publicKeyPath, "utf8")
		);
		const privateKeyDer = privateKeyFile.export({
			format: "der",
			type: "pkcs8"
		});
		const publicKeyDer = publicKeyFile.export({
			format: "der",
			type: "spki"
		});
		const privateKey = new Uint8Array(privateKeyDer.subarray(-32));
		const publicKey = new Uint8Array(publicKeyDer.subarray(-32));
		const secretKey = new Uint8Array(
			Buffer.concat([Buffer.from(privateKey), Buffer.from(publicKey)])
		);
		return {
			publicKey,
			privateKey,
			secretKey
		};
	}
}

function createKeypair(secretKey) {
	if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
		console.log(`      ${publicKeyPath}`);
		console.log(`      ${privateKeyPath}`);
		return false;
	} else if (secretKey && !secretKey.includes(".json")) {
		const secretKeyBuffer = toUint8Array(secretKey);
		const privateKeyBytes = secretKeyBuffer.subarray(0, 32);
		const publicKeyBytes = secretKeyBuffer.subarray(32, 64);
		const privateKeyDer = crypto.createPrivateKey({
			key: Buffer.concat([
				Buffer.from("302e020100300506032b657004220420", "hex"),
				privateKeyBytes
			]),
			format: "der",
			type: "pkcs8"
		});
		const publicKeyDer = crypto.createPublicKey({
			key: Buffer.concat([
				Buffer.from("302a300506032b6570032100", "hex"),
				publicKeyBytes
			]),
			format: "der",
			type: "spki"
		});
		fs.writeFileSync(
			privateKeyPath,
			privateKeyDer.export({ format: "pem", type: "pkcs8" })
		);
		fs.writeFileSync(
			publicKeyPath,
			publicKeyDer.export({ format: "pem", type: "spki" })
		);
		const publicKeyDerFormat = publicKeyDer.export({
			format: "der",
			type: "spki"
		});
		const publicKeyFormat = new Uint8Array(publicKeyDerFormat.subarray(-32));
		fs.writeFileSync(pubBase58Path, encodeBase58(publicKeyFormat));
	} else if (secretKey && secretKey.includes(".json")) {
		if (!fs.existsSync(secretKey)) {
			console.log(`${secretKey} does not exist`);
			return false;
		}
		const keypairPath = path.join(process.cwd(), `${secretKey}`);
		const keypairArray = JSON.parse(fs.readFileSync(keypairPath, "utf8"));
		const keypairData = Buffer.from(keypairArray);
		const privateKeyBytes = keypairData.subarray(0, 32);
		const publicKeyBytes = keypairData.subarray(32, 64);
		const privateKey = crypto.createPrivateKey({
			key: Buffer.concat([
				Buffer.from("302e020100300506032b657004220420", "hex"),
				privateKeyBytes
			]),
			format: "der",
			type: "pkcs8"
		});
		const publicKey = crypto.createPublicKey({
			key: Buffer.concat([
				Buffer.from("302a300506032b6570032100", "hex"),
				publicKeyBytes
			]),
			format: "der",
			type: "spki"
		});
		fs.writeFileSync(
			privateKeyPath,
			privateKey.export({ format: "pem", type: "pkcs8" })
		);
		fs.writeFileSync(
			publicKeyPath,
			publicKey.export({ format: "pem", type: "spki" })
		);
		const publicKeyDer = publicKey.export({
			format: "der",
			type: "spki"
		});
		const publicKeyFormat = new Uint8Array(publicKeyDer.subarray(-32));
		fs.writeFileSync(pubBase58Path, encodeBase58(publicKeyFormat));
	} else {
		const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
		fs.writeFileSync(
			privateKeyPath,
			privateKey.export({ format: "pem", type: "pkcs8" })
		);
		fs.writeFileSync(
			publicKeyPath,
			publicKey.export({ format: "pem", type: "spki" })
		);
		const publicKeyDer = publicKey.export({
			format: "der",
			type: "spki"
		});
		const publicKeyFormat = new Uint8Array(publicKeyDer.subarray(-32));
		fs.writeFileSync(pubBase58Path, encodeBase58(publicKeyFormat));
	}
	console.log(`      ${publicKeyPath}`);
	console.log(`      ${privateKeyPath}`);
	return true;
}

function generateRandomKeypair() {
	const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
	const privateKeyDer = privateKey.export({
		format: "der",
		type: "pkcs8"
	});
	const publicKeyDer = publicKey.export({
		format: "der",
		type: "spki"
	});
	const publicKeyFormat = new Uint8Array(publicKeyDer.subarray(-32));
	const privateKeyFormat = new Uint8Array(privateKeyDer.subarray(-32));
	const secretKeyFormat = new Uint8Array(
		Buffer.concat([Buffer.from(privateKeyFormat), Buffer.from(publicKeyFormat)])
	);
	return {
		publicKey: publicKeyFormat,
		privateKey: privateKeyFormat,
		secretKey: secretKeyFormat
	};
}

module.exports = { keypair, createKeypair, generateRandomKeypair };
