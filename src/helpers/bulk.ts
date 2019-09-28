import { Model, Document } from "mongoose";

export async function bulkInsertAll<T extends Document>(docs: T[], Model: Model<T>): Promise<T[]> {
    let toInsert = [];
    let inserted: T[] = [];
    for (let i = 0; i < docs.length; i++) {
        toInsert.push(docs[i]);
        const isLastItem = i === docs.length - 1;
        if (i % 500 === 0 || isLastItem) {
            try {
                inserted.concat(await bulkInsert(toInsert, Model));
            }
            catch (err) {
                console.error(err);
            }
            toInsert = [];
        }
    }
    return inserted;
}

export function bulkInsert<T extends Document>(docs: T[], Model: Model<T>): Promise<T[]> {
    return new Promise((res, rej) => {
        Model.collection.insertMany(docs, { ordered: false }, function (err) {
            if (err) {
                if (err.hasOwnProperty('writeErrors')) {
                    //@ts-ignore
                    if (err.writeErrors.some(error => error.code != 11000)) {
                        rej(err);
                    }
                }
            }
            res(docs);
        });
    });
}