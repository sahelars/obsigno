const fs = require("fs");
const {
	resolvePath,
	toUint8Array,
	encodeBase58,
	decodeBase58,
	readPublicKey
} = require("../module/internal");

const interpretMessage = (filePath) => {
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
		const accessCode = `?public_key=${publicKey}&signed_at=${timestamp}&expires_at=${timestamp + expirationMs}`;
		let interpretedContent = content
			.replace(/\$PUBLIC_KEY/g, publicKey)
			.replace(/\$CURRENT_DATE/g, currentDate)
			.replace(/\$EXPIRES_IN_([0-9]+H)?([0-9]+M)?([0-9]+S)?/g, expirationDate)
			.replace(/\$ACCESS_CODE/g, accessCode);
		return {
			content: interpretedContent,
			variables: {
				publicKey,
				currentDate,
				expirationDate,
				accessCode,
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

module.exports = { toUint8Array, encodeBase58, decodeBase58, interpretMessage };
