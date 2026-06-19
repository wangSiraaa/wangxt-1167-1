FROM maven:3.8.6-openjdk-8-slim AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

FROM openjdk:8-jre-slim

WORKDIR /app

RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Shanghai

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 19467

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
