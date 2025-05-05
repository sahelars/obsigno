const fs = require("fs");
const {
	paths,
	resolvePath,
	toUint8Array,
	encodeBase58,
	decodeBase58,
	readPublicKey
} = require("../module/internal");

const interpretMessage = (filePath = paths.storedMessagePath) => {
	try {
		let formattedPath = resolvePath(filePath);
		if (!fs.existsSync(formattedPath)) {
			return null;
		}
		const content = fs.readFileSync(formattedPath, "utf8");
		let publicKey = "";
		try {
			publicKey = readPublicKey();
		} catch (err) {
			publicKey = "PUBLIC_KEY_NOT_FOUND";
		}
		const timestamp = Date.now();
		const currentDate = new Date(timestamp).toISOString();
		let hours = 0;
		let minutes = 5;
		let seconds = 33;
		const expiresMatch = content.match(
			/\$EXPIRES_IN_([0-9]+H)?([0-9]+M)?([0-9]+S)?/
		);
		if (expiresMatch) {
			if (expiresMatch[1]) {
				hours = parseInt(expiresMatch[1].replace("H", ""), 10);
			}
			if (expiresMatch[2]) {
				minutes = parseInt(expiresMatch[2].replace("M", ""), 10);
			}
			if (expiresMatch[3]) {
				seconds = parseInt(expiresMatch[3].replace("S", ""), 10);
			}
		}
		const expiresInValue = `${hours}H${minutes}M${seconds}S`;
		const expirationMs =
			hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
		const expirationDate = new Date(timestamp + expirationMs).toISOString();
		const accessToken = content.includes("$ACCESS_TOKEN")
			? `?public_key=${publicKey}&signed_at=${timestamp}&expires_at=${timestamp + expirationMs}`
			: null;
		let interpretedContent = content
			.replace(/\$PUBLIC_KEY/g, publicKey)
			.replace(/\$CURRENT_DATE/g, currentDate)
			.replace(/\$EXPIRES_IN_([0-9]+H)?([0-9]+M)?([0-9]+S)?/g, expirationDate)
			.replace(/\$ACCESS_TOKEN/g, "")
			.trim();

		return {
			content: interpretedContent,
			variables: {
				publicKey,
				currentDate,
				expirationDate,
				accessToken,
				expiresInValue,
				expirationComponents: {
					hours,
					minutes,
					seconds
				}
			},
			template: content
		};
	} catch (e) {
		console.error(`Error reading or interpreting file: ${e.message}`);
		throw e;
	}
};

const formatMessage = ({ publicKey, message, signature, accessToken }) => {
	const formattedAccessToken =
		accessToken && accessToken.startsWith("?")
			? `${encodeBase58(signature)}${accessToken}`
			: accessToken;
	const pubkeyStart = `\n----- START PUBLIC KEY -----\n`;
	const pubkey = `${encodeBase58(publicKey)}`;
	const pubkeyEnd = `\n----- END PUBLIC KEY -----\n`;
	const messageStart = `\n----- START MESSAGE -----\n`;
	const messageEnd = `\n----- END MESSAGE -----\n`;
	const signatureStart = `\n----- START SIGNATURE -----\n`;
	const signatureBase58 = signature ? `${encodeBase58(signature)}` : "";
	const signatureEnd = `\n----- END SIGNATURE -----\n`;
	const accessTokenStart = `\n----- START ACCESS TOKEN -----\n`;
	const accessTokenExtended = formattedAccessToken;
	const accessTokenEncoded = accessToken
		? encodeBase58(new TextEncoder().encode(accessTokenExtended))
		: "";
	const accessTokenEnd = `\n----- END ACCESS TOKEN -----\n`;
	const signedMessage = `${pubkeyStart}${pubkey}${pubkeyEnd}${messageStart}${message}${messageEnd}${signature ? `${signatureStart}${signatureBase58}${signatureEnd}` : ""}${accessToken ? `${accessTokenStart}${accessTokenEncoded}${accessTokenEnd}` : ""}`;
	return signedMessage;
};

const saveSignedMessage = (signedMessage) => {
	fs.writeFileSync(paths.signedMessagePath, signedMessage.trim());
};

module.exports = {
	toUint8Array,
	encodeBase58,
	decodeBase58,
	interpretMessage,
	formatMessage,
	saveSignedMessage
};
