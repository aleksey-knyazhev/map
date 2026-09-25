FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /workspace

COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle

RUN chmod +x ./gradlew

COPY src ./src

RUN ./gradlew --no-daemon installDist -x test

FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

COPY --from=build /workspace/build/install/map ./

EXPOSE 8080

ENTRYPOINT ["/app/bin/map"]
