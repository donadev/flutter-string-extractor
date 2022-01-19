import * as readline from 'readline';
import * as glob from 'glob-promise';
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


export const question = (query): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve))
}

export const extractFilePaths = async (folder : string, extension : string): Promise<string[]> => {
    const formatted = extension.replace(".", "")
    const pattern = `${folder}/**/*.${formatted}`
    return await glob(pattern)
}