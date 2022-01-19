import * as fs from 'fs/promises';

import { OutputString, OUTPUT_META_PATH as INPUT_META_PATH, OUTPUT_PATH as INPUT_PATH, OUTPUT_PATH } from "./extract";

type ReplaceString = {from: string, to: string, file: string}

const fileReader = async (path : string) : Promise<[string: any]> => {
    const raw = await fs.readFile(path, "utf-8")
    return JSON.parse(raw)
}

const getFile = async () : Promise<[string: string]> => {
    return await fileReader(INPUT_PATH)
}   

const getMetaFile = async () : Promise<[string: [OutputString]]> => {
    return await fileReader(INPUT_META_PATH)
}
const transformKey = (key : string) : string => {
    return `AppLocalizations.of(context)!.${key}`
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
    //TODO implement
}

const replacer = async () => {
    const strings = await getFile()
    const meta = await getMetaFile()
    const replacePaths = transformMeta(strings, meta)
    console.log(replacePaths)
    await Promise.all(replacePaths.map(replace))
}

export default replacer