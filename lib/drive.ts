import { google, drive_v3 } from "googleapis";
import * as path from "path";
import * as jsonpack from "jsonpack";
import * as env from "dotenv";
import fs from "fs";
import os from "os";
import Cryptr from "cryptr";

const config = env.config();

const certCryptr = fs.readFileSync(path.resolve(__dirname, "../drive.auth.cryptr")).toString();

const cryptr = new Cryptr(config.parsed?.SECRET);

const cert = cryptr.decrypt(certCryptr);

const pathCert = os.tmpdir() + "/cert.json"; 

fs.writeFileSync(pathCert, cert);

export interface DriveOptions {
  folderName: string;
}

interface JsonRev {
  rev: string;
  json: any;
  action?: string;
}

const auth = new google.auth.GoogleAuth({
  keyFile: pathCert,
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

export class Drive {

  constructor (props: DriveOptions) {
    this.options = props;
    this.drive = google.drive({
      version: "v3",
      auth
    });
  }

  private static Stringify = jsonpack.pack

  private static Parse = jsonpack.unpack

  private drive: drive_v3.Drive

  private options: DriveOptions;

  private folderId: string = "";

  private mimeType = {
    folder: "application/vnd.google-apps.folder",
    file: "application/vnd.google-apps.file",
    text: "text/plain"
  }

  private search = async (params: drive_v3.Params$Resource$Files$List) => {
    const list = await this.drive.files.list(params);
    return list.data.files || [];
  }

  private generateId = async () => {
    const ids = await this.drive.files.generateIds({
      count: 1
    });
    return ids.data[0];
  }

  private pickFolderId = async () => {
    if (this.folderId) return;

    // check folder
    const list = await this.search({
      q: `name='${this.options.folderName}' and mimeType='${this.mimeType.folder}'`
    });

    if (list.length) {
      this.folderId = list[0].id || ""
      return; 
    }

    // create folder
    const id = await this.generateId();
    this.folderId = id;
    await this.drive.files.create({
      requestBody: {
        id,
        name: this.options.folderName,
        mimeType: this.mimeType.folder
      }
    });
    return;
  }

  setJSON = async (fileId: string, rev: JsonRev) => {
    return this.drive.files.update({
      fileId,
      requestBody: {
        properties: {
          rev: rev.rev
        }
      },
      media: {
        mimeType: this.mimeType.text,
        body: Drive.Stringify(rev.json)
      }
    });
  }

  getRev = () => {
    return new Date().valueOf().toString();
  }

  getMeta = async (name: string) => {
    const list = await this.search({
      q: `name='${name}' and '${this.folderId}' in parents`,
      fields: "files(id,properties)"
    });
    const file = list[0];
    return file;
  }

  getFileData = async (fileId: string) => {
    const data = await this.drive.files.export({
      fileId,
      mimeType: this.mimeType.text
    });
    return Drive.Parse(String(data.data).trim()) as any;
  }

  getJSON = async (fileName: string): Promise<JsonRev> => {
    await this.pickFolderId()

    const file = await this.getMeta(fileName);

    const fileId = file.id;

    // get json from file
    if (fileId) {

      try {
        const json = await this.getFileData(fileId);
        return {
          rev: file.properties?.rev ?? this.getRev(),
          json
        };
      } catch (e) {
        return {
          action: e.message,
          rev: this.getRev(),
          json: []
        };
      }
    }

    const rev = this.getRev();
    await this.drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: this.mimeType.file,
        parents: [
          this.folderId
        ],
        properties: {
          rev
        }
      },
      media: {
        mimeType: this.mimeType.text,
        body: Drive.Stringify([])
      }
    });

    return {
      action: `Create file: ${name}`,
      rev,
      json: []
    };
  }

  
}