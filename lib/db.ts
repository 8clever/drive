import * as PouchDB from "pouchdb";
import { Drive } from "./drive";
import { debounce } from "lodash";

PouchDB
  .plugin(require("pouchdb-find"))
  .plugin(require("pouchdb-adapter-memory"))

export interface DBOptions {
  name: string;
}

export class DB {

  constructor (options: DBOptions) {
    this.drive = new Drive({
      folderName: options.name
    });
  }

  drive: Drive;

  async collection<T> (name: string) {
    console.time(name);
    const json = await this.drive.getJSON(name);

    const col = new PouchDB<T>(name, { adapter: "memory" });

    const debouncedUpload = debounce(async () => {
      const response = await col.allDocs({
        include_docs: true,
        attachments: true
      });
      const data = response.rows.map(r => {
        delete r.doc._rev;
        return r.doc;
      });
      await this.drive.setJSON(name, data);
    }, 3000);

    await col.bulkDocs(json);

    col.changes({
      live: true
    }).on("change", debouncedUpload);
    
    console.timeEnd(name);
    return col;
  }

}




