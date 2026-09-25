package com.bowol.shared.exception;

public class BadRequestException extends BowolException {
    public BadRequestException(String code, String message) {
        super(code, message, 400);
    }
}
