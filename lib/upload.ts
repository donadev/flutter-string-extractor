
import axios from 'axios';
import * as fs from 'fs/promises';
import FormData = require('form-data');
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

const uploader = async (apiKey : string) => {
    const json = await getJson()
    await upload(json, apiKey)
}

export default uploader;