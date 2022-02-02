
import axios from 'axios';
import * as camelcase from 'camelcase';
import * as fs from 'fs/promises';
import { OUTPUT_PATH as INPUT_PATH } from "./extract";

const UPLOAD_URL = "https://localise.biz/api/import/json"

type LocoResponse = { status : string, data : {message: string} }

const upload = async (json : string, loco_api_key : string) => {
    const url = `${UPLOAD_URL}?key=${loco_api_key}&locale=it_IT`
    try {
        const response : LocoResponse = await axios.post(url, json)
        console.log(`Upload finished (status=${response.status}): ${response.data.message}`)
    } catch(e) {
        console.log(`Upload finished with error ${e}`)
    }
}
const getJson = async () : Promise<string> => {
    return await fs.readFile(INPUT_PATH, "utf-8")
}
const transformKey = camelcase

export const transformJson = (json : string) : string => {
    const dict : {[id:string] : any[]} = JSON.parse(json)
    const output : {[id:string] : any[]} = {}
    Object.keys(dict).forEach(key => {
        output[transformKey(key)] = dict[key]
    })
    return JSON.stringify(output)
     
}

const uploader = async (apiKey : string) => {
    const json = await getJson()
    const transformed = transformJson(json)
    await upload(transformed, apiKey)
}

export default uploader;