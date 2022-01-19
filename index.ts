import * as fs from 'fs/promises';
import extractor from './lib/extract';
import { question } from './lib/util/utils';




const start = async () => {
    const folder : string = "/Users/donadev/Documents/Projects/AmmessoApp/lib"//await question("Insert the main folder where to search for strings: ")
    const excluded_paths : string[]  = ["/Users/donadev/Documents/Projects/AmmessoApp/lib/amplifyconfig_debug.dart", "/Users/donadev/Documents/Projects/AmmessoApp/lib/amplifyconfig_production.dart"]
    const extension : string = "dart"//await question("Insert the file extension without the dot: ")
    let mode : string = await question("Select the script process to run: ([extract], upload, replace): ")
    if(mode == "") mode = "extract"
    switch(mode) {
        case "extract": return await extractor(folder, extension, excluded_paths)
        default: return console.log("Not implemented yet")
    }
}


start().then(() => {})
