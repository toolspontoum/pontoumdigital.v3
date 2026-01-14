---
description: Adiciona novos cases ao portfólio automaticamente a partir de URLs fornecidas.
---

Este workflow deve ser acionado quando o usuário usar o comando `/novo_case [URL]` ou solicitar a adição de um novo site.

Passos para execução:

1.  **Identificar URL(s)**:
    - Extraia todas as URLs fornecidas na solicitação do usuário.

2.  **Web Scraping & Curadoria (Browser Subagent)**:
    - Para cada URL, use o `browser_subagent` para:
        - Acessar o site.
        - Identificar o Título do projeto (Título da página ou H1 principal).
        - Criar uma **Descrição Premium** (1-2 frases, tom de autoridade, focado em estratégia/tecnologia/networking).
        - Confirmar se o site está online e acessível.

3.  **Atualizar JSON de Dados**:
    - Leia o arquivo `src/data/projects.json`.
    - Adicione um novo objeto ao array `projects` para cada URL, seguindo este esquema:
      ```json
      {
          "id": "slug-do-projeto",
          "url": "URL_FORNECIDA",
          "title": "TÍTULO_EXTRAÍDO",
          "description": "DESCRIÇÃO_PREMIUM_CRIADA",
          "category": "sites", // Padrão, ou infira pelo contexto
          "year": "ANO_ATUAL",
          "desktopImage": null, // Deixe null para usar o gerador automático
          "mobileImage": null   // Deixe null para usar o gerador automático
      }
      ```
    - **Importante**: Mantenha a ordem cronológica ou a ordem solicitada pelo usuário (novos no topo ou fim, conforme contexto).

4.  **Validação Visual (Browser Subagent)**:
    - Recarregue a página local (`http://localhost:5173/`).
    - Navegue até a seção `#cases`.
    - Verifique se o(s) novo(s) card(s) apareceu(ram) no grid.
    - Tire um screenshot do grid atualizado para confirmação.

5.  **Relatório Final**:
    - Confirme ao usuário que os cases foram adicionados com sucesso.
    - Mostre os títulos e descrições criados para validação.
