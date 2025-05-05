function parseArgs() {
	const args = process.argv.slice(2);
	const flags = {};
	const nonFlags = [];
	for (let arg of args) {
		if (arg.startsWith("--")) {
			flags[arg.slice(2)] = true;
		} else {
			nonFlags.push(arg);
		}
	}
	return { flags, args: nonFlags };
}

const { flags, args } = parseArgs();
const command = args[0];

module.exports = {
	flags,
	args,
	command
};
