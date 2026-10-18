# Fase 1 — Áudio (Whisper)

Fontes: `docs/whisper/`, `docs/hermes-agent/user-guide/features/tts.md` (seção STT), `docs/baileys/messaging/media-messages.md`.

## Decisão
Transcrição **local com Whisper**, sem API paga (o plano ChatGPT Plus não cobre transcrição). O tamanho do modelo **não é escolhido agora**: um teste de capacidade da máquina decide na hora de instalar.

## O que a documentação do Whisper diz
- Modelos multilíngues: `tiny`, `base`, `small`, `medium`, `large` (e `turbo`). VRAM aproximada: ~1, ~1, ~2, ~5, ~10 GB; `turbo` ~6 GB, cerca de 8x a velocidade do `large` com "degradação mínima" (é versão otimizada do `large-v3`).
- Velocidades relativas foram medidas em inglês numa A100: "a velocidade real pode variar bastante" conforme idioma, fala e hardware. **A documentação não dá números de CPU nem de português.**
- Desempenho varia muito por idioma (gráfico de WER por idioma no README, só em imagem; não consegui ler os valores de português).
- Limitações (model card): pode **alucinar** texto que não foi dito (silêncio e ruído), **repete** trechos, é desigual por sotaque e dialeto. `transcribe()` processa em janelas de 30 s.
- Exige `ffmpeg` instalado. Licença MIT.

## Como encaixa nas outras peças
- Baileys: áudio de voz chega como mensagem de mídia (`ptt`, `audio/ogg; codecs=opus`) e precisa ser baixado **na chegada** (a mídia expira nos servidores).
- Hermes: a transcrição automática dele só vale para áudio que passa por ele. No nosso desenho o **listener** recebe o áudio, então o listener transcreve. Se algum dia o Hermes transcrever, o padrão dele é `stt.language: "en"`; teria que ser `"pt"` ou vazio.
- O Hermes usa o `faster-whisper` (reimplementação com CTranslate2) como transcrição local padrão, com modelos `tiny` a `large-v3`. Para CPU, é a candidata natural de execução; a documentação dele não está no projeto ainda.

## O que a documentação do faster-whisper diz (docs/faster-whisper/)
- Reimplementação do Whisper com CTranslate2; "até 4 vezes mais rápido que o openai/whisper com a mesma precisão e menos memória". Quantização de 8 bits (`int8`) funciona em CPU e GPU.
- **Não exige ffmpeg instalado** (decodifica com PyAV). Python 3.9+. GPU só com CUDA 12 + cuDNN 9; sem GPU roda em CPU (`device="cpu", compute_type="int8"`).
- **Único benchmark de CPU da documentação** (modelo `small`, 13 minutos de áudio, 8 threads, Intel Core i7-12700K, beam 5):
  | Implementação | Precisão | Tempo | RAM |
  |---|---|---|---|
  | openai/whisper | fp32 | 6m58s | 2.335 MB |
  | faster-whisper | fp32 | 2m37s | 2.257 MB |
  | faster-whisper | int8 | **1m42s** | **1.477 MB** |
  Ou seja, `small` em `int8` transcreve cerca de 7,6 vezes mais rápido que o tempo real nessa CPU. **Não há benchmark de CPU para `medium`, `large-v3` nem `turbo`**, nem para vCPUs de VPS (costumam ser mais lentas que um i7 desktop).
- Modelos que ele baixa (Hugging Face): `tiny`, `base`, `small`, `medium`, `large-v1/v2/v3`, `turbo` (= `large-v3-turbo`), e as versões `distil-*`. Os exemplos do `distil-large-v3` no README usam `language="en"`; **não confirmei suporte a português nas versões distil**, então não as considero.
- **Filtro de silêncio (VAD, Silero):** no código atual `vad_filter=True` é o padrão em `transcribe()`; remove silêncios maiores que 2 s por padrão (ajustável em `VadOptions`). Ajuda contra alucinação em pausas.
- Opções úteis para o caso de vendas (em `source/transcribe.py`): `language="pt"` (evita a detecção), `initial_prompt` e `hotwords` (vocabulário: nomes de produtos, empresas, siglas), `hallucination_silence_threshold`, `condition_on_previous_text=False` (reduz repetição em trechos longos), `beam_size` (padrão 5), `word_timestamps`.
- Transcrição em lote (`BatchedInferencePipeline`) ajuda sobretudo em GPU; para poucos áudios curtos não compensa.
- `segments` é um gerador: a transcrição só roda quando se itera sobre ele.

## Volume informado pelo usuário
Poucos áudios por dia, no máximo 3 minutos cada. Consequência: **o tempo de processamento deixa de ser o limitador**; mesmo um modelo grande em CPU, bem mais lento que o tempo real, fecha o dia sem problema. Isso favorece escolher o **maior modelo que caiba na memória** (qualidade) em vez do mais rápido. O teste de capacidade passa a medir principalmente memória e tempo por áudio de 3 minutos.

## Decisão provisória
`faster-whisper` em `int8` (CPU) ou `float16` (se houver GPU NVIDIA), com `language="pt"`, VAD ligado e `initial_prompt` com o vocabulário do usuário. Modelo: o maior da escada que passe no teste de capacidade, partindo de `large-v3` e `turbo`.

## Teste de capacidade (a implementar quando começar a prática)
1. Detectar: núcleos de CPU e instruções (AVX2), RAM, GPU e VRAM (`nvidia-smi`), disco livre.
   (Com o volume pequeno, o critério principal passa a ser memória disponível e tempo por áudio de 3 minutos.)
2. Baixar uma amostra curta de áudio em português (idealmente áudios reais do usuário) e rodar cada candidato da escada `turbo → medium → small → base → tiny` medindo o **fator de tempo real** (segundos de processamento por segundo de áudio) e a memória.
3. Escolher o maior modelo que cumpra: (a) cabe na RAM/VRAM com folga; (b) processa o volume diário estimado dentro de uma janela aceitável; (c) não trava a escuta ao vivo.
4. Conferir qualidade em português numa amostra revisada à mão (palavras erradas, nomes de empresas, números).
5. Registrar o resultado e permitir refazer o teste ao trocar de máquina.

## Riscos específicos
- Alucinação em áudios curtos, com ruído ou silêncio: guardar sempre o áudio original e marcar a transcrição como automática; considerar filtro de silêncio antes de transcrever (verificar na doc do `faster-whisper`).
- Nomes próprios, produtos e siglas do mercado do usuário: prompt inicial com vocabulário (a conferir em `source/transcribe.py`, parâmetro `initial_prompt`).
- Fila: transcrição não pode bloquear a recepção; processar em fila durável.

## Pendências
- Quantidade exata de áudios por dia (informado: "poucos", até 3 min cada).
- Diarização (quem fala) não existe no Whisper; é preciso? Em áudio de WhatsApp costuma ser uma pessoa só.
