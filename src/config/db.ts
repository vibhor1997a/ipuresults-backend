import * as mongoose from 'mongoose';
import { resultFileSchema } from '../schemas/resultFile';
import { institutionSchema } from '../schemas/institution';
import { programmeSchema } from '../schemas/programme';
import { studentSchema } from '../schemas/student';
import { resultSetSchema } from '../schemas/resultSet';
import { subjectSchema } from '../schemas/subject';
import { semesterRankSchema } from '../schemas/semesterRank';

/**
 * Make connection to db if required
 * @param conn 
 */
export async function connectToDB(conn: mongoose.Connection) {
    if (!conn) {
        const dbURI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
        console.log('Connecting to Db!');
        conn = await mongoose.createConnection(dbURI, {
            bufferCommands: false,
            bufferMaxEntries: 0,
            useNewUrlParser: true,
        });
        console.log('Connected to Db!');
        conn.model('ResultFile', resultFileSchema);
        conn.model('Institution', institutionSchema);
        conn.model('Programme', programmeSchema);
        conn.model('Student', studentSchema);
        conn.model('ResultSet', resultSetSchema);
        conn.model('Subject', subjectSchema);
        conn.model('SemesterRank', semesterRankSchema);
    }
    return conn;
}