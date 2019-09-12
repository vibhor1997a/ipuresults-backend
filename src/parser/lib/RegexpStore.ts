/**
 * We will put all of the parsing regexps' here
 */
export const RegexpStore = {
    subjects: /\d+ (\d+) (\S+) (.+) (\d+) (\S+) (\S+) (\S+) (\S+) (\d+) (\d+) (\d+) (\d+)/g,
    institution: /institution.+:\s?(\d+) .+:\s?(.+)/i,
    pageNumber: /page no\.:\s?(\d+)/i,
    students: /(\d{11,11})\s(.+)\s(?:\S+ (\d+))\s(?:\S+ (\d+))\s+((?:\S+?\(.+\)\s+\S+\s+\S+\s+\S+\*?\(.+\)\s+)+)(\S+)/g,
    paperId: /(\S+)\((.+)\)/,
    totalMarks: /(\S+)\*?\((.+)\)/,
    majorMinor: /(\S+)\s+(\S+)/,
    preparedDate: /result prepared on: (\S+)/i,
    declaredDate: /result declared on: (\S+)/i,
    programme: {
        result: /programme\scode:\s(\S+) programme name:\s(.+)\ssem\.\/year:\s(.+)\sbatch:\s(\S+)\sexamination:\s(.+)/i,
        scheme: /.+:\s?(\d+).+:\s?(.+) schemeid:\s?(\d+).+:\s?(.+)/i
    },
    exam: /(.+)\s(\S+),\s?(\d+)/
};