// Copyright 2022 Google LLC.
// SPDX-License-Identifier: Apache-2.0

import "./api/api.js";
import server from "./server/server.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

import express from "express";
const app = express();

const port = 3000;

app.get("/", async (req, res) => {
	const html = `
<p>Try the <a href="/server">server</a>, <a href="/client">client</a> or <a href="/static">static</a> versions.</p>

	`;

	res.send(html);
});

app.use("/client", express.static("client"));

app.get("/client/*", async (req, res) => {
	res.sendFile(path.resolve("client/index.html"));
});

app.use(
	"/static",
	express.static("static/dist", {
		extensions: ["html"],
	})
);
app.use("/assets", express.static("css"));

app.use("/server", server);

app.listen(port, async () => {
	console.log(
		`Codelab server started at: http://localhost:${port} <-- Visit this URL`
	);
	import("./static/static.js");
});
