// src/lib/env.ts
export function env(name: string): string {
  const v = import.meta.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}
