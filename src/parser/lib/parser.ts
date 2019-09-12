import * as moment from 'moment';
import { ResultPageType, ParsedResultPage, ParsedSchemePage, SemYear, Exam, ResultSet } from '../../../interfaces/result';
import { Institution } from '../../../interfaces/institution';
import { RegexpStore } from './RegexpStore';
import { Subject } from '../../../interfaces/subject';
import { Student } from '../../../interfaces/student';

export function parsePage(content: string) {
    let resultPageType = getResultPageType(content);
    if (resultPageType !== 'invalid') {

    }
}

export function getResultPageType(pageStr: string): ResultPageType {
    if (/Result of Programme Code/i.test(pageStr)) {
        return 'result';
    }
    else if (/Scheme of Programme Code/i.test(pageStr)) {
        return 'scheme';
    }
    else {
        return 'invalid'
    }
}

function parseContent(content: string) {
    const resultPagesArr = content.split(/\(SCHEME OF EXAMINATIONS\)|RESULT TABULATION SHEET/).filter(s => s);
    for (let resultPage of resultPagesArr) {
        parsePage(resultPage);
    }
}


function parseResultPage(content: string): ParsedResultPage {
    const declaredDate = parseDeclaredDate(content);
    const preparedDate = parsePreparedDate(content);
    const institution = parseInstitution(content);
    const pageNumber = parsePageNumber(content);
    const { batch, examination, semYear, programme } = parseResultProgramme(content);

    let studentsMatch;
    const students = [];
    const results = [];
    while (studentsMatch = RegexpStore.students.exec(content)) {
        const student: Student = {
            batch,
            institutionCode: institution.code,
            programmeCode: programme.code,
            name: studentsMatch[2],
            rollNumber: Number(studentsMatch[1]),
            schemeId: Number(studentsMatch[4]),
            studentId: Number(studentsMatch[3])
        }
        const result: ResultSet = {
            declaredDate
        }
    }
    return {
        students,
        results
    }
}

function parseSchemePage(content: string): ParsedSchemePage {
    const { programme, schemeId, semYear } = parseSchemeProgramme(content);
    const institution = parseInstitution(content);
    const subjects = parseSubjects(content, schemeId);
    const pageNumber = parsePageNumber(content);
    return {
        programme, schemeId, semYear, institution, subjects, pageNumber
    };
}

function parseDateMatch(match: RegExpMatchArray): Date {
    if (match && match[1]) {
        return moment(match[1], 'DD/MM/YYYY').toDate();
    } else {
        return new Date;
    }
}

/**
 * Parse a string like "02 SEMESTER" "03 ANNUAL"
 * @param semYear 
 */
function parseSemYear(semYear: string): SemYear {
    let [num, type] = semYear.split(' ');
    return {
        num: Number(num),
        type: /sem/i.test(type) ? 'sem' : 'year'
    };
}

function parseDeclaredDate(content: string): Date {
    return parseDateMatch(content.match(RegexpStore.declaredDate));
}

function parsePreparedDate(content: string): Date {
    return parseDateMatch(content.match(RegexpStore.preparedDate));
}

function parseInstitution(content: string): Institution {
    const institutionMatch = content.match(RegexpStore.institution);
    return {
        code: Number(institutionMatch[1]),
        name: institutionMatch[2]
    };
}

function parseSchemeProgramme(content: string) {
    const programmeMatch = content.match(RegexpStore.programme.scheme);
    return {
        schemeId: Number(programmeMatch[3]),
        semYear: parseSemYear(programmeMatch[4]),
        programme: {
            name: programmeMatch[2],
            code: programmeMatch[1]
        }
    };
}

function parsePageNumber(content: string): number {
    const pageNumberMatch = content.match(RegexpStore.pageNumber);
    return Number(pageNumberMatch[1]);
}

function parseSubjects(content: string, schemeId: number): Subject[] {
    let subjectsMatch;
    const subjects = [];
    while (subjectsMatch = RegexpStore.subjects.exec(content)) {
        const subject: Subject = {
            paperId: Number(subjectsMatch[1]),
            code: subjectsMatch[2],
            name: subjectsMatch[3],
            credits: subjectsMatch[4],
            type: subjectsMatch[5],
            exam: subjectsMatch[6],
            mode: subjectsMatch[7],
            kind: subjectsMatch[8],
            minor: Number(subjectsMatch[9]),
            major: Number(subjectsMatch[10]),
            maxMarks: Number(subjectsMatch[11]),
            passMarks: Number(subjectsMatch[12]),
            schemeId
        };
        subjects.push(subject);
    }
    return subjects;
}

function parseResultProgramme(content: string) {
    const programmeMatch = content.match(RegexpStore.programme.result);
    return {
        programme: {
            name: programmeMatch[2],
            code: Number(programmeMatch[1])
        },
        semYear: parseSemYear(programmeMatch[3]),
        batch: Number(programmeMatch[4]),
        examination: parseExam(programmeMatch[5])
    };
}

function parseExam(examString: string): Exam {
    const match = examString.match(RegexpStore.exam);
    const date = moment(match[2], 'MMM, YYYY').toDate();
    const splitted = match[1].split(' ');
    const regularReappear = splitted.shift().toLowerCase() as 'regular' | 'reappear';
    const special = splitted.join(' ').trim() || undefined;
    return {
        date,
        regularReappear,
        special
    }
}

interface ParseSingleResultInput {
    content: string;
    batch: number;
    institutionCode: number;
    programmeCode: number
    declaredDate: Date,
    preparedDate: Date
}

function parseSingleResult({ content, batch, institutionCode, programmeCode, declaredDate, preparedDate }): ParseSingleResultInput {

}