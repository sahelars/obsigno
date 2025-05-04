const fs = require("fs");
const crypto = require("crypto");
const { toUint8Array } = require("../utils/utils");
const {
	paths,
	initializeData,
	readData,
	writeData
} = require("../module/internal");

function keypair(secretKey) {
	if (secretKey) {
		const secretKeyBytes = toUint8Array(secretKey);
		const privateKey = secretKeyBytes.subarray(0, 32);
		const publicKey = secretKeyBytes.subarray(32, 64);
		return {
			publicKey,
			privateKey,
			secretKey: secretKeyBytes
		};
	} else {
		const keypair = readData();
		return {
			publicKey: keypair.publicKey,
			privateKey: keypair.privateKey,
			secretKey: keypair.secretKey
		};
	}
}

function addNewKeypair(secretKey) {
	if (fs.existsSync(paths.idPath) && fs.existsSync(paths.dataPath)) {
		return false;
	} else if (secretKey) {
		const secretKeyBytes = toUint8Array(secretKey);
		const writeDataResult = writeData(secretKeyBytes);
		if (!writeDataResult) {
			return false;
		}
	} else {
		initializeData();
	}
	console.log(`      ${paths.idPath}`);
	console.log(`      ${paths.dataPath}`);
	console.log(`      ${paths.publicKeyPath}`);
	return true;
}

function generateKeypair() {
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

module.exports = { keypair, addNewKeypair, generateKeypair };
