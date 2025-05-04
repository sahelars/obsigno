const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
const path = require("path");

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

const resolvePath = (filePath) => {
	if (!filePath.includes("/")) {
		return path.join(process.cwd(), filePath);
	}
	return filePath;
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

const BASE58_ALPHABET =
	"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const toUint8Array = (input) => {
	if (input instanceof Uint8Array) {
		return input;
	} else if (Buffer.isBuffer(input)) {
		return new Uint8Array(input);
	} else if (typeof input === "string") {
		return decodeBase58(input);
	} else {
		console.log("Invalid input");
		return null;
	}
};

const encodeBase58 = (input) => {
	if (!(input instanceof Uint8Array) && !Buffer.isBuffer(input)) {
		console.log("Input must be a Uint8Array or Buffer");
		return null;
	}
	let digits = [0];
	for (let i = 0; i < input.length; ++i) {
		let carry = input[i];
		for (let j = 0; j < digits.length; ++j) {
			carry += digits[j] << 8;
			digits[j] = carry % 58;
			carry = (carry / 58) | 0;
		}
		while (carry > 0) {
			digits.push(carry % 58);
			carry = (carry / 58) | 0;
		}
	}
	for (let k = 0; k < input.length && input[k] === 0; ++k) {
		digits.push(0);
	}
	return digits
		.reverse()
		.map((d) => BASE58_ALPHABET[d])
		.join("");
};

const decodeBase58 = (input) => {
	const BASE58_MAP = {};
	for (let i = 0; i < BASE58_ALPHABET.length; i++) {
		BASE58_MAP[BASE58_ALPHABET[i]] = i;
	}
	if (typeof input !== "string") {
		console.log("Input must be a Base58-encoded string");
		return null;
	}
	let bytes = [0];
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		const value = BASE58_MAP[char];
		if (value === undefined) {
			console.log(`Invalid Base58 character '${char}'`);
			return null;
		}

		let carry = value;
		for (let j = 0; j < bytes.length; j++) {
			carry += bytes[j] * 58;
			bytes[j] = carry & 0xff;
			carry >>= 8;
		}

		while (carry > 0) {
			bytes.push(carry & 0xff);
			carry >>= 8;
		}
	}
	for (let k = 0; k < input.length && input[k] === "1"; k++) {
		bytes.push(0);
	}
	return new Uint8Array(bytes.reverse());
};

module.exports = {
	paths,
	resolvePath,
	initializeData,
	readPublicKey,
	readData,
	writeData,
	formatToPEM,
	toUint8Array,
	encodeBase58,
	decodeBase58
};
