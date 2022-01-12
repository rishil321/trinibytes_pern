const cheerio = require("cheerio");
import {
    getCaribbeanJobsPostings,
    getTextContent,
    scrapeFullJobPostData,
    writeLatestCaribbeanJobPostsToDB,
} from "./checkCaribbeanJobs.mjs";
import "regenerator-runtime/runtime";

test("getCaribbeanJobsPostings", () => {
    return getCaribbeanJobsPostings().then((returnValue) => {
        expect(returnValue).toBeInstanceOf(Array);
        expect(returnValue.length > 0).toBeTruthy();
    });
}, 120000);

test("getTextContent", () => {
    const $ = cheerio.load(
        `<!DOCTYPE html><div><p>some test text</p><ul><li>here</li></ul></div>`
    );
    const testElement = $("div");
    const returnValue = getTextContent(testElement[0]);
    expect(typeof returnValue).toBe("string");
    expect(returnValue).toBe("some test text\nhere");
}, 120000);

test("scrapeFullJobPostData", () => {
    const allScrapedJobPosts = [
        {
            jobPostId: 133872,
            jobPostUrl:
                "https://www.caribbeanjobs.com/Head-Chef-Job-133872.aspx?p=1|application_confirmed",
            jobSalary: "Not disclosed",
            jobTitle: "Head Chef",
            jobCompany: "Luna Restaurant",
            jobPostLastUpdated: "2022-01-06T04:00:00.000Z",
            jobLocation: "Port-of-Spain",
            isJobActive: true,
        },
        {
            jobPostId: 133915,
            jobPostUrl: "https://www.caribbeanjobs.com/ACCOUNTANT-Job-133915.aspx",
            jobSalary: "Not disclosed",
            jobTitle: "ACCOUNTANT",
            jobCompany: "VANSAD Automation Ltd",
            jobPostLastUpdated: "2022-01-06T04:00:00.000Z",
            jobLocation: "Couva/PointLisas/Port-of-Spain/SanFernando",
            isJobActive: true,
        },
    ];
    return scrapeFullJobPostData(allScrapedJobPosts).then((returnValue) => {
        expect(returnValue).toBeInstanceOf(Array);
    });
}, 120000);

test("writeLatestCaribbeanJobPostsToDB", () => {
    const fullScrapedJobPosts = [
        {
            "jobPostId": 133872,
            "jobPostUrl": "https://www.caribbeanjobs.com/Head-Chef-Job-133872.aspx?p=1|application_confirmed",
            "jobSalary": "Not disclosed",
            "jobTitle": "Head Chef",
            "jobCompany": "Luna Restaurant",
            "jobPostLastUpdated": "2022-01-06T04:00:00.000Z",
            "jobLocation": "Port-of-Spain",
            "isJobActive": true,
            "jobFullDescription": "\n                                        \nHead Chef\n\n                                    \n\nJob Title: \nHead Chef \nWork Location: \nLuna Restaurant, The Falls at WestMall, Westmoorings, Trinidad \nReports to: \nGroup\n \nGeneral\n \nManager \nRestaurant hours: \nSun – Thurs: \n5.00pm – 11.00pm ; \nFri & Sat: \n \n11.00am – Midnight \n \nAccountability:\nü  Ensure: uniform station setups, food is produced according to recipe & uniform standards\nü  Preparation, costing and development of dessert menus for restaurants\nü  Ensure desserts are prepared in order to meet specified delivery times for grab&go / guests\nü  Open communication channels between culinary and management\nü  Take a proactive approach to handle guest’s complaints & initiate guest recovery\nü  Have an in-depth knowledge of all our menus; implement improvements as necessary\nü  Ensure weekly roster provides necessary coverage & falls within weekly hourly budgets\nü  Ensure that culinary team is aware, understand & comply with the rules and procedures\nü  Ensure all opening, mid and closing shift duties are completed\nü  Ensure staff is fulfilling daily operations specifically cleanliness\nü  Attend all designated management meetings/trainings.\nü  Monitor culinary team performance and suggest improvements for their performance\nü  Observe employees to ensure the safe service of food.\n \nCleanliness / Preparation:\nü  Ensure all staff are working in a clean, sanitary and professional way\nü  Ensure all kitchens are up to health code & HACCP standards are followed\nü  Ensure there are CLEAR daily cleaning / prep duties; with a fair daily rotation\nü  Ensure deep cleaning of kitchens is scheduled weekly\nü  Monitor inventory levels with Purchasing Manager weekly\nü  Ensure safety & sanitation\n \nLeadership: \nü  Be a leader to the Culinary teams – showing / demonstrating best practices\nü  Provide leadership for culinary teams\nü  Update kitchens with new product information / best practices\nü  Provide exceptional food service & timing, thereby setting the standard for all employees\nü  Work busy nights by leading the team to success\nü  Positively recognize culinary that go above and beyond the call of duty\nü  Any other duties that may be assigned.\nRequirements:\nü  Valid Food Badge\nü  Copy of ID (to be attached to application)\nü  Excellent Customer Service Skills\nü  Must have experience working in a kitchen\n \nWe wish to thank you for your interest in joining our dynamic team.\nHowever, only shortlisted candidates will be contacted for interview.\nApplication deadline is Feb 6th 2022.\n\n\n                                ",
            "primaryCategoryName": "hospitality, tourism & catering"
        },
        {
            "jobPostId": 133915,
            "jobPostUrl": "https://www.caribbeanjobs.com/ACCOUNTANT-Job-133915.aspx",
            "jobSalary": "Not disclosed",
            "jobTitle": "ACCOUNTANT",
            "jobCompany": "VANSAD Automation Ltd",
            "jobPostLastUpdated": "2022-01-06T04:00:00.000Z",
            "jobLocation": "Couva/PointLisas/Port-of-Spain/SanFernando",
            "isJobActive": true,
            "jobFullDescription": "\n                                        \nACCOUNTANT\n\n                                    \n\nCAREER \nOPPORTUNITY: ACCOUNTANT \nVANSAD Automation Limited is an Instrumentation and Automation company with operations throughout the Caribbean. The company is seeking to hire a highly motivated and dynamic person for our Accounts Department.\nRequirements:\n The minimum requirements for the position are as follows: \nAt least 10 years experience in a similar position with the following:\nAccounts Receivable\nAccounts Payable\nBank Reconciliations\nPetty Cash Reconciliation\nPayroll\nPreparation of Tax Payments - Payroll, VAT and Corporate\nPreparation of Cashflow Statements\nPreparation of Management Reports\nSuccessfully completed AAT or equivalent or Accounting at A' Levels or CAPE\nSuccessfully completed at least Level 2 ACCA.\nAdvance certificates in Microsoft Excel.\nCertificates in Microsoft Office.\nMust be a Trinidad and Tobago National.\nMust be fully vaccinated against COVID-19. This requirement is to ensure that our employees, customers, suppliers and their families are protected against COVID-19.\nExcellent multi-tasking, verbal and written communication skills.\nAble to work well without supervision and as part of a team.\nSend resumes on or before Friday 21\nst\n January 2022  with Subject: ACCOUNTANT - Trinidad Operations.\n\n\n                                ",
            "primaryCategoryName": "accountancy & finance"
        }
    ];
    return writeLatestCaribbeanJobPostsToDB(fullScrapedJobPosts).then(
        (returnValue) => {
            expect(returnValue).toBeInstanceOf(Array);
            expect(returnValue).toEqual([133872,
                133915]);
        }
    );
});
