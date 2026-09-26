package com.bowol.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Anotación para interceptar y registrar automáticamente operaciones críticas
 * en el registro de auditoría empresarial (Audit Logs).
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditedAction {

    /**
     * Tipo de acción ejecutada (ej. PROJECT_CREATE, ROLE_UPDATE, API_KEY_GENERATE)
     */
    String action();

    /**
     * Tipo de entidad o recurso afectado (ej. PROJECT, USER, ORGANIZATION, API_KEY, WEBHOOK)
     */
    String entityType();

    /**
     * Expresión SpEL opcional o clave para extraer el identificador del recurso, o cadena fija.
     */
    String entityIdParam() default "";

    /**
     * Descripción legible del evento auditado.
     */
    String description() default "";
}
