# LocalTalk

Walkie-talkie e chat para grupos na mesma rede, sem cadastro e sem servidor.
Áudio e mensagens vão direto de aparelho para aparelho (WebRTC). Versões para Android e Windows.

## Como o projeto está organizado

```
src/
  index.html        esqueleto da tela (só a estrutura)
  css/              estilos, em ordem de número
  js/               lógica do app, em ordem de número
lt-extras.js        extras carregados depois do script principal
MainActivity.java   parte nativa do Android (salas por código, serviço em segundo plano)
AndroidManifest.xml permissões e configuração do app Android
lt-room.js          mesma lógica de salas, para o Windows
windows/            programa do Windows (Electron)
montar_html.py      junta src/ no index.html único que o app usa
baixar_maplibre.sh  coloca o MapLibre (mapa) dentro do app Android
.github/workflows/  gera o APK (Android) e o EXE (Windows) no GitHub
```

### Onde mexer em cada coisa

| Quero mexer em… | Arquivo |
| --- | --- |
| Conexão entre aparelhos e mensagens | `src/js/10-nucleo-rede.js` |
| Sala por código de 6 dígitos | `src/js/11-salas-por-codigo.js` |
| Conversa, canais, ajustes, botão de falar | `src/js/12-conversa-canais-ajustes.js` |
| Mapa (radar, quem está falando, 3D, mapa real) | `src/js/13` a `16` e `18` |
| Envio de áudio e arquivos | `src/js/14-audio-e-arquivos.js` |
| QR code e convite | `src/js/17-qr-e-convite.js` |
| Aparência (cores, layout) | `src/css/` e `src/js/20-tema.js`, `30-layout.js` |

Os arquivos são carregados na ordem dos números (e, dentro do mesmo número, na ordem do `src/index.html`).
**Não mude a ordem** sem testar: um arquivo usa o que os anteriores criaram.

## Gerar o `index.html`

O `index.html` **não fica no repositório**: ele é montado na hora do build.
Para montar no seu computador (precisa de Python 3):

```
python3 montar_html.py src/index.html index.html
```

## Gerar o app

Os workflows em `.github/workflows` rodam a cada envio ao GitHub.
Na aba **Actions**, abra a execução mais recente e baixe o arquivo em **Artifacts**
(`TalkLocal-apk` para Android, `TalkLocal-windows` para Windows).
