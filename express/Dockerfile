FROM node:17-bullseye as base

WORKDIR /app

# install the required packages
RUN apt-get update && apt-get install -y cron rsyslog
# copy crontab which also won't change frequently
#RUN echo "*/1 * * * * root node /app/express/scripts/checkCaribbeanJobs.js >> /var/log/cron.log 2>&1 \n" >> /etc/crontab
COPY express/scripts/crontab /etc/cron.d/crontab
# install the crontab
RUN touch /var/log/cron.log && chmod 0755 /etc/cron.d/crontab && crontab /etc/cron.d/crontab
# copy express packages which won't change frequently
COPY express/package.json express/package-lock.json ./
# install the node packages that we require
RUN npm install
# If you are building your code for production
# RUN npm install/ci --only=production

# copy source files will will change more frequently
COPY . .

# Run these command on container startup
CMD rsyslogd && cron -L15 && node ./express/bin/www && tail -f /var/log/syslog
#CMD ["node", "./express/bin/www"]