const fs = require("fs");
const os = require("os");
const path = require("path");
const homeDir = os.homedir();
const keyDir = path.join(homeDir, ".obsigno");
const publicKeyPath = path.join(keyDir, "ed25519-pub.base58");
const publicKey = fs.readFileSync(publicKeyPath, "utf8");

const currentDate = Date.now();
const signed = new Date(currentDate).toISOString();
const expires = new Date(currentDate + 333000).toISOString();
const accessCode = `${currentDate}+${333000}`;

const message = (publicKey, signed, expires, accessCode, metadata) =>
	`\n${metadata ? `  Preparing for notarization: ${publicKey}\n  ---------------------------------------------------------------------------\n` : ""}  I, ${metadata ? "PLACEHOLDER" : publicKey}, hereby certify and notarize this message.\n\n  Signed:  ${signed}\n  Expires: ${expires}\n\n  Access Code:  ${accessCode}${metadata ? "\n  Signature:    EMPTY\n  ---------------------------------------------------------------------------\n" : ""}`;

const review = message(publicKey, "EMPTY", "EMPTY", "EMPTY", true);
const certify = message(publicKey, signed, expires, accessCode);

// REQUIRED: `obsignoMessage` AND `obsignoCertify`
module.exports = {
	obsignoMessage: review,
	obsignoCertify: certify
};
