<!-- source: https://openai.com/pt-BR/index/whisper/ (via Firecrawl) -->
Apresentamos o Whisper \| OpenAI

21 de setembro de 2022

[Lançamento](https://openai.com/pt-BR/research/index/release/)

# Apresentamos o Whisper

Treinamos uma rede neural em código aberto chamado Whisper, que se aproxima do nível humano em termos de robustez e precisão no reconhecimento de fala em inglês. E, agora, ela está disponível para usuários.

[Leia o artigo(abre em uma nova janela)](https://cdn.openai.com/papers/whisper.pdf) [Ver código(abre em uma nova janela)](https://github.com/openai/whisper) [Ver cartão do modelo(abre em uma nova janela)](https://github.com/openai/whisper/blob/main/model-card.md)

## This post introduced Whisper in 2022.

For current audio and transcription capabilities:

[Explore models(abre em uma nova janela)](https://developers.openai.com/api/docs/models/all)

Ouvir artigo3:05

Compartilhar

Whisper examples:Speed talkingK-PopFrenchAccent

Reveal transcript

This is the Micro Machine Man presenting the most midget miniature motorcade of Micro Machines. Each one has dramatic details, terrific trim, precision paint jobs, plus incredible Micro Machine Pocket Play Sets. There’s a police station, fire station, restaurant, service station, and more. Perfect pocket portables to take any place. And there are many miniature play sets to play with, and each one comes with its own special edition Micro Machine vehicle and fun, fantastic features that miraculously move. Raise the boatlift at the airport marina. Man the gun turret at the army base. Clean your car at the car wash. Raise the toll bridge. And these play sets fit together to form a Micro Machine world. Micro Machine Pocket Play Sets, so tremendously tiny, so perfectly precise, so dazzlingly detailed, you’ll want to pocket them all. Micro Machines are Micro Machine Pocket Play Sets sold separately from Galoob. The smaller they are, the better they are.

O Whisper é um sistema de reconhecimento automático de fala (ASR) treinado com 680 mil horas de dados supervisionados multilíngues e multitarefas, coletados na web. Ao longo das investigações, demonstramos que o uso de um conjunto de dados tão grande e diversificado leva a uma maior robustez em relação a sotaques, ruídos de fundo e linguagem técnica. Além disso, permite a transcrição em vários idiomas, bem como a tradução desses idiomas para o inglês. Estamos disponibilizando modelos e códigos de inferência em código aberto para servir como base para a criação de aplicativos úteis, e também para futuras investigações sobre processamento robusto de fala.

A arquitetura do Whisper é uma abordagem simples de ponta a ponta, implementada como um transformador do tipo codificador-decodificador. O áudio de entrada é dividido em trechos de 30 segundos, convertido em um espectrograma log-Mel e, em seguida, passado para um codificador. O decodificador é treinado de modo a prever a legenda de texto correspondente, misturada com tokens especiais que direcionam o modelo único para realizar tarefas como identificação de idioma, marcas de tempo em nível de frase, transcrição de fala multilíngue e tradução de fala para o inglês.

Outras abordagens existentes frequentemente utilizam conjuntos de dados de treinamento de áudio-texto menores e mais parecidos, [1](https://openai.com/pt-BR/index/whisper/#citation-bottom-1)[2](https://openai.com/pt-BR/index/whisper/#citation-bottom-2), [3](https://openai.com/pt-BR/index/whisper/#citation-bottom-3) ou então utilizam pré-treinamento de áudio amplo, mas não supervisionado. [4](https://openai.com/pt-BR/index/whisper/#citation-bottom-4), [5](https://openai.com/pt-BR/index/whisper/#citation-bottom-5), [6](https://openai.com/pt-BR/index/whisper/#citation-bottom-6) Como o Whisper foi treinado em um conjunto de dados grande e diversificado e não foi ajustado para nenhum específico, ele não supera os modelos especializados no desempenho do LibriSpeech — um benchmark famoso por ser competitivo em reconhecimento de fala. No entanto, quando medimos o desempenho do Whisper em zero-shot em diversos conjuntos de dados diversos, descobrimos que ele é mais robusto e comete 50% menos erros do que esses modelos.

Cerca de um terço do conjunto de dados de áudio do Whisper não é em inglês, e ele recebe várias solicitações para transcrever no idioma original ou traduzir para o inglês. Consideramos que essa abordagem é particularmente eficaz na aprendizagem da tradução de fala para texto e supera o SOTA supervisionado no CoVoST2 para tradução zero-shot para o inglês.

Entradas e resultados dos dados de treinamento para ASR

Entradas e resultados dos dados de treinamento para ASR

Esperamos que, com a alta precisão e facilidade de uso do Whisper, os desenvolvedores possam adicionar interfaces de voz a um conjunto muito mais amplo de aplicativos. Confira o [artigo⁠(abre em uma nova janela)](https://cdn.openai.com/papers/whisper.pdf), o [cartão do modelo⁠(abre em uma nova janela)](https://github.com/openai/whisper/blob/main/model-card.md) e o [código⁠(abre em uma nova janela)](https://github.com/openai/whisper) para saber mais detalhes e experimentar o Whisper.

- [Whisper](https://openai.com/pt-BR/research/index/?tags=whisper)
- [Idioma](https://openai.com/pt-BR/research/index/?tags=language)
- [Software e engenharia](https://openai.com/pt-BR/research/index/?tags=software-engineering)

## Referências

1. 1


Chan, W., Park, D., Lee, C., Zhang, Y., Le, Q., and Norouzi, M. SpeechStew: Simply mix all available speech recogni- tion data to train one large neural network. [arXiv preprint arXiv:2104.02133, 2021⁠(abre em uma nova janela)](https://arxiv.org/abs/2104.02133). [Rolar até a referência da citação 1](https://openai.com/pt-BR/index/whisper/#citation-top-1)

2. 2


Galvez, D., Diamos, G., Torres, J. M. C., Achorn, K., Gopi, A., Kanter, D., Lam, M., Mazumder, M., and Reddi, V. J. The people’s speech: A large-scale diverse english speech recognition dataset for commercial usage. [arXiv preprint arXiv:2111.09344, 2021⁠(abre em uma nova janela)](https://arxiv.org/abs/2111.09344). [Rolar até a referência da citação 2](https://openai.com/pt-BR/index/whisper/#citation-top-2)

3. 3


Chen, G., Chai, S., Wang, G., Du, J., Zhang, W.-Q., Weng, C., Su, D., Povey, D., Trmal, J., Zhang, J., et al. Gigaspeech: An evolving, multi-domain asr corpus with 10,000 hours of transcribed audio. [arXiv preprint arXiv:2106.06909, 2021⁠(abre em uma nova janela)](https://arxiv.org/abs/2106.06909). [Rolar até a referência da citação 3](https://openai.com/pt-BR/index/whisper/#citation-top-3)

4. 4


Baevski, A., Zhou, H., Mohamed, A., and Auli, M. wav2vec 2.0: A framework for self-supervised learning of speech representations. [arXiv preprint arXiv:2006.11477, 2020⁠(abre em uma nova janela)](https://arxiv.org/abs/2006.11477). [Rolar até a referência da citação 4](https://openai.com/pt-BR/index/whisper/#citation-top-4)

5. 5


Baevski, A., Hsu, W.N., Conneau, A., and Auli, M. Unsu pervised speech recognition. Advances in Neural Information Processing Systems, 34:27826–27839, 2021. [Rolar até a referência da citação 5](https://openai.com/pt-BR/index/whisper/#citation-top-5)

6. 6


Zhang, Y., Park, D. S., Han, W., Qin, J., Gulati, A., Shor, J., Jansen, A., Xu, Y., Huang, Y., Wang, S., et al. BigSSL: Exploring the frontier of large-scale semi-supervised learning for automatic speech recognition. [arXiv preprint arXiv:2109.13226, 2021⁠(abre em uma nova janela)](https://arxiv.org/abs/2109.13226). [Rolar até a referência da citação 6](https://openai.com/pt-BR/index/whisper/#citation-top-6)


## Artigos relacionados

[Ver tudo](https://openai.com/pt-BR/news/)

[Hierarchical text-conditional image generation with CLIP latents\\
\\
Publicação13 de abr. de 2022](https://openai.com/index/hierarchical-text-conditional-image-generation-with-clip-latents/)

[Solving (some) formal math olympiad problems\\
\\
Marco2 de fev. de 2022](https://openai.com/index/formal-math/)

[Solving math word problems\\
\\
Publicação29 de out. de 2021](https://openai.com/index/solving-math-word-problems/)
