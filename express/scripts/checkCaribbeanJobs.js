#!/usr/bin/env node

/*
 *This script scrapes the CaribbeanJobs website and returns a list of all jobs currently listed
 */
/*
Script requires/imports
*/
const winston = require("winston");
const { format } = winston;
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const jsdom = require("jsdom");
const expressModels = require("../models");
const CaribbeanJobsPost = expressModels.CaribbeanJobsPost;
const moment = require("moment");

/*
Class declarations
*/

/*
Function declarations
*/

/**
 *
 * @returns promise, which will asynchronously return an array loadedcheerio objects, with each object holding a job posting
 */
async function getCaribbeanJobsPostings() {
  const url =
    "https://www.caribbeanjobs.com/ShowResults.aspx?Keywords=&autosuggestEndpoint=%2fautosuggest&Location=124&Category=&Recruiter=Company%2cAgency&btnSubmit=Search&PerPage=100&Page=";
  //set up the http agent to connect
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  //perform the http get request for each page
  //set up some variables to iterate through each job posting page for T&T jobs
  //until we don't get any more postings
  let moreJobPostingsAvailable = true;
  let pageNum = 1;
  let allJobPosts = [];
  while (moreJobPostingsAvailable) {
    const pageNumUrl = url + pageNum;
    await axiosInstance
      .get(pageNumUrl)
      .then((response) => {
        //then get the important data
        const $ = cheerio.load(response.data);
        const jobPostsInPage = $(
          "div.two-thirds > div.module.job-result> div.module-content"
        );
        logger.debug(
          `Jobs fetched successfully from CaribbeanJobs from page ${pageNum}`
        );
        if (response.status === 200 && jobPostsInPage.length > 0) {
          logger.debug("Now trying to parse data from all job posts in page.");
          // use the cheerio DOM to find all the data that we need from each object in the LoadedCheerio array
          for (let jobPosting of jobPostsInPage) {
            try {
              const parsedJobPost = {
                jobPostId: parseInt(
                  $(jobPosting)
                    .children("div")
                    .children("div")
                    .children("h2")
                    .children("a")[0].attribs.jobid
                ),
                jobPostUrl:
                  "https://www.caribbeanjobs.com" +
                  $(jobPosting)
                    .children("div")
                    .children("div")
                    .children("h2")
                    .children("a")[0].attribs.href,
                jobSalary: $(jobPosting)
                  .children("div")
                  .children("ul")
                  .children("li.salary")
                  .text(),
                jobTitle: $(jobPosting)
                  .children("div")
                  .children("div")
                  .children("h2")
                  .children("a")
                  .text(),
                jobCompany: $(jobPosting)
                  .children("div")
                  .children("div")
                  .children("h3")
                  .children("a")
                  .text(),
                jobPostLastUpdated: $(jobPosting)
                  .children("div")
                  .children("ul")
                  .children("li.updated-time")
                  .text()
                  .replace("Updated ", ""),
                jobLocation: $(jobPosting)
                  .children("div")
                  .children("ul")
                  .children("li.location")
                  .text()
                  .replace(/\s+/g, ""),
                  isJobActive: true,
              };
              const parsedDate = moment(
                parsedJobPost.jobPostLastUpdated,
                "DD/MM/YYYY"
              );
              if (parsedDate.isValid()) {
                parsedJobPost.jobPostLastUpdated = parsedDate.toDate();
              } else {
                parsedJobPost.jobPostLastUpdated = moment().toDate();
              }
              allJobPosts.push(parsedJobPost);
              logger.debug("Successfully added job: %j", parsedJobPost);
            } catch (err) {
              logger.error(err);
            }
          }
          pageNum++;
        } else {
          moreJobPostingsAvailable = false;
        }
      })
      .catch(function (err) {
        //handle error
        logger.error(err);
      });
  }
  logger.debug(
    "Fetched all current job postings from CaribbeanJobs successfully."
  );
  return allJobPosts;
}
module.exports = getCaribbeanJobsPostings;

function getTextContent(element) {
  /*
        Iterate over all child elements of this element
        and extract the text content
         */
  try {
    let text = [];
    for (let i = 0, n = element.children.length; i < n; i++) {
      let child = element.children[i];
      if (child.nodeType === 1) text.push(getTextContent(child));
      else if (child.nodeType === 3) text.push(child.data);
    }
    return text.join("\n");
  } catch (err) {
    logger.error(err);
  }
}

/**
 * This function goes to the URL of each job post
 * and fetches more info about each post
 * @param allScrapedJobPosts
 */
