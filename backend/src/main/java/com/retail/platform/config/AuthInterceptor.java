package com.retail.platform.config;

import com.retail.platform.model.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtTokenProvider tokenProvider;

    public AuthInterceptor(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String uri = request.getRequestURI();

        // Public auth endpoints, uploads, & H2 console
        if (uri.startsWith("/api/auth/") || uri.startsWith("/uploads/") || uri.startsWith("/h2-console")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }

        if (token != null && tokenProvider.validateToken(token)) {
            Long userId = tokenProvider.getUserId(token);
            String email = tokenProvider.getEmail(token);
            Role role = tokenProvider.getRole(token);
            Long storeId = tokenProvider.getStoreId(token);

            request.setAttribute("auth_user_id", userId);
            request.setAttribute("auth_email", email);
            request.setAttribute("auth_role", role);
            request.setAttribute("auth_store_id", storeId);

            // Role-based Path Enforcement
            if (uri.startsWith("/api/admin/")) {
                if (role != Role.ADMIN) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"403 Forbidden: Access Denied. Admin role required.\"}");
                    return false;
                }
            } else if (uri.startsWith("/api/manager/")) {
                if (role != Role.SUPERMARKET_MANAGER && role != Role.ADMIN) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"403 Forbidden: Access Denied. Supermarket Manager role required.\"}");
                    return false;
                }
            } else if (uri.startsWith("/api/shopkeeper/")) {
                if (role != Role.SHOPKEEPER && role != Role.ADMIN) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"403 Forbidden: Access Denied. Shopkeeper role required.\"}");
                    return false;
                }
            }

            return true;
        }

        // If trying to access protected /api/admin/**, /api/manager/**, /api/shopkeeper/** without valid token
        if (uri.startsWith("/api/admin/") || uri.startsWith("/api/manager/") || uri.startsWith("/api/shopkeeper/")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"401 Unauthorized: Authentication token required.\"}");
            return false;
        }

        // Public browse endpoints for general store catalog
        return true;
    }
}
