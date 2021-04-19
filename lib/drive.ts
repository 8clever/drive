import { google, drive_v3 } from "googleapis";
import * as path from "path";
import * as jsonpack from "jsonpack";

export interface DriveOptions {
  folderName: string;
}

const auth = new google.auth.GoogleAuth({
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

  setJSON = async (fileName: string, json: any) => {
    const list = await this.search({
      q: `name='${fileName}' and '${this.folderId}' in parents`,
    });

    const fileId = list[0]?.id;
    if (!fileId) {
      throw new Error (`Collection not exists: ${fileName}`);
    }

    await this.drive.files.update({
      fileId,
      media: {
        mimeType: this.mimeType.text,
        body: Drive.Stringify(json)
      }
    });
  }

  getJSON = async (fileName: string) => {
    await this.pickFolderId()

    // check file
    const list = await this.search({
      q: `name='${fileName}' and '${this.folderId}' in parents`,
    });

    const fileId = list[0]?.id;
    
    // get json from file
    if (fileId) {
      const data = await this.drive.files.export({
        fileId,
        mimeType: this.mimeType.text
      });

      try {
        const json = Drive.Parse(String(data.data).trim()) as any;
        return json;
      } catch (e) {
        console.error(e.message);
        return [];
      }
    }

    // create file
    await this.drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: this.mimeType.file,
        parents: [
          this.folderId
        ]
      },
      media: {
        mimeType: this.mimeType.text,
        body: Drive.Stringify([])
      }
    });
    return [];
  }

  
}