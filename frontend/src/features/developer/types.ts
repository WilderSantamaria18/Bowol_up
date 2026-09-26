export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  revokedAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated {
  id: string;
  name: string;
  keyPrefix: string;
  rawApiKey: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyDTO {
  name: string;
  expiresInDays?: number;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  description: string | null;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateWebhookDTO {
  url: string;
  description?: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookDTO {
  url?: string;
  description?: string;
  events?: string[];
  isActive?: boolean;
}

export interface WebhookDelivery {
  id: string;
  webhookEndpointId: string;
  eventType: string;
  payload: string;
  statusCode: number | null;
  responseBody: string | null;
  success: boolean;
  attempts: number;
  errorMessage: string | null;
  createdAt: string;
}

export const AVAILABLE_WEBHOOK_EVENTS = [
  {
    id: 'trend.high_relevance_detected',
    label: 'Tendencia de Alta Relevancia',
    description: 'Se dispara cuando el motor de IA identifica una señal de mercado crítica',
  },
  {
    id: 'opportunity.rice_calculated',
    label: 'Priorización RICE Completada',
    description: 'Se dispara cuando una oportunidad estratégica es puntuada',
  },
  {
    id: 'sprint.completed',
    label: 'Sprint de Innovación Finalizado',
    description: 'Notifica el cierre de un ciclo ágil de entrega',
  },
  {
    id: 'task.blocked',
    label: 'Tarea Crítica Bloqueada',
    description: 'Alerta sobre impedimentos en el tablero Kanban',
  },
  {
    id: 'subscription.credit_threshold_reached',
    label: 'Alerta de Cuota de Créditos IA',
    description: 'Se emite al alcanzar el 80% o 100% de la cuota mensual contratada',
  },
];
