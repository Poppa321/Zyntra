# --- Build stage -----------------------------------------------------------
# Uses the official Maven image (bundled Maven) rather than the mvnw wrapper's
# self-download — avoids the wrapper needing to fetch the Maven distribution
# zip at build time, which is one less network dependency during the build.
FROM maven:3.9-eclipse-temurin-26-alpine AS build
WORKDIR /app

# Cache dependency resolution separately from source changes.
COPY pom.xml ./
RUN mvn -q -B dependency:go-offline

COPY src/ src/
RUN mvn -q -B clean package -DskipTests \
    && mv target/*.jar target/app.jar

# --- Runtime stage -----------------------------------------------------------
FROM eclipse-temurin:26-jre-alpine AS runtime
WORKDIR /app

RUN addgroup -S zyntra && adduser -S zyntra -G zyntra
COPY --from=build /app/target/app.jar app.jar
USER zyntra

# Render sets $PORT at runtime; application.yaml reads it via server.port=${PORT:8080}.
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
