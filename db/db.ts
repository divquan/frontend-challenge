import Dexie from "dexie";

export interface FileRecord {
  id: string;
  name: string;
  type: AllowedFileType; // Type-safe field
  file: Blob;
}

class FileDatabase extends Dexie {
  files: Dexie.Table<FileRecord, string>;

  constructor() {
    super("FileDB");
    this.version(1).stores({
      files: "id, name, type", // Indexed fields
    });
    this.files = this.table("files");
  }
}

const db = new FileDatabase();
export default db;

export type AllowedFileType =
  | "application/pdf"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "image/jpeg"
  | "image/png"
  | "application/vnd.ms-outlook";
