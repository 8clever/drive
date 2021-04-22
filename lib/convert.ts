#!/usr/bin/env node

import fs from "fs";

const path = process.cwd() + "/drive.auth.json";

const buff = fs.readFileSync(path);

const hex = buff.toString("hex");

console.log(hex);