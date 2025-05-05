const fs = require("fs");
const crypto = require("crypto");
const { toUint8Array, interpretMessage } = require("../utils/utils");
const {
	paths,
	resolvePath,
	readData,
	formatToPEM
} = require("../module/internal");

function reviewMessage(filePath = paths.templatePath) {
	try {
		const message = interpretMessage(filePath);
		return message.content;
	} catch (e) {
		console.log(e.message);
		return null;
	}
}

function retrieveSignedMessage(filePath = "signed.txt") {
	try {
		let currentFilePath = resolvePath(filePath);
		const fileContent = fs.readFileSync(currentFilePath, "utf8");

		const messageStart = "----- START MESSAGE -----\n";
		const messageEnd = "\n----- END MESSAGE -----";
		const messageRegex = new RegExp(`${messageStart}(.*?)${messageEnd}`, "s");
		const messageMatch = fileContent.match(messageRegex);
		const message = messageMatch ? messageMatch[1] : null;

		const signatureStart = "----- START SIGNATURE -----\n";
		const signatureEnd = "\n----- END SIGNATURE -----";
		const signatureRegex = new RegExp(
			`${signatureStart}(.*?)${signatureEnd}`,
			"s"
		);
		const signatureMatch = fileContent.match(signatureRegex);
		const signature = signatureMatch ? signatureMatch[1] : null;

		const publicKeyStart = "----- START PUBLIC KEY -----\n";
		const publicKeyEnd = "\n----- END PUBLIC KEY -----";
		const publicKeyRegex = new RegExp(
			`${publicKeyStart}(.*?)${publicKeyEnd}`,
			"s"
		);
		const publicKeyMatch = fileContent.match(publicKeyRegex);
		const publicKey = publicKeyMatch ? publicKeyMatch[1] : null;

		const accessTokenStart = "----- START ACCESS TOKEN -----\n";
		const accessTokenEnd = "\n----- END ACCESS TOKEN -----";
		const accessTokenRegex = new RegExp(
			`${accessTokenStart}(.*?)${accessTokenEnd}`,
			"s"
		);
		const accessTokenMatch = fileContent.match(accessTokenRegex);
		const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

		if (accessToken) {
			return {
				publicKey,
				message,
				signature,
				accessToken
			};
		}

		return {
			publicKey,
			message,
			signature
		};
	} catch (e) {
		console.log(e.message);
		return null;
	}
}

function signMessage({ message, privateKey }) {
	try {
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
	} catch (e) {
		console.log(e.message);
		return null;
	}
}

function verifySignedMessage({ publicKey, message, signature }) {
	try {
		const signatureBuffer = toUint8Array(signature);
		const msgBuffer = Buffer.from(message, "utf8");
		const key = crypto.createPublicKey(
			formatToPEM({ publicKey: publicKey })
		);
		return crypto.verify(null, msgBuffer, key, signatureBuffer);
	} catch (e) {
		console.log(e.message);
		return null;
	}
}

module.exports = {
	reviewMessage,
	retrieveSignedMessage,
	signMessage,
	verifySignedMessage
};
