import fs from "fs";
import { config } from "../config";

const CACHE_SECONDS = 60 * 30; // 30 min

export const getFromFileCache = (file: string) => {
  const cacheFile = `${config.fileCacheDir}/${file}`;
  if (fs.existsSync(cacheFile)) {
    const time = fs.statSync(cacheFile).mtimeMs;
    if (new Date().getTime() > time + CACHE_SECONDS * 1000) {
      return null;
    }
    const data = fs.readFileSync(cacheFile).toString();
    return JSON.parse(data);
  }
  return null;
};

export const setToFileCache = (file: string, data: any, plainText = false) => {
  const cacheFile = `${config.fileCacheDir}/${file}`;
  fs.writeFileSync(cacheFile, plainText ? data : JSON.stringify(data, null, 2));
};
