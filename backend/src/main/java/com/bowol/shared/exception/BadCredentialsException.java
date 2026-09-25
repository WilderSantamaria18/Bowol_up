package com.bowol.shared.exception;

public class BadCredentialsException extends BowolException {
    public BadCredentialsException(String message) {
        super("AUTH_INVALID_CREDENTIALS", message, 401);
    }
}
