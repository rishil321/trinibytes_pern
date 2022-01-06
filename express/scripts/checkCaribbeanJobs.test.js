const getCaribbeanJobsPostings = require("./checkCaribbeanJobs");

test('Checks the getCaribbeanJobsPostings function', () => {
    getCaribbeanJobsPostings().then( returnValue => {
        expect(returnValue).toBeInstanceOf(Array);
        expect(returnValue.length >0).toBeTruthy();
    });
});