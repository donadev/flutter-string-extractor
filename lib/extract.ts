
import * as fs from 'fs/promises';
import { extractFilePaths } from './util/utils';

export type OutputString = {
    value : string
    rawValue : string
    file : string
    line : number
}

const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
const APEX_REGEX = /'.*?(?<!\\)'/g
const DOUBLE_APEX_REGEX = /".*?(?<!\\)"/g

const OUTPUT_PATH = "output/edit_me.json"
const OUTPUT_META_PATH = "output/meta.json"

const filter = (string : string, extension: string): boolean => {
    const formatted = extension.replace(".", "")
    return !string.startsWith("package:") && !string.endsWith(`.${formatted}`) && !string.match(URL_REGEX)
}

const extractStrings = async (file : string, extension : string): Promise<OutputString[]> => {
    const content : string = await fs.readFile(file, "utf-8")
    const doubleApex = DOUBLE_APEX_REGEX
    const strings = (content.match(doubleApex) || []).concat(content.match(APEX_REGEX) || [])
        .map((s : string) : OutputString => {
            return {value: s.replace(/"|'/g, ""), rawValue: s, file: file, line: 0}
        })
        .filter(s => filter(s.value, extension))
    console.log(`Number of strings from ${file}: ${strings.length}`)
    return strings
}
const stringsFromFolder = async (folder : string, extension : string): Promise<OutputString[]> => {
    const paths = await extractFilePaths(folder, extension)
    const producers = paths.map(path => extractStrings(path, extension))
    const strings : OutputString[][] = await Promise.all(producers)
    return strings.flat()
}
const buildMetaJson = (strings : OutputString[]): {[id:string] : OutputString} => {
    return strings.map((s: OutputString): {[id:string]: OutputString} => { 
        const output : {[id:string]: OutputString} = {}
        output[s.value] = s
        return output
    }).reduce((acc, v) => Object.assign({}, acc, v), {})
}
const buildStringsJson = (strings : OutputString[]): {[id:string] : string} => {
    return strings.map((s: OutputString): {[id:string]: string} => { 
        const output : {[id:string]: string} = {}
        output[s.value] = s.value
        return output
    }).reduce((acc, v) => Object.assign({}, acc, v), {})
}

const extract = async (folder : string, extension : string) => {
    const strings = await stringsFromFolder(folder, extension)
    const metaJson = await buildMetaJson(strings) 
    const meta = JSON.stringify(metaJson, null, 2)
    await fs.writeFile(OUTPUT_META_PATH, meta)
    const outputJson = await buildStringsJson(strings) 
    const output = JSON.stringify(outputJson, null, 2)
    await fs.writeFile(OUTPUT_PATH, output)
    console.log(`Your JSON is saved in ${OUTPUT_PATH}`)
}

export default extract