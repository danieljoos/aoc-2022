#!ts-node

import { resolve } from "path";

if (process.argv.length < 3) {
    console.error("no day specified");
    process.exit(1);
}

const day = process.argv[2].padStart(2, '0');
const modulePath = resolve(`${__dirname}/../days/${day}`);
import(modulePath);
