const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const { toUint8Array } = require("../utils/utils");

const homeDir = os.homedir();
const keyDir = path.join(homeDir, ".obsigno");
if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir, { recursive: true });
const privateKeyPath = path.join(keyDir, "ed25519-priv.pem");
const obsignoPath = path.join(process.cwd(), "obsigno.js");

const encodeKey = ({ publicKey, privateKey }) => {
	if (!publicKey && !privateKey) {
		console.log("Requires either publicKey or privateKey");
		return;
	}
	const key = privateKey ? toUint8Array(privateKey) : toUint8Array(publicKey);
	const identifier = Buffer.from(
		privateKey
			? "302e020100300506032b657004220420"
			: "302a300506032b6570032100",
		"hex"
	);
	const keyBuffer = Buffer.concat([identifier, key]);
	const type = privateKey ? "PRIVATE" : "PUBLIC";
	const pemKey =
		`-----BEGIN ${type} KEY-----\n` +
		keyBuffer.toString("base64") +
		`\n-----END ${type} KEY-----`;
	return pemKey;
};

function reviewMessage() {
	if (fs.existsSync(obsignoPath)) {
		try {
			const { obsignoMessage } = require(obsignoPath);
			return obsignoMessage;
		} catch (e) {
			console.log(e);
		}
	}
	return null;
}

function signMessage({ message, privateKey }) {
	const msgBuffer = Buffer.from(message, "utf8");
	let key;
	if (privateKey) {
		key = crypto.createPrivateKey(encodeKey({ privateKey: privateKey }));
	} else {
		key = crypto.createPrivateKey(fs.readFileSync(privateKeyPath, "utf8"));
	}
	const signature = crypto.sign(null, msgBuffer, key);
	return new Uint8Array(signature);
}

function verifyMessage({ message, publicKey, signature }) {
	const signatureBuffer = toUint8Array(signature);
	const msgBuffer = Buffer.from(message, "utf8");
	const key = crypto.createPublicKey(encodeKey({ publicKey: publicKey }));
	return crypto.verify(null, msgBuffer, key, signatureBuffer);
}

module.exports = { reviewMessage, signMessage, verifyMessage };
