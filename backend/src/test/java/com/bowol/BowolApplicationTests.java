package com.bowol;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("BowolApplication Context Integration Test")
class BowolApplicationTests {

    @Test
    @DisplayName("Debe cargar el ApplicationContext de Spring Boot exitosamente")
    void contextLoads() {
        assertTrue(true, "El contexto de Spring Boot ha cargado correctamente");
    }
}
