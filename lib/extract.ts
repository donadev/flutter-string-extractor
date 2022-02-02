
import * as fs from 'fs/promises';
import { extractFilePaths } from './util/utils';

export type OutputString = {
    value : string
    rawValue : string
    file : string
}

const NUMBER_REGEX = /^-?\d*\.?\d*$/
const NON_ALPHANUMERICAL = /^[^a-zA-Z]+$/
const FS_PATH_REGEX = /[a-zA-Z]*(\/[a-zA-Z]+)+/
const CODE_PATH_REGEX = /[a-zA-Z]*(\.[a-zA-Z]+)+/
const SNAKE_CASE_REGEX = /[a-zA-Z]*(\_[a-zA-Z]+)+/
const PACKAGE_PATH_REGEX = /[a-zA-Z]*(\:[a-zA-Z]+)+/
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
const EXCLUDED_REGEXES = [NUMBER_REGEX, URL_REGEX, NON_ALPHANUMERICAL, CODE_PATH_REGEX, FS_PATH_REGEX, PACKAGE_PATH_REGEX, SNAKE_CASE_REGEX]
const APEX_REGEX = /'.*?(?<!\\)'/g
const DOUBLE_APEX_REGEX = /".*?(?<!\\)"/g

export const OUTPUT_PATH = "output/edit_me.json"
export const OUTPUT_META_PATH = "output/meta.json"

const filter = (string : string, extension: string): boolean => {
    const formatted = extension.replace(".", "")
    return !string.startsWith("package:") && !string.endsWith(`.${formatted}`) && EXCLUDED_REGEXES.every(r => !string.match(r))
}
const trimApex = (s : string) : string => {
    return trimApexLeft(trimApexRight(s))
}
const trimApexLeft = (s : string) : string => {
    if(s.startsWith("\"") || s.startsWith("\'")) return s.substring(1)
    return s
}
const trimApexRight = (s : string) : string => {
    if(s.endsWith("\"") || s.endsWith("\'")) return s.slice(0, -1)
    return s
}
const extractStrings = async (file : string, extension : string): Promise<OutputString[]> => {
    const content : string = await fs.readFile(file, "utf-8")
    const doubleApex = DOUBLE_APEX_REGEX
    const strings = (content.match(doubleApex) || []).concat(content.match(APEX_REGEX) || [])
        .map((s : string) : OutputString => {
            return {value: trimApex(s), rawValue: s, file: file}
        })
        .filter(s => filter(s.value, extension))
   // console.log(`Number of strings from ${file}: ${strings.length}`)
    return strings
}
const stringsFromFolder = async (folder : string, extension : string, excluded_paths : string[]): Promise<OutputString[]> => {
    const paths = await extractFilePaths(folder, extension, excluded_paths)
    const producers = paths.map(path => extractStrings(path, extension))
    const strings : OutputString[][] = await Promise.all(producers)
    return strings.flat()
}
const buildMetaJson = (strings : OutputString[]): {[id:string] : OutputString[]} => {
    const output : {[id:string]: OutputString[]} = {}
    strings.forEach((s: OutputString) => {
        output[s.value] = [s, ...(output[s.value] || [])]
    })
    return output
}
const buildStringsJson = (strings : OutputString[]): {[id:string] : string} => {
    return strings.map((s: OutputString): {[id:string]: string} => { 
        const output : {[id:string]: string} = {}
        output[s.value] = s.value
        return output
    }).reduce((acc, v) => Object.assign({}, acc, v), {})
}

const extract = async (folder : string, extension : string, excluded_paths : string[]) => {
    const strings = await stringsFromFolder(folder, extension, excluded_paths)
    const metaJson = await buildMetaJson(strings) 
    const meta = JSON.stringify(metaJson, null, 2)
    await fs.writeFile(OUTPUT_META_PATH, meta)
    const outputJson = await buildStringsJson(strings) 
    const output = JSON.stringify(outputJson, null, 2)
    await fs.writeFile(OUTPUT_PATH, output)
    console.log(`Your JSON is saved in ${OUTPUT_PATH}`)
    console.log(`Number of strings retrieved: ${Object.keys(outputJson).length}`)
}

export default extract