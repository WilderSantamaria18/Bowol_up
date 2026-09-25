# ============================================================
# STAGE 1: Build
# ============================================================
FROM maven:3-eclipse-temurin-26-alpine AS build

WORKDIR /app

# Aprovechar cache de capas con pom.xml
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilar sin tests (los tests se ejecutan en CI)
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# STAGE 2: Runtime
# ============================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN apk add --no-cache curl tzdata && \
    addgroup -S bowol && \
    adduser -S bowol -G bowol

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

USER bowol

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-XX:+UseG1GC", \
    "-XX:+ExitOnOutOfMemoryError", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
