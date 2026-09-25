package com.bowol.shared.exception;

public class TokenException extends BowolException {
    public TokenException(String code, String message) {
        super(code, message, 401);
    }
}
