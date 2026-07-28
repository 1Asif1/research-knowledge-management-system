package com.clarivate.apigateway.Filter;

import com.clarivate.apigateway.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter {

    @Autowired
    JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().toString();
        HttpMethod method = exchange.getRequest().getMethod();

        if (HttpMethod.OPTIONS.equals(method) || isPublicPath(path, method)) {
            return chain.filter(exchange);
        }

        String header = exchange
                .getRequest()
                .getHeaders()
                .getFirst("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = header.substring(7);
        if (!jwtUtil.validateToken(token)) {
            exchange.getResponse()
                    .setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String role = jwtUtil.extractRole(token);
        if (!isRoleAuthorized(path, role)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

    private boolean isPublicPath(String path, HttpMethod method) {
        if (path.startsWith("/auth")) {
            return true;
        }
        if (path.equals("/users") && HttpMethod.POST.equals(method)) {
            return true;
        }
        return path.equals("/users/login") && HttpMethod.POST.equals(method);
    }

    private boolean isRoleAuthorized(String path, String role) {
        if (path.startsWith("/api/researcher/")) {
            return "RESEARCHER".equals(role) || "EDITOR".equals(role) || "ADMIN".equals(role);
        }
        if (path.startsWith("/api/reviewer/")) {
            return "REVIEWER".equals(role) || "EDITOR".equals(role) || "ADMIN".equals(role);
        }
        if (path.startsWith("/api/editor/")) {
            return "EDITOR".equals(role) || "ADMIN".equals(role);
        }
        if (path.startsWith("/report/")) {
            return "EDITOR".equals(role) || "ADMIN".equals(role);
        }
        return true;
    }
}
