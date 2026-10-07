/**
 * Guardia de contrato frontend ↔ backend.
 * Lee los controladores y enums Java del monorepo y verifica que:
 *  1. cada llamada HTTP de los servicios del frontend exista en algún controlador (método + ruta);
 *  2. los tipos-unión del frontend que reflejan enums del backend tengan exactamente los mismos valores.
 * Si el backend no está junto al frontend (p. ej. build aislado), las pruebas se omiten.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_SRC = path.resolve(__dirname, '..');
const BACKEND_JAVA = path.resolve(__dirname, '../../../backend/src/main/java');
const hasBackend = fs.existsSync(BACKEND_JAVA);

function walk(dir: string, match: RegExp, out: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name !== 'node_modules') walk(full, match, out);
    } else if (match.test(full.split(path.sep).join('/'))) {
      out.push(full);
    }
  }
  return out;
}

const normalize = (p: string) =>
  p
    .replace(/\?.*$/, '')
    .replace(/\$\{[^}]*\}/g, '{}')
    .replace(/\{[^}/]*\}/g, '{}')
    .replace(/^\/api\/v1/, '')
    .replace(/\/$/, '');

function backendEndpoints(): Set<string> {
  const endpoints = new Set<string>();
  for (const file of walk(BACKEND_JAVA, /Controller\.java$/)) {
    const src = fs.readFileSync(file, 'utf8');
    const base = src.match(/@RequestMapping\(\s*(?:value\s*=\s*)?"([^"]*)"/)?.[1] ?? '';
    const re = /@(Get|Post|Put|Patch|Delete)Mapping(?:\(\s*(?:value\s*=\s*|path\s*=\s*)?"?([^")]*)"?[^)]*\))?/g;
    for (const m of src.matchAll(re)) {
      endpoints.add(`${m[1].toUpperCase()} ${normalize(base + (m[2] ?? ''))}`);
    }
  }
  return endpoints;
}

function frontendCalls(): { key: string; file: string }[] {
  const calls: { key: string; file: string }[] = [];
  const files = walk(FRONTEND_SRC, /features\/[^/]+\/services\/\w+\.ts$/);
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const re = /httpClient\s*\.\s*(get|post|put|patch|delete)\s*(?:<[^>(]*>)?\(\s*([`'"])((?:\\.|(?!\2).)*)\2/gs;
    for (const m of src.matchAll(re)) {
      // Las rutas con query string dinámico (`/x${qs}`) se validan sin el sufijo.
      // `${qs ? `?${qs}` : ''}` llega truncado por las comillas anidadas: se descarta la expresión abierta.
      const raw = m[3].replace(/\$\{[^}]*$/, '').replace(/\$\{[a-zA-Z_.]*(?:qs|params|query)[a-zA-Z_.]*\}$/, '');
      calls.push({ key: `${m[1].toUpperCase()} ${normalize(raw)}`, file: path.basename(file) });
    }
  }
  return calls;
}

function javaEnums(): Record<string, string[]> {
  const enums: Record<string, string[]> = {};
  for (const file of walk(BACKEND_JAVA, /\.java$/)) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/enum\s+(\w+)\s*\{([^;}]*)/g)) {
      enums[m[1]] = m[2]
        .split(',')
        .map((v) => v.replace(/\/\/.*|\/\*[\s\S]*?\*\/|\(.*\)/g, '').trim())
        .filter(Boolean);
    }
  }
  return enums;
}

function tsUnions(): Record<string, string[]> {
  const unions: Record<string, string[]> = {};
  for (const file of walk(FRONTEND_SRC, /features\/[^/]+\/.*\.ts$/)) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/export\s+type\s+(\w+)\s*=\s*((?:\s*\|?\s*'[\w]+')+)\s*;/g)) {
      unions[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    }
  }
  return unions;
}

describe.skipIf(!hasBackend)('Contrato frontend ↔ backend', () => {
  it('todas las llamadas HTTP de los servicios existen en un controlador del backend', () => {
    const endpoints = backendEndpoints();
    const calls = frontendCalls();
    expect(calls.length).toBeGreaterThan(100);
    const missing = calls.filter((c) => !endpoints.has(c.key)).map((c) => `${c.file}: ${c.key}`);
    expect(missing).toEqual([]);
  });

  it('los tipos-unión del frontend coinciden con los enums Java del mismo nombre', () => {
    const java = javaEnums();
    const ts = tsUnions();
    const shared = Object.keys(ts).filter((name) => java[name]);
    // Debe haber solapamiento real; si no, el parser dejó de funcionar.
    expect(shared.length).toBeGreaterThanOrEqual(15);
    const drift = shared
      .filter((name) => [...ts[name]].sort().join() !== [...java[name]].sort().join())
      .map((name) => `${name}: frontend=[${ts[name]}] backend=[${java[name]}]`);
    expect(drift).toEqual([]);
  });

  it('los enums de facturación usan los valores del backend', () => {
    const java = javaEnums();
    expect(tsUnions().PaymentGateway?.sort()).toEqual([...java.PaymentGateway].sort());
    expect(tsUnions().InvoiceStatus?.sort()).toEqual([...java.InvoiceStatus].sort());
    expect(tsUnions().SubscriptionStatus?.sort()).toEqual([...java.SubscriptionStatus].sort());
  });
});
