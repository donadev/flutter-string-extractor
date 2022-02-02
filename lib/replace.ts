import * as fs from 'fs/promises';

import { OutputString, OUTPUT_META_PATH as INPUT_META_PATH, OUTPUT_PATH as INPUT_PATH, OUTPUT_PATH } from "./extract";
import { transformJson } from './upload';

type ReplaceString = {from: string, to: string, file: string}

const fileReader = async (path : string, transformer : (string) => string = a => a) : Promise<[string: any]> => {
    const raw = await fs.readFile(path, "utf-8")
    return JSON.parse(transformer(raw))
}

const getFile = async () : Promise<[string: string]> => {
    return await fileReader(INPUT_PATH, transformJson)
}   

const getMetaFile = async () : Promise<[string: [OutputString]]> => {
    return await fileReader(INPUT_META_PATH)
}
const transformKey = (key : string) : string => {
    return `AppLocalizations.of(context).${key}`
}
const transformMeta = (strings : [string: string], meta : [string: [OutputString]]) : ReplaceString[] => {
    return Object.values(meta).map(lines => {
        return lines.map((line) : ReplaceString | null => {
            const key = Object.keys(strings).find((k) => strings[k] === line.value)
            if(key == null) return null
            const value = line.rawValue
            const file = line.file
            return {to: transformKey(key), from: value, file}
        }).filter(v => v != null)
    }).flat()
}

const replace = async (data: ReplaceString) => {
    const content = await fs.readFile(data.file, "utf-8")
    const edit = content.replace(data.from, data.to)
    await fs.writeFile(data.file, edit, "utf-8")
}

const replacer = async () => {
    const strings = await getFile()
    const meta = await getMetaFile()
    const replacePaths = transformMeta(strings, meta)
    console.log(replacePaths)
    for(const data of replacePaths) {
        await replace(data)
    }
}

export default replacer