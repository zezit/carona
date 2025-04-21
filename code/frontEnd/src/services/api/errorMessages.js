/**
 * Error message mapping based on backend codes in MensagensResposta
 */
export const ERROR_MESSAGES = {
  // General errors
  'erro.interno': 'Ocorreu um erro interno no servidor',
  'acesso.negado': 'Acesso negado para este recurso',
  'requisicao.invalida': 'Requisição inválida',
  
  // User related errors
  'usuario.nao.encontrado': 'Usuário não encontrado',
  'usuario.nao.encontrado.id': 'Usuário não encontrado com este ID',
  'usuario.nao.encontrado.email': 'Usuário não encontrado com este email',
  'email.ja.cadastrado': 'Este email já está cadastrado',
  'cadastro.sucesso': 'Cadastro realizado com sucesso',
  'formato.senha.invalido': 'Formato de senha inválido',
  'cadastro.ja_revisado': 'Cadastro já foi revisado',
  'status.invalido': 'Status de cadastro inválido',
  'usuario.cadastro.nao_aprovado': 'Cadastro não aprovado',
  
  // Student related errors
  'usuario.estudante.matricula.ja_cadastrada': 'Esta matrícula já está cadastrada',
  
  // Driver related errors
  'usuario.estudante.motorista.ja_e_motorista': 'Estudante já é motorista',
  'usuario.estudante.motorista.cnh_ja_cadastrada': 'CNH já cadastrada',
  'usuario.estudante.motorista.nao_e_motorista': 'Estudante não é motorista',
  'cnh.obrigatoria': 'CNH é obrigatória',
  'carro.obrigatorio': 'Informações do carro são obrigatórias',
  
  // Authentication related errors
  'login.invalido': 'Email ou senha incorretos',
  'token.invalido': 'Sessão inválida, faça login novamente',
  'token.expirado': 'Sua sessão expirou, faça login novamente',
  'internal auth error': 'Erro no sistema de autenticação',
  
  // Validation related errors
  'campo.obrigatorio': 'Campo obrigatório não preenchido',
  'email.invalido': 'Formato de email inválido',
  'senha.tamanho.invalido': 'Tamanho de senha inválido',
  'nome.tamanho.invalido': 'Tamanho de nome inválido',
  
  // Common errors
  'comum.parametro.invalido': 'Parâmetros inválidos fornecidos',
  'comum.parametro.faltante': 'Parâmetro obrigatório não fornecido',
  'comum.cliente.entidade_nao_encontrada': 'Recurso não encontrado',
  
  // Connection errors
  'timeout': 'Tempo limite de requisição excedido',
  'network_error': 'Erro de conexão. Verifique sua internet'
};
