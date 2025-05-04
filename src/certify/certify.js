const fs = require("fs");
const crypto = require("crypto");
const { toUint8Array } = require("../utils/utils");
const {
	paths,
	readObsignoMessage,
	readData,
	formatToPEM
} = require("../module/internal");

function reviewMessage(filePath = paths.obsignoPath) {
	try {
		const message = readObsignoMessage(filePath);
		return message;
	} catch (e) {
		console.log(e);
	}
	return null;
}

function signMessage({ message, privateKey }) {
	const msgBuffer = Buffer.from(message, "utf8");
	let key;
	if (privateKey) {
		key = crypto.createPrivateKey(formatToPEM({ privateKey: privateKey }));
	} else {
		const keypair = readData();
		key = crypto.createPrivateKey(
			formatToPEM({ privateKey: keypair.privateKey })
		);
	}
	const signature = crypto.sign(null, msgBuffer, key);
	return new Uint8Array(signature);
}

function verifyMessage({ message, publicKey, signature }) {
	const signatureBuffer = toUint8Array(signature);
	const msgBuffer = Buffer.from(message, "utf8");
	const key = crypto.createPublicKey(formatToPEM({ publicKey: publicKey }));
	return crypto.verify(null, msgBuffer, key, signatureBuffer);
}

module.exports = { reviewMessage, signMessage, verifyMessage };
