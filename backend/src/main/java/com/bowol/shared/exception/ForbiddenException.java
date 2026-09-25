package com.bowol.shared.exception;

public class ForbiddenException extends BowolException {
    public ForbiddenException(String message) {
        super("FORBIDDEN", message, 403);
    }

    public ForbiddenException(String code, String message) {
        super(code, message, 403);
    }
}
