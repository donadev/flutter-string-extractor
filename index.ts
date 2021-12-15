import * as fs from 'fs/promises';
import * as readline from 'readline';
import * as glob from 'glob-promise';
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve))
}

const extractFilePaths = async (folder : string, extension : string): Promise<string[]> => {
    const formatted = extension.replace(".", "")
    const pattern = `${folder}/**/*.${formatted}`
    return await glob(pattern)
}

const filter = (string : string, extension: string): boolean => {
    const formatted = extension.replace(".", "")
    return !string.startsWith("package:") && !string.endsWith(`.${formatted}`)
}

const extractStrings = async (file : string, extension : string): Promise<string[]> => {
    const content : string = await fs.readFile(file, "utf-8")
    const doubleApex = /"([^"']+)"/g
    const apex = /'([^"']+)'/g
    const strings = (content.match(doubleApex) || []).concat(content.match(apex) || [])
    const formatted = strings.map(s => s.replace(/"|'/g, "")).filter(s => filter(s, extension))
    console.log(`Number of strings from ${file}: ${formatted.length}`)
    return formatted
}
const stringsFromFolder = async (folder : string, extension : string): Promise<string[]> => {
    const paths = await extractFilePaths(folder, extension)
    const producers = paths.map(path => extractStrings(path, extension))
    const strings : string[][] = await Promise.all(producers)
    return strings.flat();
}

const buildJson = (strings : string[]): {[id:string] : string} => {
    return strings.map((s: string): {[id:string]: string} => { 
        const output : {[id:string]: string} = {}
        output[s] = s
        return output
    }).reduce((acc, v) => Object.assign({}, acc, v), {})
}

const saveJson = async (json : {[id:string] : string}, path : string) => {
    const string = JSON.stringify(json, null, 2)
    await fs.writeFile(path, string)
}


const start = async () => {
    const folder : string = "/Users/donadev/Projects/MyFlutterApp"//await question("Insert the main folder where to search for strings: ")
    const extension : string = "dart"//await question("Insert the file extension without the dot: ")
    const output_path = "output/strings.json"
    const strings = await stringsFromFolder(folder, extension)
    const json = buildJson(strings)
    await saveJson(json, output_path)
    console.log(`Your JSON is saved in ${output_path}`)
}


start().then(() => {})
