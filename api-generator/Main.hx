package;

import dox.Api;
import dox.Config;
import dox.Dox;
import haxe.rtti.CType.TypeInfos;
import sys.io.File;

using StringTools;

class Main {
	public static var defines:Map<String, String>;

	static function main() {
		/*defines = [
			for (line in File.getContent("../xml/bin/defines.txt").split("\n")) {
				var parts = ~/ /.split(line);
				parts[0] => parts[1];
			}
		];*/

		// Generate doc-filter.xml if it exists
		if(sys.FileSystem.exists("api/doc.xml")) {
			var cwd = Sys.getCwd();
			Sys.setCwd(cwd + "/api");
			Sys.command("python3 filter.py");
			Sys.setCwd(cwd);
			sys.FileSystem.rename("api/doc.xml", "api/doc-old.xml"); // so it doesnt convert it again
		}

		// otherwise, check if cached doc-filter.xml exists
		if(!sys.FileSystem.exists("api/doc-filter.xml")) {
			trace("Couldn't find doc-filter.xml");
			Sys.exit(1);
		}

		var config = new Config(Macro.getDoxPath());
		config.inputPath = "api/doc-filter.xml";
		config.outputPath = "../export/api-docs";
		config.rootPath = "./";
		config.loadTheme("./theme");
		config.pageTitle = "Codename Engine API";
		config.toplevelPackage = "funkin";
		//config.defines = [Version => defines["flixel"]];
		config.addFilter("(__ASSET__|ApplicationMain|DocumentClass|DefaultAssetLibrary|Main|NMEPreloader|zpp_nape)", false);
		config.addFilter("funkin|scripting", true);
		//config.rootPath = "";

		Dox.run(config, Api.new);
	}
}