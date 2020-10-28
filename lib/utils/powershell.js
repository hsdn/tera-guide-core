"use strict";

const EventEmitter = require("events").EventEmitter;
const spawn = require("child_process").spawn;
const os = require("os");

const wrapperCommand = "cmd";
const chcpCommand = "chcp 65001 > nul";
const psCommand = "powershell -NoLogo -NoExit -Command -";

class Powershell extends EventEmitter {
	constructor() {
		super();

		this.commands = [];
		this.EOI = "EOI";
		this.proc = null;
	}

	start() {
		return new Promise((resolve, reject) => {
			if (this.proc !== null)
				return resolve();

			this.removeAllListeners();
			this.on("error", error => reject(error));
			this.once("close", error => {
				this.stop();
				reject(error);
			});

			this.proc = spawn(wrapperCommand);

			if (!this.proc.pid)
				this.emit("close", new PS_PROC_ERROR);

			this.proc.once("error", () => this.emit("close", new PS_PROC_ERROR));
			this.proc.once("close", code => this.emit("error", new Error(`Wrapper process ${this.proc.pid} exited with code ${code}`)));

			this.proc.stderr.on("data", error => this.emit("error", new PS_CMD_FAIL_ERROR(error)));
			this.proc.stdin.once("error", error => this.emit("close", new PS_PROC_ERROR(error)));
			this.proc.stdin.once("close", error => this.emit("close", new PS_PROC_ERROR(error)));

			this.proc.stdout.setEncoding("utf8");
			this.proc.stderr.setEncoding("utf8");
			this.proc.stdin.setDefaultEncoding("utf8");

			this.proc.stdin.write(chcpCommand + os.EOL);
			this.proc.stdin.write(psCommand + os.EOL);

			resolve();
		});
	}

	addCommand(command) {
		this.commands.push(command);
	}

	invoke() {
		return new Promise((resolve, reject) => {
			this.removeAllListeners("error");
			this.on("error", error => reject(error));

			if (this.commands.length === 0)
				this.emit("error", PS_CMD_ARGS_ERROR("Unable to invoke because commands array is empty."));

			const commands = this.commands.join("; ");

			this.proc.stdin.write(commands + os.EOL);
			this.proc.stdin.write(`[Console]::Out.Write("${this.EOI}")`);
			this.proc.stdin.write(os.EOL);

			this.commands = [];
			let buffer = "";

			this.proc.stdout.removeAllListeners();
			this.proc.stdout.on("data", chunk => {
				if (chunk === this.EOI)
					return resolve(buffer);

				buffer += chunk;
			});
		});
	}

	stop() {
		if (this.proc !== null) {
			spawn("taskkill", ["/pid", this.proc.pid, "/f", "/t"]);
			this.proc = null;
		}

		return Promise.resolve();
	}
}

class BaseError extends Error {
	constructor(message) {
		super(message);

		this.name = this.constructor.name;
		this.message = message;

		Error.captureStackTrace(this, this.constructor);
	}
}

class PS_CMD_FAIL_ERROR extends BaseError {}

class PS_CMD_ARGS_ERROR extends BaseError {}

class PS_PROC_ERROR extends BaseError {
	constructor(message = "Unable to start wrapper process.") {
		super(message);
	}
}

module.exports = Powershell;