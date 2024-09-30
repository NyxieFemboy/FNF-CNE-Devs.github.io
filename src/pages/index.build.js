const { Remarkable } = require('remarkable');
var path = require("path");
var Mustache = require('mustache');
var jsdom = require("jsdom");
var fs = require('fs');
var hljs = require('highlight.js');

var { fixHtmlRefs, copyDir, parseTemplate } = require("../utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "/";
	var exportPath = _exportPath + "/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Index Page");

    var warnings = [];

    var mods = [];
    var links = {};
    var modsDir = "./featured-mods/";
    var files = fs.readdirSync(modsDir);
    for(const file of files) {
        if(file.startsWith(".")) continue;
        if(!fs.existsSync(modsDir + file + "/meta.json")) continue;
        var meta = JSON.parse(fs.readFileSync(modsDir + file + "/meta.json", 'utf8'));

        let modExport = exportPath + "featuredMods/" + file;

        if(!fs.existsSync(modExport)) fs.mkdirSync(modExport, { recursive: true });

        var imageExt = null;
        if(fs.existsSync(modsDir + file + "/cover.jpg")) {
            imageExt = "jpg";
        }
        else if(fs.existsSync(modsDir + file + "/cover.jpeg")) {
            imageExt = "jpeg";
        }
        else if(fs.existsSync(modsDir + file + "/cover.png")) {
            imageExt = "png";
        }

        var imgLink;

        if(imageExt == null) {
            //warnings.push("No cover image found for mod: " + meta.name);
            imgLink = "img/missing.png";
        } else {
            fs.copyFileSync(modsDir + file + "/cover." + imageExt, modExport + "/cover." + imageExt);
            imgLink = "./featuredMods/" + file + "/cover." + imageExt;
        }

        if(meta.link != null && meta.link != "") {
            if(links[meta.link]) {
                warnings.push("Duplicate link: " + meta.link + " (mod: " + meta.name + " and " + links[meta.link] + ")");
            }
            links[meta.link] = meta.name;
        }

        mods.push({
            name: meta.name,
            description: meta.description,
            image: imgLink,
            link: meta.link,
            tags: meta.tags ?? [],
            tagsRaw: (meta.tags ?? []).join(","),
            author: meta.author,
            source: meta.source,
            version: meta.version,
            lastUpdated: meta.lastUpdated ?? "unknown"
        });
    }

    mods.sort((a, b) => a.name.localeCompare(b.name));

    var path = "./src/pages/index.html";
    var outpath = exportPath + "index.html";
    var templatePage = fs.readFileSync(path, 'utf8');
    var vars = {
        pageTitle: "Home",
        title: "Home",
        header: header,
        mods: mods,
        warnings: warnings
    };

    let html = parseTemplate(templatePage, vars);

    var dom = fixHtmlRefs(html, pageDir, _pageDir);

    //console.log(data);
    fs.writeFileSync(
        outpath,
        dom.serialize(),
        'utf8'
    );
}

module.exports = {
	buildHtml: buildHtml
}