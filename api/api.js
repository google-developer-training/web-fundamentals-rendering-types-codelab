// Copyright 2022 Google LLC.
// SPDX-License-Identifier: Apache-2.0

import products from "./products.json" assert { type: "json" };
import { readFile } from "node:fs/promises";
import cors from "cors";

import express from "express";
const app = express();

const port = 3001;

function sleep(ms = 1000) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

app.use(cors());

app.get("/api/products", (req, res) => {
	res.json(products);
});

app.get("/api/products/:productSlug", async (req, res) => {
	const productSlug = req.params.productSlug;
	const product = products.find(({ slug }) => {
		return productSlug === slug;
	});

	if (!product) {
		return res.sendStatus(404);
	}

	res.json(product);
});

app.get("/api/slow-api", async (req, res) => {
	const delay = 500;
	await sleep(delay);
	res.send(`This text took ${delay}ms to load!`);
});

app.get("/api/long-text", async (req, res) => {
	const textFileName = new URL("long-text.txt", import.meta.url);
	const text = await readFile(textFileName, "utf8");
	res.send(text);
});

app.listen(port, () => {
	console.log(`API Mock server started at: http://localhost:${port}`);
});
