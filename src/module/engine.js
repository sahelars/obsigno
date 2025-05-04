const fs = require("fs");

/**
 * Reads a text file and interprets the variables in it
 * @param {string} filePath - Path to the file to be read
 * @returns {Object} Object with interpreted variables and the template content
 */
function readAndInterpretFile(filePath, publicKeyPath) {
	try {
		const content = fs.readFileSync(filePath, "utf8");

		let publicKey = "";
		try {
			publicKey = fs.readFileSync(publicKeyPath, "utf8").trim();
		} catch (err) {
			console.log("Public key not found, using placeholder");
			publicKey = "PLACEHOLDER_PUBLIC_KEY";
		}

		const currentDate = new Date().toISOString();

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
		const expirationDate = new Date(Date.now() + expirationMs).toISOString();
		const accessCode = `${Date.now()}?expires=${expirationMs}`;

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
	} catch (err) {
		console.error(`Error reading or interpreting file: ${err.message}`);
		throw err;
	}
}

/**
 * Write interpreted content to a new file
 * @param {string} sourceFilePath - Path to the template file
 * @param {string} outputFilePath - Path to save the interpreted file
 * @returns {string} Path to the saved file
 */
function writeInterpretedFile(sourceFilePath, outputFilePath) {
	const result = readAndInterpretFile(sourceFilePath);
	fs.writeFileSync(outputFilePath, result.content, "utf8");
	return outputFilePath;
}

module.exports = {
	readAndInterpretFile,
	writeInterpretedFile
};
