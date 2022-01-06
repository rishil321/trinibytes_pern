module.exports = (sequelize, Sequelize) => {
    const CaribbeanJobsPost = sequelize.define("CaribbeanJobsPost", {
        jobPostId: {
            type: Sequelize.INTEGER
        },
        jobPostUrl: {
            type: Sequelize.STRING
        },
        jobSalary: {
            type: Sequelize.STRING
        },
        jobTitle: {
            type: Sequelize.STRING
        },
        jobCompany: {
            type: Sequelize.STRING
        },
        jobPostLastUpdated: {
            type: Sequelize.DATE
        },
        jobLocation: {
            type: Sequelize.STRING
        },
        jobFullDescription:{
            type:Sequelize.TEXT
        },
        listingDate:{
            type:Sequelize.DATE
        },
        delistingDate:{
            type:Sequelize.DATE
        },
        isJobActive:{
            type:Sequelize.BOOLEAN
        },
        primaryCategoryName:{
            type:Sequelize.STRING
        }
    });

    return CaribbeanJobsPost;
};