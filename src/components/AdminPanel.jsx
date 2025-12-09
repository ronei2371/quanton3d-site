<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Configuração Inicial</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
  <style>
    body {
      background-color: #f8f9fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 2rem;
    }
    .container {
      max-width: 900px;
      margin: auto;
    }
    h2 {
      margin-bottom: 1.5rem;
    }
    label {
      font-weight: 500;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .btn-salvar {
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>Configuração Inicial</h2>
    <form>
      <div class="form-group">
        <label for="nomeSistema">Nome do sistema</label>
        <input type="text" class="form-control" id="nomeSistema" placeholder="Digite o nome do sistema" />
      </div>

      <div class="form-group">
        <label for="fraseImpacto">Frase de impacto</label>
        <input type="text" class="form-control" id="fraseImpacto" placeholder="Digite uma frase de impacto" />
      </div>

      <div class="form-group">
        <label for="urlLogo">URL da logo</label>
        <input type="text" class="form-control" id="urlLogo" placeholder="Cole a URL da logo" />
      </div>

      <div class="form-group">
        <label for="urlFavicon">URL do favicon</label>
        <input type="text" class="form-control" id="urlFavicon" placeholder="Cole a URL do favicon" />
      </div>

      <div class="form-group">
        <label for="versaoSistema">Versão do sistema</label>
        <input type="text" class="form-control" id="versaoSistema" placeholder="Ex: 1.0.0" />
      </div>

      <div class="form-group">
        <label for="contatoSuporte">Contato de suporte</label>
        <input type="text" class="form-control" id="contatoSuporte" placeholder="Ex: (31) 99999-9999" />
      </div>

      <div class="form-group">
        <label for="mensagemBoasVindas">Mensagem de boas-vindas</label>
        <input type="text" class="form-control" id="mensagemBoasVindas" placeholder="Digite a mensagem" />
      </div>

      <button type="submit" class="btn btn-primary btn-salvar">Salvar Configurações</button>
    </form>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
