import { UserInputError } from "apollo-server";

function capitalise(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default function handleErrors(err: any): any {
  if (err.name === "MongoError") {
    if (err.code === 11000) {
      Object.keys(err.keyValue).map((key) => {
        const capKey = capitalise(key);
        throw new UserInputError(`${key}: ${capKey} exists already`);
      });
    }
  }
}
