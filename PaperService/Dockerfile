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

COPY PaperService/src PaperService/src

RUN mvn -f PaperService/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/PaperService/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
