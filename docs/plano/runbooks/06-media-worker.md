# 6. Trabalhador de áudio e PDF (faster-whisper e markitdown)

Fontes: `docs/faster-whisper/{INDEX.md,repo/README.md,source/{transcribe,utils,vad}.py}`, `docs/whisper/repo/README.md`, `docs/markitdown/{repo/README.md,source/_pdf_converter.py,packages/markitdown_pyproject.toml}`.

## Requisitos
Python 3.10 a 3.14 (markitdown; faster-whisper pede 3.9+). **ffmpeg não é necessário** para o faster-whisper (decodifica com PyAV). GPU só com NVIDIA, CUDA 12 e cuDNN 9; sem GPU roda em CPU.

## Instalação
`pip install faster-whisper` · `pip install 'markitdown[pdf]'` (traz `pdfminer.six` e `pdfplumber`). Usar ambiente virtual (o README manda `uv pip install` se usar `uv`).

## Áudio
- Modelo: **o maior que o teste de capacidade aprovar**, partindo de `large-v3` e `turbo` (`docs/plano/fase-1-audio.md`). CPU: `WhisperModel(modelo, device="cpu", compute_type="int8")`; GPU: `float16`.
- Chamada: `model.transcribe(arquivo, beam_size=5, language="pt", vad_filter=True, initial_prompt="<vocabulário>", hotwords="<nomes>")`. **O resultado é um gerador**: só roda quando se itera (`list(segments)`). O filtro de silêncio (Silero VAD) é padrão no código atual.
- **Baixar o modelo antes**, com acesso à internet (Hugging Face): `download_model("<modelo>", output_dir=...)` existe em `utils.py`; depois carregar pelo caminho local ou `local_files_only=True` **[validar]**. A lista de modelos está em `_MODELS` (`utils.py`); evitar as variantes `distil` (exemplos só em inglês).
- Referência de desempenho (README): `small` em `int8` na CPU, 13 min de áudio em 1min42, 1,5 GB de RAM (i7-12700K, 8 threads). **Não há dados de CPU para modelos maiores.**

## PDF
`markitdown arquivo.pdf -o arquivo.md` ou pela biblioteca. **Segurança (README):** não passar entrada não confiável direto; usar a função mais estreita (`convert_local()` ou `convert_stream()`), nunca `convert()` com caminho ou URL vindos da mensagem; nome de arquivo gerado por nós (hash); limites de tamanho, páginas e tempo; processo isolado. Só texto: PDF escaneado sai vazio e é marcado `sem_texto`.

## Isolamento
Contêiner próprio, em **rede interna sem internet** depois do download do modelo; ver `docs/plano/fase-1-arquitetura-e-compose.md`. A fila (tabela `fila`) entrega os trabalhos; a transcrição roda **um áudio por vez** na CPU.

## Verificação
Transcrever um áudio de teste em português e conferir o texto; converter um PDF de transcrição do Meet de exemplo e conferir falas, horários e participantes; medir tempo e memória (E6, E7).

## Não verificado
Qualidade em português por modelo; tempo em CPU de modelos grandes; comportamento do `local_files_only` com modelo pré-baixado; qualidade do PDF do Meet.
