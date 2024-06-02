# generate a dockerfile to build this bun project
FROM oven/bun:1
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN bun install

COPY . .

ENV PORT=${PORT}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV JWT_SECRET=${JWT_SECRET}
ENV DB_HOST=${DB_HOST}
ENV DB_POST=${DB_POST}
ENV DB_USER=${DB_USER}
ENV DB_PASS=${DB_PASS}
ENV DB_NAME=${DB_NAME}
ENV CLIENT_ID_APP=${CLIENT_ID_APP}

RUN bun install

EXPOSE ${PORT}

CMD ["bun", "run", "index.ts"]