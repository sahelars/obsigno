const { expect } = require("chai");
const Keypair = require("../src/keypair/keypair.js");
const Certify = require("../src/certify/certify.js");
const Utils = require("../src/utils/utils.js");

const updatingInterval = 3600000;
const timestamp = Date.now() + updatingInterval;
const messageString = `I verify this message.\nSigned: ${Date.now()}\nExpires:${timestamp}`;

describe("Certify tests", () => {
	it("should expect signature in Uint8Array", () => {
		const keypair = Keypair.keypair();
		const signature = Certify.signMessage({
			message: messageString,
			privateKey: keypair.privateKey
		});
		expect(signature).to.have.length(64);
		const signatureBs58 = Certify.signMessage({
			message: messageString,
			privateKey: Utils.encodeBase58(keypair.privateKey)
		});
		expect(signatureBs58).to.have.length(64);
		const signatureCustomMessage = Certify.signMessage({
			message: messageString
		});
		expect(signatureCustomMessage).to.have.length(64);
	});

	it("should expect verified signature with external keys", () => {
		const secretKey = Keypair.keypair();
		const keypair = Keypair.keypair(secretKey.secretKey);
		const signature = Certify.signMessage({
			message: messageString,
			privateKey: keypair.privateKey
		});
		const verified = Certify.verifyMessage({
			message: messageString,
			publicKey: keypair.publicKey,
			signature: signature
		});
		expect(verified).to.be.true;
		const wrongPublicKey = Keypair.generateRandomKeypair().publicKey;
		const failVerified = Certify.verifyMessage({
			message: messageString,
			publicKey: wrongPublicKey,
			signature: signature
		});
		expect(failVerified).to.be.false;
	});

	it("should expect verified signature with internal keys", () => {
		const keypair = Keypair.keypair();
		const signature = Certify.signMessage({
			message: messageString
		});
		const verified = Certify.verifyMessage({
			message: messageString,
			publicKey: keypair.publicKey,
			signature: signature
		});
		expect(verified).to.be.true;
		const verifiedBs58 = Certify.verifyMessage({
			message: messageString,
			publicKey: Utils.encodeBase58(keypair.publicKey),
			signature: signature
		});
		expect(verifiedBs58).to.be.true;
	});
});
