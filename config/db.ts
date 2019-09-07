import * as mongoose from 'mongoose';
import { resultFileSchema } from '../schemas/resultFile';

export async function connectToDB(conn: mongoose.Connection) {
    if (!conn) {
        const dbURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/host4free?retryWrites=true&w=majority`;
        console.log('Connecting to Db!');
        conn = await mongoose.createConnection(dbURI, {
            bufferCommands: false,
            bufferMaxEntries: 0,
            useNewUrlParser: true
        });
        console.log('Connected to Db!');
        conn.model('ResultFile', resultFileSchema);
    }
    return conn;
}