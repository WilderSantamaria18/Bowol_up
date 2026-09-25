package com.bowol.shared.exception;

public class NotFoundException extends BowolException {
    public NotFoundException(String message) {
        super("NOT_FOUND", message, 404);
    }

    public NotFoundException(String code, String message) {
        super(code, message, 404);
    }
}
