# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy the rest of the application
COPY . .

# generate Prisma client
RUN bunx prisma generate

# set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# expose the port
EXPOSE 3000

# start the application
CMD ["bun", "run", "dev"]