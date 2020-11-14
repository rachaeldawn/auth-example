export function getEnvVar(arg: string): string {
  return process.env[arg] ?? '';
}
