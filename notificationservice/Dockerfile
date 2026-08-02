FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY userservice/pom.xml userservice/
COPY notificationservice/pom.xml notificationservice/
COPY api-gateway/pom.xml api-gateway/
COPY PaperService/pom.xml PaperService/
COPY AuthServiceD/pom.xml AuthServiceD/
COPY ReviewService/pom.xml ReviewService/
COPY ReportService/pom.xml ReportService/

COPY notificationservice/src notificationservice/src

RUN mvn -f notificationservice/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/notificationservice/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java", "-jar", "app.jar"]
