package com.bowol.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.*;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BowolException.class)
    public ResponseEntity<Map<String, Object>> handleBowolException(
            BowolException ex, HttpServletRequest request, HttpServletResponse response) {

        log.warn("Excepción de negocio [{}]: {}", ex.getCode(), ex.getMessage());
        HttpStatus status = HttpStatus.valueOf(ex.getStatus());

        Map<String, Object> body = buildProblemDetail(
                "https://api.bowol.com/errors/" + ex.getCode().toLowerCase().replace("_", "-"),
                status.getReasonPhrase(),
                status.value(),
                ex.getMessage(),
                request.getRequestURI(),
                response.getHeader("X-Trace-Id")
        );
        body.put("code", ex.getCode());

        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request, HttpServletResponse response) {

        List<Map<String, String>> fieldErrors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            Map<String, String> err = new HashMap<>();
            err.put("field", fe.getField());
            err.put("code", fe.getCode());
            err.put("message", fe.getDefaultMessage());
            fieldErrors.add(err);
        }

        Map<String, Object> body = buildProblemDetail(
                "https://api.bowol.com/errors/validation-failed",
                "Validation Failed",
                HttpStatus.BAD_REQUEST.value(),
                "Uno o más campos contienen errores de validación",
                request.getRequestURI(),
                response.getHeader("X-Trace-Id")
        );
        body.put("code", "VALIDATION_FAILED");
        body.put("errors", fieldErrors);

        return ResponseEntity.badRequest().contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request, HttpServletResponse response) {

        Map<String, Object> body = buildProblemDetail(
                "https://api.bowol.com/errors/forbidden",
                "Forbidden",
                HttpStatus.FORBIDDEN.value(),
                "No tiene autorización para acceder a este recurso",
                request.getRequestURI(),
                response.getHeader("X-Trace-Id")
        );
        body.put("code", "ACCESS_DENIED");

        return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception ex, HttpServletRequest request, HttpServletResponse response) {

        log.error("Error no controlado en [{}]: ", request.getRequestURI(), ex);

        Map<String, Object> body = buildProblemDetail(
                "https://api.bowol.com/errors/internal",
                "Internal Server Error",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ha ocurrido un error interno en el servidor",
                request.getRequestURI(),
                response.getHeader("X-Trace-Id")
        );
        body.put("code", "INTERNAL_ERROR");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.APPLICATION_PROBLEM_JSON).body(body);
    }

    private Map<String, Object> buildProblemDetail(
            String type, String title, int status, String detail, String instance, String traceId) {

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("type", type);
        map.put("title", title);
        map.put("status", status);
        map.put("detail", detail);
        map.put("instance", instance);
        map.put("timestamp", Instant.now().toString());
        map.put("traceId", traceId != null ? traceId : UUID.randomUUID().toString());
        return map;
    }
}
