// Imprime o config.yaml do Hermes na saida padrao. Uso: node apps/ponte/scripts/gerar-config.ts [banco] [config-atual.yaml]
// O segundo argumento (opcional) e o config que esta valendo no Hermes: dele so a secao "model:" (o login) e aproveitada.
import { readFileSync } from 'node:fs';
import { gerarConfigHermes } from '../src/config-hermes.ts';

const atual = process.argv[3] ? readFileSync(process.argv[3], 'utf8') : undefined;
process.stdout.write(gerarConfigHermes({ banco: process.argv[2] ?? 'heimdall', configAtual: atual }));
