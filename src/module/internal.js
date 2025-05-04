const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const path = require("path");
const { toUint8Array, encodeBase58 } = require("../utils/utils");
const { readAndInterpretFile } = require("./engine");

const homeDir = os.homedir();
const configDir = path.join(homeDir, "/.config/obsigno");
const dataDir = path.join(homeDir, "/.local/share/obsigno");
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const idPath = path.join(configDir, "id.bin");
const dataPath = path.join(dataDir, "data.bin");
const publicKeyPath = path.join(dataDir, "public.key");
const obsignoPath = path.join(process.cwd(), "obsigno.txt");
const paths = {
	idPath,
	dataPath,
	publicKeyPath,
	obsignoPath
};

const id = () => {
	if (!fs.existsSync(idPath)) {
		const bytes = crypto.randomBytes(32);
		fs.writeFileSync(idPath, bytes);
	}
	const value = fs.readFileSync(idPath);
	return value;
};

const encryptData = (data) => {
	const key = id();
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(Buffer.from(data)),
		cipher.final()
	]);
	const authTag = cipher.getAuthTag();
	return Buffer.concat([iv, authTag, encrypted]);
};

const decryptData = (data) => {
	const key = id();
	const iv = data.subarray(0, 16);
	const authTag = data.subarray(16, 32);
	const encryptedData = data.subarray(32);
	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);
	const decrypted = Buffer.concat([
		decipher.update(encryptedData),
		decipher.final()
	]);
	return new Uint8Array(decrypted);
};

const initializeData = () => {
	const keypair = generateRandomKeypair();
	fs.writeFileSync(dataPath, encryptData(keypair.secretKey));
	fs.writeFileSync(publicKeyPath, encodeBase58(keypair.publicKey));
};

const readPublicKey = () => {
	if (!fs.existsSync(publicKeyPath)) {
		return null;
	}
	const publicKey = fs.readFileSync(publicKeyPath, "utf8").trim();
	return publicKey;
};

const readObsignoMessage = (filePath) => {
	let formattedPath = filePath;
	if (!filePath.includes("/")) {
		formattedPath = path.join(process.cwd(), filePath);
	}
	if (!fs.existsSync(obsignoPath) && !fs.existsSync(formattedPath)) {
		return null;
	}
	const interpretedMessage = readAndInterpretFile(
		fs.existsSync(formattedPath) ? formattedPath : obsignoPath,
		publicKeyPath
	);
	return interpretedMessage.content;
};

const readData = () => {
	if (!fs.existsSync(dataPath)) {
		return {
			publicKey: null,
			privateKey: null,
			secretKey: null
		};
	}
	const encryptedData = fs.readFileSync(dataPath);
	const secretKey = decryptData(encryptedData);
	const privateKey = secretKey.subarray(0, 32);
	const publicKey = secretKey.subarray(32, 64);
	return {
		publicKey,
		privateKey,
		secretKey
	};
};

const writeData = (secretKey) => {
	if (!(secretKey instanceof Uint8Array)) {
		return false;
	}
	const secretKeyBytes = toUint8Array(secretKey);
	const keypair = {};
	keypair.privateKey = secretKeyBytes.subarray(0, 32);
	keypair.publicKey = secretKeyBytes.subarray(32, 64);
	keypair.secretKey = new Uint8Array(
		Buffer.concat([
			Buffer.from(keypair.privateKey),
			Buffer.from(keypair.publicKey)
		])
	);
	fs.writeFileSync(dataPath, encryptData(keypair.secretKey));
	fs.writeFileSync(publicKeyPath, encodeBase58(keypair.publicKey));
	return true;
};

const formatToPEM = ({ publicKey, privateKey }) => {
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

module.exports = {
	paths,
	initializeData,
	readPublicKey,
	readObsignoMessage,
	readData,
	writeData,
	formatToPEM
};
