import * as fs from 'fs/promises';
import 'dotenv/config'

import extractor from './lib/extract';
import { question } from './lib/util/utils';
import uploader from './lib/upload';
import replacer from './lib/replace';
import { exit } from 'process';




const start = async () => {
    const folder : string = process.env.folder || await question("Insert the main folder where to search for strings: ")
    const excluded_paths_str : string  = process.env.excluded_paths || await question("Insert the excluded paths, comma separated")
    const excluded_paths = excluded_paths_str.split(",")
    const extension : string = process.env.extension || await question("Insert the file extension without the dot: ")
    const loco_api_key : string = process.env.loco_api_key || await question("Insert the Localise.biz API Key: ")
    let mode : string = await question("Select the script process to run: ([extract], upload, replace): ")
    if(mode == "") mode = "extract"
    switch(mode) {
        case "extract": await extractor(folder, extension, excluded_paths)
            break
        case "upload": await uploader(loco_api_key)
            break
        case "replace": await replacer()
            break
        default: console.log("Not implemented yet")
    }
    console.log("Script ended")
}


start().then(() => exit()).catch(console.error)
