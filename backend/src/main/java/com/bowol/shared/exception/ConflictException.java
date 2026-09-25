package com.bowol.shared.exception;

public class ConflictException extends BowolException {
    public ConflictException(String code, String message) {
        super(code, message, 409);
    }
}
