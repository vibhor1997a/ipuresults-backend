import * as mongoose from 'mongoose';
import { resultFileSchema } from '../schemas/resultFile';
import { institutionSchema } from '../schemas/institution';
import { programmeSchema } from '../schemas/programme';
import { studentSchema } from '../schemas/student';
import { resultSetSchema } from '../schemas/resultSet';

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
        conn.model('Institution', institutionSchema);
        conn.model('Programme', programmeSchema);
        conn.model('Student', studentSchema);
        conn.model('ResultSet', resultSetSchema);
    }
    return conn;
}