import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class CaribbeanJobPost {

    @PrimaryGeneratedColumn()
    id = undefined;

    @Column("int")
    jobPostId = undefined;

    @Column("varchar")
    jobPostUrl = "";

    @Column("varchar")
    jobSalary = "";

    @Column("varchar")
    jobTitle = "";

    @Column("varchar")
    jobCompany = "";

    @Column("date")
    jobPostLastUpdated = undefined;

    @Column("varchar")
    jobFullDescription = "";

    @Column("date")
    listingDate = undefined;

    @Column("date")
    deListingDate = undefined;

    @Column("boolean")
    isJobActive = true;

    @Column("varchar")
    primaryCategoryName = "";
}