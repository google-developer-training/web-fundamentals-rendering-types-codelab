// Copyright 2022 Google LLC.
// SPDX-License-Identifier: Apache-2.0

// This file runs at server runtime
import { readFile } from "node:fs/promises";

import express from "express";
const app = express();

async function renderTemplate(data) {
	const templateFileName = new URL("template.html", import.meta.url);
	const rawTemplate = await readFile(templateFileName, "utf8");

	let newTemplateString = rawTemplate;
	for (const [key, value] of Object.entries(data)) {
		newTemplateString = newTemplateString.replaceAll(key, value);
	}
	return newTemplateString;
}

async function homePage(req, res) {
	const html = `
<p>You are browsing the server pages. You can also browser the <a href="/client">client</a> or <a href="/static">static</a> pages.</p>

	`;
	const finalTemplate = await renderTemplate({
		"{{title}}": "Server",
		"{{contents}}": html,
		"{{heading}}": "This is the main server page",
	});

	res.send(finalTemplate);
}

async function productListingPage(req, res) {
	const response = await fetch("http://localhost:3001/api/products");
	const json = await response.json();

	const html = `
	<ol>
		${json
			.map(
				(el) => `<li>
			<a href="products/${el.slug}">${el.title}</a>
		</li>`
			)
			.join("")}
	</ol>
	`;

	const finalTemplate = await renderTemplate({
		"{{title}}": "Products listing - Server",
		"{{contents}}": html,
		"{{heading}}": "This page includes a list of products from the server",
	});

	res.send(finalTemplate);
}

async function individualProductPage(req, res) {
	const productSlug = req.params.productSlug;
	const response = await fetch(
		`http://localhost:3001/api/products/${productSlug}`
	);
	const product = await response.json();

	if (!product) {
		return res.sendStatus(404);
	}

	const html = `
		<h2>${product.title}</h2>
		<h3>${product.price}</h3>
		<p>${product.description}</p>
	`;

	const finalTemplate = await renderTemplate({
		"{{title}}": `${product.title} - Server`,
		"{{contents}}": html,
		"{{heading}}": `This is a product page for ${product.title}. This page comes from the server`,
	});

	res.send(finalTemplate);
}

async function manyAPICallsPage(req, res) {
	let textResponse = "";
	for (let i = 0; i < 4; i++) {
		const response = await fetch("http://localhost:3001/api/slow-api");
		textResponse += await response.text();
		textResponse += "<br />";
	}

	const finalTemplate = await renderTemplate({
		"{{title}}": "Many API calls - Server",
		"{{contents}}": textResponse,
		"{{heading}}":
			"Many sequential (serial) API calls were made before this page could be rendered",
	});

	res.send(finalTemplate);
}

async function longTextPage(req, res) {
	const response = await fetch("http://localhost:3001/api/long-text");
	const text = await response.text();

	const html = `
	<details open>
	<summary>Some long text...</summary>
	${text}
	</details>
	`;

	const finalTemplate = await renderTemplate({
		"{{title}}": "Long text - Server",
		"{{contents}}": html,
		"{{heading}}": "This page includes long text from the server",
	});

	res.send(finalTemplate);
}

app.get("/products/:productSlug", individualProductPage);
app.get("/many-api-calls", manyAPICallsPage);
app.get("/long-text", longTextPage);
app.get("/products", productListingPage);
app.get("/", homePage);

export default app;
