package com.retail.platform.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Lets React Router handle direct visits to client-side routes in the deployed
 * single-page application. API and static-resource requests are unaffected.
 */
@Controller
public class SpaController {

    @GetMapping({
            "/login",
            "/register",
            "/unauthorized",
            "/customer/**",
            "/shopkeeper/**",
            "/manager/**",
            "/admin/**"
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
