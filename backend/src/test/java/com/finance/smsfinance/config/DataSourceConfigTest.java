package com.finance.smsfinance.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.*;

class DataSourceConfigTest {

    @Test
    @DisplayName("Should successfully parse Render PostgreSQL internal and external URL formats")
    void testParseRenderPostgreSqlUrl() throws Exception {
        // Render external format: postgres://user:pass@dpg-xxx-a.singapore-postgres.render.com:5432/sms_db
        String cloudUrl = "postgres://sms_user:secret_pass_123@dpg-cz7abcdefgh-a.singapore-postgres.render.com:5432/sms_finance";
        
        String parseable = "http://" + cloudUrl.substring("postgres://".length());
        URI uri = new URI(parseable);
        
        assertEquals("sms_user:secret_pass_123", uri.getUserInfo());
        assertEquals("dpg-cz7abcdefgh-a.singapore-postgres.render.com", uri.getHost());
        assertEquals(5432, uri.getPort());
        assertEquals("/sms_finance", uri.getPath());
    }

    @Test
    @DisplayName("Should parse Render PostgreSQL internal URL format without port")
    void testParseRenderInternalUrlWithoutPort() throws Exception {
        // Render internal format: postgresql://finance_user:pass123@dpg-cz7abcdefgh-a/finance_service
        String internalUrl = "postgresql://finance_user:pass123@dpg-cz7abcdefgh-a/finance_service";

        String parseable = "http://" + internalUrl.substring("postgresql://".length());
        URI uri = new URI(parseable);

        assertEquals("finance_user:pass123", uri.getUserInfo());
        assertEquals("dpg-cz7abcdefgh-a", uri.getHost());
        assertEquals(-1, uri.getPort());
        assertEquals("/finance_service", uri.getPath());
    }
}
