import * as PouchDB from "pouchdb";
import { Drive } from "./drive";
import { debounce } from "lodash";

PouchDB
  .plugin(require("pouchdb-find"))
  .plugin(require("pouchdb-adapter-memory"))

export interface DBOptions {
  name: string;
}

class Collection<T> extends PouchDB<T> {
  rev: string;
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
    const r = await this.drive.getJSON(name);
    const col = new Collection<T>(name, { adapter: "memory" });
    col.rev = r.rev;

    const debouncedUpload = debounce(async () => {
      const meta = await this.drive.getMeta(name);
      
      // check data revision in drive
      if (meta.properties.rev && col.rev !== meta.properties.rev) {
        const json = await this.drive.getFileData(meta.id);
        changes.cancel();
        await col.bulkDocs(json, {
          new_edits: false
        });
        changes.on("change", debouncedUpload);
      }

      // update drive with new rev
      const response = await col.allDocs<T>({
        include_docs: true,
        attachments: true
      });
      col.rev = this.drive.getRev();
      await this.drive.setJSON(meta.id, {
        json: response.rows.map(r => r.doc),
        rev: col.rev
      });
    }, 3000);

    if (r.json.length) {
      await col.bulkDocs(r.json, {
        new_edits: !r.json[0]._rev
      });  
    }

    const changes = col.changes({
      live: true
    });
    
    changes.on("change", debouncedUpload);
    
    console.timeEnd(name);
    return col;
  }

}




