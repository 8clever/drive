"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_1 = __importDefault(require("fs"));
var path = process.cwd() + "/drive.auth.json";
var buff = fs_1["default"].readFileSync(path);
var hex = buff.toString("hex");
console.log(hex);
