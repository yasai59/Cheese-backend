# generate a dockerfile to build this bun project
FROM oven/bun:1 as base
WORKDIR /usr/src/app

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

CMD ["bun", "run", "index.ts"]