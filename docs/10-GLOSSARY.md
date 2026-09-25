# 10 - Glosario Canónico de Términos: BOWOL Platform

> **Definiciones Oficiales de Dominio, Arquitectura, Datos y Seguridad**
>
> v1.0 · Última actualización: 2026-01-XX · Autor: Equipo BOWOL · Estado: Aprobado

---

## 1. Términos de Dominio y Negocio

### AI Business Copilot
Asistente estratégico de IA especializado en comprender el contexto corporativo de una empresa, diagnosticar su mercado, correlacionar tendencias y formular planes de ejecución validados. No es un chat libre ni un wrapper genérico.

### Business Profile (Perfil de Negocio)
Entidad central que encapsula el contexto estratégico inmutable de una organización (industria, mercado objetivo, tamaño de equipo, desafíos críticos, metas, canales de distribución, stack técnico y nivel de madurez digital e IA). Es el insumo principal de *grounding* para todos los análisis de IA.

### Dynamic SWOT (FODA Dinámico)
Matriz estratégica de Fortalezas, Oportunidades, Debilidades y Amenazas generada por IA a partir del `BusinessProfile` y respaldada por tendencias y fuentes externas comprobables mediante enlaces de evidencia (`evidence_refs`).

### Opportunity Engine
Motor de identificación y priorización de iniciativas derivadas del FODA y de las tendencias del mercado. Aplica el modelo algorítmico **RICE** para ordenar objetivamente las oportunidades según su retorno esperado y factibilidad operativa.

### RICE Scoring
Modelo formal de priorización:
$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$
- **Reach (Alcance):** Estimación de usuarios o procesos impactados (0-100).
- **Impact (Impacto):** Grado de beneficio en el negocio (0-100).
- **Confidence (Confianza):** Certeza en los datos y análisis (0-100).
- **Effort (Esfuerzo):** Dificultad, tiempo o costo de implementación (1-100).

### Hypothesis (Hipótesis)
Suposición estructurada y comprobable derivada de una oportunidad estratégica. Define una declaración de valor, un método de validación, una métrica de éxito y un valor objetivo antes de comprometer recursos de desarrollo.

### Experiment (Experimento)
Iniciativa práctica y de corta duración (1 a 4 semanas) diseñada para validar o refutar una hipótesis en el mercado real mediante prototipos, MVPs o pruebas de concepto.

### Learning Loop (Ciclo de Aprendizaje)
Cierre del flujo estratégico donde los resultados y métricas reales de los experimentos completados retroalimentan el `BusinessProfile` y calibran los futuros análisis predictivos de la plataforma.

### TrendScore (Índice de Señal de Tendencia)
Puntuación algorítmica interna (0 a 100) que mide la tracción de una tendencia tecnológica evaluando volumen, velocidad de crecimiento, engagement y diversidad de fuentes verificadas.

---

## 2. Términos de Arquitectura y Backend

### Modular Monolith (Monolito Modular)
Patrón arquitectónico donde el sistema se compila y despliega como un único artefacto ejecutable en Spring Boot 3.x, pero su código fuente se organiza en módulos autónomos y desacoplados respetando *bounded contexts* de Domain-Driven Design (DDD).

### AIProvider
Interfaz de abstracción desacoplada en Java que aísla la lógica de negocio de los proveedores comerciales de modelos de lenguaje (OpenAI, Anthropic, Ollama local), facilitando balanceo, auditoría de tokens y tolerancia a fallos.

### ProblemDetail (RFC 7807)
Estándar formal de la IETF para representar errores de APIs HTTP en formato JSON con campos enriquecidos (`type`, `title`, `status`, `detail`, `instance`, `timestamp`, `traceId`).

### Idempotency-Key
Encabezado HTTP que permite a los clientes reenviar peticiones de creación (`POST`) de forma segura sin generar recursos duplicados en caso de fallos de red.

---

## 3. Términos de Base de Datos y Multi-Tenancy

### Multi-Tenancy
Arquitectura que permite a múltiples organizaciones (tenants) compartir la misma instancia de aplicación y base de datos, garantizando aislamiento estricto de información mediante claves discriminadoras y políticas de acceso.

### Row Level Security (RLS)
Mecanismo nativo del motor PostgreSQL que evalúa políticas a nivel de fila (`POLICY`), impidiendo que una consulta acceda o modifique registros que no correspondan al `current_organization_id` de la sesión actual.

### SET LOCAL
Comando SQL ejecutado al inicio de una transacción para definir variables de sesión efímeras (`app.current_organization_id`) que son eliminadas automáticamente al completarse el commit o rollback.

### Flyway
Herramienta de control de versiones y migraciones automatizadas de esquemas de base de datos relacionales basada en archivos SQL inmutables e incrementales.

---

## 4. Términos de Seguridad

### JWT Asimétrico (RS256)
JSON Web Token firmado mediante un par de claves criptográficas RSA: una clave privada confidencial utilizada por el backend para emitir tokens y una clave pública compartida para verificarlos.

### Refresh Token Rotation (RTR)
Patrón de seguridad donde cada uso de un refresh token genera un nuevo par de credenciales y revoca inmediatamente el token anterior. Si un token ya utilizado vuelve a presentarse, el sistema detecta robo y revoca todas las sesiones del usuario.

### RBAC (Role-Based Access Control)
Control de acceso granular basado en roles predefinidos (`PLATFORM_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`, `MEMBER`) mapeados a permisos específicos de recurso y acción.

### IDOR (Insecure Direct Object Reference)
Vulnerabilidad de seguridad donde un usuario malintencionado intenta acceder a recursos de otra organización modificando identificadores en peticiones HTTP. Mitigado en BOWOL mediante contexto transversal de tenant y RLS.

---

## 5. Términos de Frontend y Diseño

### Liquid Glass + iOS Minimal
Lenguaje visual de BOWOL caracterizado por superficies translúcidas con refracción sutil (`backdrop-blur`), bordes con relieve interior, sombras con tinte de color, tipografía Inter con espaciado generoso y jerarquía estricta.

### Feature-Driven Architecture
Organización del código frontend donde cada dominio de negocio (`features/auth`, `features/trends`) contiene sus propias páginas, componentes, hooks, servicios y contratos de tipos de forma modular e independiente.

### Server State
Estado de datos asíncronos que residen en el servidor (proyectos, tareas, reportes) y que son cacheados, revalidados y sincronizados en el cliente mediante **TanStack Query**.

### CVA (Class Variance Authority)
Herramienta utilitaria que permite construir componentes de UI tipados con TypeScript y Tailwind CSS gestionando variantes visuales, tamaños y estados de forma declarativa.

### Zero Emojis
Regla no negociable de diseño que prohíbe la presencia de caracteres emoji en botones, badges, modales, toasts y estados de la interfaz de usuario, empleando exclusivamente iconos vectoriales finos de **Lucide React** (`strokeWidth: 1.5`).
