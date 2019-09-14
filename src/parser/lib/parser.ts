import * as moment from 'moment';
import { ResultPageType, ParsedResultPage, ParsedSchemePage, SemYear, Exam, ResultSet, SubjectResult, Marks, SubjectMap, ParsedPage, InstitutionMap, ProgrammeMap } from '../../interfaces/result';
import { Institution } from '../../interfaces/institution';
import { RegexpStore } from './RegexpStore';
import { Student } from '../../interfaces/student';
import { Subject } from '../../interfaces/subject';

const subjects: SubjectMap = {};
const institutions: InstitutionMap = {};
const programmes: ProgrammeMap = {};

export function parsePage(content: string): ParsedPage {
    let resultPageType = getResultPageType(content);
    if (resultPageType == 'result') {
        const { institution, programme, results, students, pageNumber } = parseResultPage(content);
        institutions[institution.code] = institution;
        programmes[programme.code] = programme
        return { results, students, pageNumber };
    }
    else if (resultPageType == 'scheme') {
        const { institution, programme, subjects: parsedSubjects, pageNumber } = parseSchemePage(content);
        const schemeIds = Object.keys(parsedSubjects);
        for (let schemeId of schemeIds) {
            if (!subjects[schemeId]) {
                subjects[schemeId] = {};
            }
            let paperIds = Object.keys(parsedSubjects[schemeId]);
            for (let paperId of paperIds) {
                if (!subjects[schemeId][paperId]) {
                    subjects[schemeId][paperId] = parsedSubjects[schemeId][paperId];
                }
            }
        }
        institutions[institution.code] = institution;
        programmes[programme.code] = programme
        return {
            results: [], students: [], pageNumber
        };
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

export function parseContent(content: string): { pages: ParsedPage[], subjects: SubjectMap, institutions: InstitutionMap, programmes: ProgrammeMap } {
    const resultPagesArr = content.split(/\(SCHEME OF EXAMINATIONS\)|RESULT TABULATION SHEET/).filter(s => s);
    const pages: ParsedPage[] = [];
    for (let resultPage of resultPagesArr) {
        const parsedPage = parsePage(resultPage);
        pages.push(parsedPage);
    }
    return { pages, subjects, institutions, programmes };
}


function parseResultPage(content: string): ParsedResultPage {
    const declaredDate = parseDeclaredDate(content);
    const preparedDate = parsePreparedDate(content);
    const institution = parseInstitution(content);
    const pageNumber = parsePageNumber(content);
    const { batch, examination, semYear, programme } = parseResultProgramme(content);

    let studentsMatch: RegExpMatchArray;
    const students: Student[] = [];
    const results: ResultSet[] = [];
    while (studentsMatch = RegexpStore.students.exec(content)) {
        const rollNumber = studentsMatch[1];
        const schemeId = studentsMatch[4];
        const studentId = studentsMatch[3]
        const student: Student = {
            batch,
            institutionCode: institution.code,
            programmeCode: programme.code,
            name: studentsMatch[2],
            rollNumber,
            schemeId,
            studentId
        }
        const subjectResults: SubjectResult[] = [];
        const marksMatch = studentsMatch[5];
        const marksSplitArr = marksMatch.trim().split(/\r?\n/);
        for (let i = 0; i < marksSplitArr.length; i += 3) {
            let [paperIdStr, minorMajorMarksStr, totalMarksStr] = [marksSplitArr[i], marksSplitArr[i + 1], marksSplitArr[i + 2]];
            const { credits, paperId } = parsePaperId(paperIdStr);
            const { major, minor } = parseMajorMinorMarks(minorMajorMarksStr);
            const { grade, totalMarks } = parseTotalMarks(totalMarksStr);
            const subjectResult: SubjectResult = {
                credits,
                grade,
                major,
                minor,
                totalMarks,
                paperId
            };
            subjectResults.push(subjectResult);
        }

        const result: ResultSet = {
            declaredDate,
            preparedDate,
            rollNumber,
            schemeId,
            exam: examination,
            semYear,
            studentId,
            totalCredits: Number(studentsMatch[6]),
            subjects: subjectResults,
            pageNumber
        }
        students.push(student);
        results.push(result);
    }
    return {
        students,
        results,
        institution,
        pageNumber,
        programme,
        semYear
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
        code: institutionMatch[1],
        name: institutionMatch[2]
    };
}

function parseSchemeProgramme(content: string) {
    const programmeMatch = content.match(RegexpStore.programme.scheme);
    return {
        schemeId: programmeMatch[3],
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

function parseSubjects(content: string, schemeId: string): SubjectMap {
    let subjectsMatch;
    const subjects = {};
    while (subjectsMatch = RegexpStore.subjects.exec(content)) {
        const paperId = subjectsMatch[1];
        const subject: Subject = {
            paperId,
            paperCode: subjectsMatch[2],
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
        if (isNaN(subject.minor)) {
            subject.minor = undefined;
        }
        if (isNaN(subject.major)) {
            subject.major = undefined;
        }
        if (!subjects[schemeId]) {
            subjects[schemeId] = {};
        }
        subjects[schemeId][paperId] = subject;
    }
    return subjects;
}

function parseResultProgramme(content: string) {
    const programmeMatch = content.match(RegexpStore.programme.result);
    return {
        programme: {
            name: programmeMatch[2],
            code: programmeMatch[1]
        },
        semYear: parseSemYear(programmeMatch[3]),
        batch: programmeMatch[4],
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
    };
}

function parsePaperId(paperIdStr: string) {
    const paperIdMatch = paperIdStr.match(RegexpStore.paperId);
    return {
        paperId: paperIdMatch[1],
        credits: Number(paperIdMatch[2])
    };
}

function parseMajorMinorMarks(majorMinorStr: string) {
    const majorMinorMatch = majorMinorStr.match(RegexpStore.majorMinor);
    return {
        major: parseMarksString(majorMinorMatch[2]),
        minor: parseMarksString(majorMinorMatch[1])
    };
}

function parseTotalMarks(totalMarksStr: string) {
    const totalMarksMatch = totalMarksStr.match(RegexpStore.totalMarks);
    if (totalMarksMatch) {
        return {
            totalMarks: parseMarksString(totalMarksMatch[1]),
            grade: totalMarksMatch[2]
        };
    }
    else {
        return {
            totalMarks: parseMarksString(totalMarksStr)
        };
    }
}

function parseMarksString(marksStr: string): Marks {
    let score = Number(marksStr.trim());
    let isSpecial = false;
    let specialString;
    if (isNaN(score)) {
        isSpecial = true;
        score = 0;
        specialString = marksStr;
    }
    return {
        score,
        isSpecial,
        specialString
    };
}