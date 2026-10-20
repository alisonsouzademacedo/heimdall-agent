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

## Armadilhas (medido em 2026-10-20)
- **Fixar o `av`.** O `faster-whisper==1.2.1` declara `av>=11` **sem limite superior**; com o `av` mais novo (19.0.1) a transcrição quebra: `TypeError: open() got an unexpected keyword argument 'metadata_errors'` (em `faster_whisper/audio.py`, `decode_audio`). Funcionou com **`av==16.1.0`** (wheel `cp312` ~39 MB). A imagem do trabalhador de áudio **deve fixar `av`** (e as demais versões); sem isso uma instalação nova em outro computador falha.
- Resultado de referência (CPU, 8 threads vistas, `small`, `int8`, `language="pt"`, VAD ligado): 258,8 s de áudio sintético em 94,8 s (0,37× o tempo real), carregar o modelo 1,3 s, **pico 1373 MB**. Qualidade não avaliada: houve uma inserção ("um copyright") e mais palavras do que o falado (alucinação), como a documentação do Whisper avisa.
- **A imagem está no repositório:** `apps/media-worker/Dockerfile` e `requirements.txt` (todas as versões exatas, geradas em `python:3.12-slim` limpo). Testes: `tests/infra/check_infra.sh` (pins) e `tests/infra/smoke_docker.sh` (decodifica WAV com o `av` fixo, carrega o modelo `small` **sem internet** e lê um PDF sintético com o markitdown; **qualidade da transcrição não é avaliada**).
- O modelo `small` (`Systran/faster-whisper-small`, 464 MB) pode ser baixado com `download_model("small", output_dir=...)` (`docs/faster-whisper/source/utils.py`) e embutido na imagem.

## Não verificado
Qualidade em português por modelo; tempo em CPU de modelos grandes; comportamento do `local_files_only` com modelo pré-baixado; qualidade do PDF do Meet.
