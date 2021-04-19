"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Drive = void 0;
var googleapis_1 = require("googleapis");
var path = require("path");
var jsonpack = require("jsonpack");
var auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: path.resolve(__dirname, "../drive.auth.json"),
    scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/drive.appdata",
        "https://www.googleapis.com/auth/drive.metadata",
        "https://www.googleapis.com/auth/drive.photos.readonly"
    ]
});
var Drive = /** @class */ (function () {
    function Drive(props) {
        var _this = this;
        this.folderId = "";
        this.mimeType = {
            folder: "application/vnd.google-apps.folder",
            file: "application/vnd.google-apps.file",
            text: "text/plain"
        };
        this.search = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.drive.files.list(params)];
                    case 1:
                        list = _a.sent();
                        return [2 /*return*/, list.data.files || []];
                }
            });
        }); };
        this.generateId = function () { return __awaiter(_this, void 0, void 0, function () {
            var ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.drive.files.generateIds({
                            count: 1
                        })];
                    case 1:
                        ids = _a.sent();
                        return [2 /*return*/, ids.data[0]];
                }
            });
        }); };
        this.pickFolderId = function () { return __awaiter(_this, void 0, void 0, function () {
            var list, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.folderId)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.search({
                                q: "name='" + this.options.folderName + "' and mimeType='" + this.mimeType.folder + "'"
                            })];
                    case 1:
                        list = _a.sent();
                        if (list.length) {
                            this.folderId = list[0].id || "";
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.generateId()];
                    case 2:
                        id = _a.sent();
                        this.folderId = id;
                        return [4 /*yield*/, this.drive.files.create({
                                requestBody: {
                                    id: id,
                                    name: this.options.folderName,
                                    mimeType: this.mimeType.folder
                                }
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.setJSON = function (fileId, rev) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.drive.files.update({
                        fileId: fileId,
                        requestBody: {
                            properties: {
                                rev: rev.rev
                            }
                        },
                        media: {
                            mimeType: this.mimeType.text,
                            body: Drive.Stringify(rev.json)
                        }
                    })];
            });
        }); };
        this.getRev = function () {
            return new Date().valueOf().toString();
        };
        this.getMeta = function (name) { return __awaiter(_this, void 0, void 0, function () {
            var list, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.search({
                            q: "name='" + name + "' and '" + this.folderId + "' in parents",
                            fields: "files(id,properties)"
                        })];
                    case 1:
                        list = _a.sent();
                        file = list[0];
                        return [2 /*return*/, file];
                }
            });
        }); };
        this.getFileData = function (fileId) { return __awaiter(_this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.drive.files["export"]({
                            fileId: fileId,
                            mimeType: this.mimeType.text
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, Drive.Parse(String(data.data).trim())];
                }
            });
        }); };
        this.getJSON = function (fileName) { return __awaiter(_this, void 0, void 0, function () {
            var file, fileId, json, e_1, rev;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.pickFolderId()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.getMeta(fileName)];
                    case 2:
                        file = _c.sent();
                        fileId = file.id;
                        if (!fileId) return [3 /*break*/, 6];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getFileData(fileId)];
                    case 4:
                        json = _c.sent();
                        return [2 /*return*/, {
                                rev: (_b = (_a = file.properties) === null || _a === void 0 ? void 0 : _a.rev) !== null && _b !== void 0 ? _b : this.getRev(),
                                json: json
                            }];
                    case 5:
                        e_1 = _c.sent();
                        return [2 /*return*/, {
                                action: e_1.message,
                                rev: this.getRev(),
                                json: []
                            }];
                    case 6:
                        rev = this.getRev();
                        return [4 /*yield*/, this.drive.files.create({
                                requestBody: {
                                    name: fileName,
                                    mimeType: this.mimeType.file,
                                    parents: [
                                        this.folderId
                                    ],
                                    properties: {
                                        rev: rev
                                    }
                                },
                                media: {
                                    mimeType: this.mimeType.text,
                                    body: Drive.Stringify([])
                                }
                            })];
                    case 7:
                        _c.sent();
                        return [2 /*return*/, {
                                action: "Create file: " + name,
                                rev: rev,
                                json: []
                            }];
                }
            });
        }); };
        this.options = props;
        this.drive = googleapis_1.google.drive({
            version: "v3",
            auth: auth
        });
    }
    Drive.Stringify = jsonpack.pack;
    Drive.Parse = jsonpack.unpack;
    return Drive;
}());
exports.Drive = Drive;
