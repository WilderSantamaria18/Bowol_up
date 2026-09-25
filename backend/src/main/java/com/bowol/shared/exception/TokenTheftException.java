package com.bowol.shared.exception;

public class TokenTheftException extends BowolException {
    public TokenTheftException(String message) {
        super("AUTH_TOKEN_THEFT_DETECTED", message, 401);
    }
}