async function scrapeFullJobPostData(allScrapedJobPosts) {
  //set up the http agent to connect
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });
  //iterate over each job post
  logger.debug("Now getting full job description for each post.");
  for (let jobPost of allScrapedJobPosts) {
    await axiosInstance
      .get(jobPost.jobPostUrl)
      .then((response) => {
        //then get the important data
        const $ = cheerio.load(response.data);
        if (response.status === 200) {
          logger.debug(
            `Full details fetched successfully from CaribbeanJobs for job post ${jobPost.jobTitle} from ${jobPost.jobCompany}`
          );
          const jobDescriptionNode = $(
            "div.job-description > span.cta-desc > span > div.job-details"
          );
          // we need to iterate over each child node in this large jobDescriptionNode and append to a string for the full description
          let textContent = getTextContent(jobDescriptionNode[0]);
          jobPost["jobFullDescription"] = textContent;
        }
        const caribbeanJobsMetaData = JSON.parse($("script[language]")[0].children[0].data.replace(/\n|\r/g,'').split("=")[1].split(";")[0].replace(", }","}"));
        if ("job__primary_category_name" in caribbeanJobsMetaData){
          logger.debug("Primary category name found in job post");
          jobPost["primaryCategoryName"] = caribbeanJobsMetaData["job__primary_category_name"];
        }
        else{
          logger.debug("Primary category name not found");
        }
        logger.debug(
            `Full details parsed successfully from CaribbeanJobs for job post ${jobPost.jobTitle} from ${jobPost.jobCompany}`
        );
      })
      .catch(function (err) {
        //handle error
        logger.error(err);
      });
  }
  return allScrapedJobPosts;
}

async function writeLatestCaribbeanJobPostsToDB(latestFullCaribbeanJobPosts) {
    //set up an array to track all the jobPostIds that were scraped from caribbeanjobs
    const jobPostIDsScraped = [];
  for (let jobPost of latestFullCaribbeanJobPosts) {
      jobPostIDsScraped.push(jobPost.jobPostId);
    //check if job has already been inserted into database
    const existingJob = await CaribbeanJobsPost.findOne({
      where: {
        jobTitle: jobPost.jobTitle,
        jobCompany: jobPost.jobCompany,
      },
    });
    // if the job doesn't already exist
    if (existingJob === null) {
      logger.debug("Job doesn't already exist. Creating in db.");
      //set the listing date to now
      jobPost.listingDate = moment().toDate();
      await CaribbeanJobsPost.create(jobPost)
        .then((data) => {
          logger.debug(
            `Job post inserted successfully into db: ${jobPost.jobTitle} from ${jobPost.jobCompany}`
          );
        })
        .catch((err) => {
          logger.error(
            err.name +
              ": " +
              err.message +
              `. Could not insert job into db: ${jobPost.jobTitle} from ${jobPost.jobCompany}`
          );
        });
    } else {
      logger.debug("Job already exists. Updating in db");
      await CaribbeanJobsPost.update(
        {
          jobPostUrl: jobPost.jobPostUrl,
          jobSalary: jobPost.jobSalary,
          jobTitle: jobPost.jobTitle,
          jobCompany: jobPost.jobCompany,
          jobPostLastUpdated: jobPost.jobPostLastUpdated,
          jobLocation: jobPost.jobLocation,
          jobFullDescription: jobPost.jobFullDescription,
        },
        {
          where: { jobTitle: jobPost.jobTitle, jobCompany: jobPost.jobCompany },
        }
      )
        .then((data) => {
          logger.debug(
            `Job post updated successfully in db: ${jobPost.jobTitle} from ${jobPost.jobCompany}`
          );
        })
        .catch((err) => {
          logger.error(
            err.name +
              ": " +
              err.message +
              `. Could not update job in db: ${jobPost.jobTitle} from ${jobPost.jobCompany}`
          );
        });
    }
  }
  return jobPostIDsScraped;
}

async function checkForDelistedJobs(jobPostIDsScraped){
    //check which jobs in the db are no longer listed, according to this latest list of jobs
    const allJobsInDB = await CaribbeanJobsPost.findAll();
    for (const dbJob of allJobsInDB){
        if (jobPostIDsScraped.indexOf(dbJob.jobPostId) === -1){
            logger.debug(`Job post ${dbJob.jobTitle} from ${dbJob.jobCompany} is no longer actively listed`);
            //we need to set the delisting date to today and falsify the isjobactive bool
            dbJob.isJobActive = false;
            dbJob.delistingDate = moment().toDate();
            await dbJob.save();
        }
        else{
            logger.debug(`Job post ${dbJob.jobTitle} from ${dbJob.jobCompany} is still actively listed`);
        }
    }
}
/*
Main script logic
*/
async function main () {
//now read the latest CaribbeanJobs data
    getCaribbeanJobsPostings().then((allCurrentCaribbeanJobsPostings) => {
        // then get the full job description of all jobs
        scrapeFullJobPostData(allCurrentCaribbeanJobsPostings).then(
            (allCurrentJobPostings) => {
                //then write the jobs to the db
                writeLatestCaribbeanJobPostsToDB(allCurrentJobPostings).then((jobPostIDsScraped) => {
                    checkForDelistedJobs(jobPostIDsScraped).then(() => {
                        //then go through all jobs in the db, and check if any have been delisted
                        logger.info("Script completed successfully.");
                        return 0;
                    });

                });
            }
        );
    });
}

//set up the logger in the global scope
const logger = winston.createLogger({
    level: "debug",
    format: format.combine(
        format.splat(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.prettyPrint(),
        winston.format.colorize()
    ),
    transports: [new winston.transports.File({ filename: "checkCaribbeanJobs.log" })],
});
//
// If we're not in production then log to the console with the format:
// ${info.level}: ${info.message} JSON.stringify({ ...rest })
//
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}
// call the main function to run the script
main();
