package com.finance.smsfinance.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Robust cloud and local PostgreSQL DataSource configuration.
 * Automatically adapts Render/Railway/Supabase 'postgres://' or 'postgresql://' URLs
 * into valid JDBC URLs with Hikari connection pooling.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/finance_service}")
    private String defaultUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String envSpringUrl = System.getenv("SPRING_DATASOURCE_URL");
        String envDbUrl = System.getenv("DATABASE_URL");

        String effectiveUrl = (envSpringUrl != null && !envSpringUrl.isBlank())
                ? envSpringUrl
                : ((envDbUrl != null && !envDbUrl.isBlank()) ? envDbUrl : defaultUrl);

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setDriverClassName(driverClassName);

        // Check if URL is in cloud URI format (postgres:// or postgresql:// without jdbc:)
        if (effectiveUrl.startsWith("postgres://") || (effectiveUrl.startsWith("postgresql://") && !effectiveUrl.startsWith("jdbc:"))) {
            try {
                // Normalize scheme so java.net.URI can parse it properly
                String uriString = effectiveUrl;
                if (uriString.startsWith("postgres://")) {
                    uriString = "postgresql://" + uriString.substring("postgres://".length());
                }

                // Temporary replace scheme to http for reliable parsing with standard java.net.URI
                String parseableUriString = "http://" + uriString.substring("postgresql://".length());
                URI uri = new URI(parseableUriString);

                String userInfo = uri.getUserInfo();
                String username = defaultUsername;
                String password = defaultPassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] userParts = userInfo.split(":", 2);
                    username = userParts[0];
                    password = userParts[1];
                }

                String host = uri.getHost();
                int port = (uri.getPort() == -1) ? 5432 : uri.getPort();
                String path = uri.getPath(); // e.g. "/dbname"
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + path;
                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    jdbcUrl += "?" + query;
                }

                log.info("Successfully converted Cloud DATABASE_URL to JDBC for host: {}:{}, database: {}", host, port, path);

                hikariConfig.setJdbcUrl(jdbcUrl);
                hikariConfig.setUsername(username);
                hikariConfig.setPassword(password);
            } catch (Exception e) {
                log.warn("Could not parse cloud DATABASE_URL as URI ({}), falling back to direct string", e.getMessage());
                hikariConfig.setJdbcUrl(effectiveUrl.startsWith("jdbc:") ? effectiveUrl : "jdbc:" + effectiveUrl);
                hikariConfig.setUsername(defaultUsername);
                hikariConfig.setPassword(defaultPassword);
            }
        } else {
            // Standard JDBC URL (e.g. jdbc:postgresql://...)
            String username = System.getenv("SPRING_DATASOURCE_USERNAME") != null
                    ? System.getenv("SPRING_DATASOURCE_USERNAME")
                    : defaultUsername;
            String password = System.getenv("SPRING_DATASOURCE_PASSWORD") != null
                    ? System.getenv("SPRING_DATASOURCE_PASSWORD")
                    : defaultPassword;

            hikariConfig.setJdbcUrl(effectiveUrl);
            hikariConfig.setUsername(username);
            hikariConfig.setPassword(password);
        }

        // Connection pool configurations for cloud environments
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setIdleTimeout(30000);
        hikariConfig.setMaxLifetime(600000);
        hikariConfig.setConnectionTimeout(20000);

        return new HikariDataSource(hikariConfig);
    }
}
