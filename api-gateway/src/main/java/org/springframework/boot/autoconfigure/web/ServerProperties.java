package org.springframework.boot.autoconfigure.web;

public class ServerProperties {
    public ServerProperties() {
    }

    public org.springframework.boot.web.server.Http2 getHttp2() {
        return new org.springframework.boot.web.server.Http2();
    }
}
