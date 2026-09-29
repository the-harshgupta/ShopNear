package com.retail.platform.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.platform.model.Role;
import com.retail.platform.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private static final long EXPIRATION_TIME_MS = 86400000L * 7; // 7 days
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.jwt.secret}")
    private String secretKey;

    public String generateToken(User user, Long storeId) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + EXPIRATION_TIME_MS;

            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", user.getId());
            payload.put("sub", user.getEmail());
            payload.put("email", user.getEmail());
            payload.put("name", user.getFullName());
            payload.put("role", user.getRole().name());
            if (storeId != null) {
                payload.put("storeId", storeId);
            }
            payload.put("iat", now / 1000);
            payload.put("exp", exp / 1000);

            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsString(header).getBytes(StandardCharsets.UTF_8));
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsString(payload).getBytes(StandardCharsets.UTF_8));

            String content = encodedHeader + "." + encodedPayload;
            String signature = sign(content, secretKey);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) return false;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String content = parts[0] + "." + parts[1];
            String expectedSignature = sign(content, secretKey);
            if (!MessageDigest.isEqual(parts[2].getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                return false;
            }

            Map<String, Object> claims = getClaims(token);
            if (claims == null) return false;

            Number expNumber = (Number) claims.get("exp");
            if (expNumber != null && (expNumber.longValue() * 1000) < System.currentTimeMillis()) {
                return false; // Token expired
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getClaims(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return objectMapper.readValue(decoded, Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Long getUserId(String token) {
        Map<String, Object> claims = getClaims(token);
        if (claims == null || !claims.containsKey("userId")) return null;
        Number n = (Number) claims.get("userId");
        return n != null ? n.longValue() : null;
    }

    public String getEmail(String token) {
        Map<String, Object> claims = getClaims(token);
        return claims != null ? (String) claims.get("email") : null;
    }

    public Role getRole(String token) {
        Map<String, Object> claims = getClaims(token);
        if (claims == null || !claims.containsKey("role")) return null;
        return Role.fromString((String) claims.get("role"));
    }

    public Long getStoreId(String token) {
        Map<String, Object> claims = getClaims(token);
        if (claims == null || !claims.containsKey("storeId")) return null;
        Number n = (Number) claims.get("storeId");
        return n != null ? n.longValue() : null;
    }

    private String sign(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(rawHmac);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
