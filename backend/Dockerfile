# ==============================================================================
# SMS Finance Service - Production Multi-Stage Dockerfile
# Stage 1: Build JAR with Maven & OpenJDK 17
# Stage 2: Minimal, secure slim runtime with non-root execution
# ==============================================================================

# -----------------
# 1. BUILD STAGE
# -----------------
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /build

# Cache maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and compile production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# -----------------
# 2. RUNTIME STAGE
# -----------------
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install curl for cloud container health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Create dedicated non-root application user & group
RUN groupadd -r spring && useradd -r -g spring spring

# Create uploads directory for deed scans and set permissions
RUN mkdir -p /app/uploads/collateral && chown -R spring:spring /app

# Copy executable jar from builder stage
COPY --from=builder /build/target/*.jar app.jar
RUN chown spring:spring app.jar

USER spring:spring

EXPOSE 8080

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
