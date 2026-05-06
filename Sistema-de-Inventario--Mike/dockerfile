FROM maven:3.9.8-eclipse-temurin-17 AS build

WORKDIR /app

COPY SistemaInventario/.mvn .mvn
COPY SistemaInventario/mvnw mvnw
COPY SistemaInventario/pom.xml pom.xml
COPY SistemaInventario/src src

RUN chmod +x mvnw && ./mvnw -DskipTests clean package

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /app/target/SistemaInventario-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]