const { Remarkable } = require('remarkable');
var path = require("path");
var Mustache = require('mustache');
var jsdom = require("jsdom");
var fs = require('fs');
var hljs = require('highlight.js');
const { execSync } = require('child_process');

var { fixHtmlRefs, copyDir, parseTemplate } = require("../utils.js");
var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

const apiGenerator = path.join(__dirname, "..", "..", 'api-generator');

function buildHtml(_pageDir, _exportPath, isWatch) {
	var pageDir = _pageDir + "api-docs/";
	var exportPath = _exportPath + "api-docs/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Api Docs");
	console.log("Using api generator at " + apiGenerator);

	//if(isWatch) {
		// build with haxe
		execSync("haxe dox.hxml", {cwd: apiGenerator}, function(error, stdout, stderr) {
			console.log(stdout);
		});
	//} else {
	//	// build with neko
	//	execSync("neko bin/main.n", {cwd: apiGenerator}, function(error, stdout, stderr) {
	//		console.log(stdout);
	//	});
	//}

	//copyDir("./src/pages/api-docs/", exportPath);
}

function buildNotBuilt(_pageDir, _exportPath) {
	var pageDir = _pageDir + "api-docs-not-built/";
	var exportPath = _exportPath + "api-docs/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}

	var html = fs.readFileSync("./src/pages/api-docs-not-built/index.html", 'utf8');
	html = parseTemplate(html, {
		title: "API Docs",
		header: header
	});
	let doc = fixHtmlRefs(html, pageDir, _pageDir);
	fs.writeFileSync(exportPath + "/index.html", doc.serialize(), 'utf8');
}

module.exports = {
	buildHtml: buildHtml,
	buildNotBuilt: buildNotBuilt
}