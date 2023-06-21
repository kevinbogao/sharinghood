import { readdirSync, statSync } from "fs";
import { join } from "path";

export function getAllFilesFromDir(fullPath: string): Array<string> {
  return readdirSync(join(process.cwd(), fullPath)).reduce<Array<string>>((files, file) => {
    const absolutePath = join(fullPath, file);
    if (!statSync(absolutePath).isDirectory()) {
      return files.concat(absolutePath);
    }

    getAllFilesFromDir(absolutePath).forEach((_file) => files.push(_file));
    return files;
  }, []);
}
