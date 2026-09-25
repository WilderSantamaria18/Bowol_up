import React, { useState } from 'react';
import { Building2, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Organization, OrganizationSize, UpdateOrganizationDTO } from '../types';
import { ProblemDetail } from '@/services/http';

interface OrgProfileFormProps {
  organization: Organization;
  onUpdate: (data: UpdateOrganizationDTO) => Promise<void>;
  isReadOnly?: boolean;
}

export const OrgProfileForm: React.FC<OrgProfileFormProps> = ({
  organization,
  onUpdate,
  isReadOnly = false,
}) => {
  const [name, setName] = useState(organization.name || '');
  const [industry, setIndustry] = useState(organization.industry || '');
  const [country, setCountry] = useState(organization.country || '');
  const [size, setSize] = useState<OrganizationSize>(organization.size || 'SMALL');
  const [website, setWebsite] = useState(organization.website || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onUpdate({
        name: name.trim(),
        industry: industry.trim() || undefined,
        country: country.trim().toUpperCase() || undefined,
        size,
        website: website.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      const problem = err as ProblemDetail;
      setError(problem?.detail || 'Error al guardar los cambios en la organización');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {success && (
        <Alert
          variant="success"
          detail="Datos de la organización actualizados exitosamente."
        />
      )}
      {error && <Alert variant="error" detail={error} />}

      <div className="space-y-4">
        <Input
          label="Nombre de la organización"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isReadOnly}
          leftIcon={Building2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Industria o Sector"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="ej. SaaS B2B, Fintech, Salud"
            disabled={isReadOnly}
          />

          <Select
            label="Tamaño del equipo"
            value={size}
            onChange={(e) => setSize(e.target.value as OrganizationSize)}
            disabled={isReadOnly}
            options={[
              { value: 'SOLO', label: 'Solo (1 persona)' },
              { value: 'MICRO', label: 'Micro (2-5 personas)' },
              { value: 'SMALL', label: 'Pequeña (6-20 personas)' },
              { value: 'MEDIUM', label: 'Mediana (21-100 personas)' },
              { value: 'LARGE', label: 'Grande (101-500 personas)' },
              { value: 'ENTERPRISE', label: 'Enterprise (500+ personas)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="País (Código ISO 2 letras)"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="ej. PE, MX, ES, US"
            disabled={isReadOnly}
          />

          <Input
            label="Sitio web corporativo"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://miempresa.com"
            disabled={isReadOnly}
            leftIcon={Globe}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={Save}
          >
            Guardar Cambios
          </Button>
        </div>
      )}
    </form>
  );
};
