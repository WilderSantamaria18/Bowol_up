package com.bowol.shared.exception;

import lombok.Getter;

@Getter
public abstract class BowolException extends RuntimeException {
    private final String code;
    private final int status;

    public BowolException(String code, String message, int status) {
        super(message);
        this.code = code;
        this.status = status;
    }
}
