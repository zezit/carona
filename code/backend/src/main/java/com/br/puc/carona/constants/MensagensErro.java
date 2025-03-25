package com.br.puc.carona.constants;

/**
 * Classe utilitária que contém as mensagens de erro do sistema.
 */
public class MensagensErro {
    // Mensagens gerais
    public static final String ERRO_INTERNO = "erro.interno";
    public static final String ACESSO_NEGADO = "acesso.negado";
    
    // Mensagens relacionadas ao usuário
    public static final String USUARIO_NAO_ENCONTRADO = "usuario.nao.encontrado";
    public static final String USUARIO_NAO_ENCONTRADO_ID = "usuario.nao.encontrado.id";
    public static final String USUARIO_NAO_ENCONTRADO_EMAIL = "usuario.nao.encontrado.email";
    public static final String EMAIL_JA_CADASTRADO = "email.ja.cadastrado";
    public static final String MATRICULA_JA_CADASTRADA = "matricula.ja.cadastrada";
    public static final String CNH_JA_CADASTRADA = "cnh.ja.cadastrada";
    public static final String CNH_OBRIGATORIA = "cnh.obrigatoria";
    public static final String VEICULO_OBRIGATORIO = "veiculo.obrigatorio";
    public static final String CADASTRO_SUCESSO = "usuario.cadastro.sucesso";
    public static final String FORMATO_SENHA_INVALIDO = "senha.formato.invalido";
    
    // Mensagens relacionadas à autenticação
    public static final String LOGIN_INVALIDO = "login.invalido";
    public static final String TOKEN_INVALIDO = "token.invalido";
    public static final String TOKEN_EXPIRADO = "token.expirado";
    
    // Mensagens relacionadas à validação
    public static final String CAMPO_OBRIGATORIO = "campo.obrigatorio";
    public static final String EMAIL_INVALIDO = "email.invalido";
    public static final String SENHA_TAMANHO_INVALIDO = "senha.tamanho.invalido";
    public static final String NOME_TAMANHO_INVALIDO = "nome.tamanho.invalido";
    
    // Mensagens relacionadas ao administrador
    public static final String ADMIN_CADASTRO_SUCESSO = "admin.cadastro.sucesso";

    // Comuns
    public static final String PARAMETRO_INVALIDO = "comum.parametro.invalido";
    public static final String PARAMETRO_FALTANTE = "comum.parametro.faltante";
}
