// Imprime o config.yaml do Hermes na saida padrao. Uso: node apps/ponte/scripts/gerar-config.ts [banco]
import { gerarConfigHermes } from '../src/config-hermes.ts';

process.stdout.write(gerarConfigHermes({ banco: process.argv[2] ?? 'heimdall' }));
