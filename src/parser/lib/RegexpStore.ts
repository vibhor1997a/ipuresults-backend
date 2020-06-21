/**
 * We will put all of the parsing regexps' here
 */
export const RegexpStore = {
    subjects: /\d+ (\d+) ?(\S+) ?(.+) ?(\d+) ?(\S+) ?(\S+) ?(\S+) ?(\S+) ?(\S+) ?(\S+) ?(\S+) (\S+)/g,
    institution: /institution.+:\s?(\d+) .+:\s?(.+)/i,
    pageNumber: /page no\.:\s?(\d+)/i,
    students: /(\d{11,11})\s(.+)\s(?:\S+ (\d+))\s(?:\S+ (\d+))\s+((?:\S+?\(.+\)\s+\S+\s+\S+\s+\S+\*?(?:\(.+\))?\s+)+)(\S+)/g,
    students2: /((?:\S{4,4}\d{3,3}\n.+\n.+\n.+\n.+\n)+)(\d{11,11})\n(.+)\n(?:\S+ (\d+))\s(?:\S+ (\d+))\n.+\n(.+)\n/g,
    paperId: /(\S+)\((.+)\)/,
    numCredits:/\((.+)\)/,
    totalMarks: /(\d+)\*? ?\((.+)\)/,
    majorMinor: /(\S+)\s+(\S+)/,
    preparedDate: /result prepared on: (\S+)/i,
    declaredDate: /result declared on: (\S+)/i,
    programme: {
        result: /programme\scode:\s(\S+) programme name:\s(.+)\ssem\.\/year:\s(.+)\sbatch:\s(\S+)\sexamination:\s(.+)/i,
        scheme: /.+:\s?(\d+).+:\s?(.+) schemeid:\s?(\d+).+:\s?(.+)/i
    },
    programme2: {
        result: /programme\scode:\s(\S+) programme name:\s(.+)\ssem\.\/year\/EU:\s(.+)\sbatch:\s(\S+)\sexamination:\s(.+)/i,
        scheme: /.+:\s?(\d+).+:\s?(.+) schemeid:\s?(\d+).+:\s?(.+)/i
    },
    exam: /(.+)\s(\S+),\s?(\d+)/
};