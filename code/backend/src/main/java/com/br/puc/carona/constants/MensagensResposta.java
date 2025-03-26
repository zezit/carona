package com.br.puc.carona.constants;

/**
 * Classe utilitária que contém as mensagens de resposta do sistema.
 */
public final class MensagensResposta {
    // Mensagens gerais
    public static final String ERRO_INTERNO = "erro.interno";
    public static final String ACESSO_NEGADO = "acesso.negado";
    
    // Mensagens relacionadas ao usuário
    public static final String USUARIO_NAO_ENCONTRADO = "usuario.nao.encontrado";
    public static final String USUARIO_NAO_ENCONTRADO_ID = "usuario.nao.encontrado.id";
    public static final String USUARIO_NAO_ENCONTRADO_EMAIL = "usuario.nao.encontrado.email";
    public static final String EMAIL_JA_CADASTRADO = "email.ja.cadastrado";
    public static final String CNH_OBRIGATORIA = "cnh.obrigatoria";
    public static final String CARRO_OBRIGATORIO = "carro.obrigatorio";
    public static final String CADASTRO_SUCESSO = "usuario.cadastro.sucesso";
    public static final String FORMATO_SENHA_INVALIDO = "senha.formato.invalido";
    public static final String CADASTRO_JA_REVISADO = "status.ja_revisado";
    public static final String STATUS_CADASTRO_INVALIDO = "status.invalido";
    public static final String CADASTRO_NAO_APROVADO = "usuario.cadastro.nao_aprovado";

    // Messagens relacionadas aos estudantes
    public static final String MATRICULA_JA_CADASTRADA = "usuario.estudante.matricula.ja_cadastrada";

    // Mensagens relacionadas ao motorista
    public static final String ESTUDANTE_JA_E_MOTORISTA = "usuario.estudante.motorista.ja_e_motorista";
    public static final String CNH_JA_CADASTRADA = "usuario.estudante.motorista.cnh_ja_cadastrada";
    public static final String ESTUDANTE_NAO_E_MOTORISTA = "usuario.estudante.motorista.nao_e_motorista";
    
    // Mensagens relacionadas à autenticação
    public static final String LOGIN_INVALIDO = "login.invalido";
    public static final String TOKEN_INVALIDO = "token.invalido";
    public static final String TOKEN_EXPIRADO = "token.expirado";
    
    // Mensagens relacionadas à validação
    public static final String CAMPO_OBRIGATORIO = "campo.obrigatorio";
    public static final String EMAIL_INVALIDO = "email.invalido";
    public static final String SENHA_TAMANHO_INVALIDO = "senha.tamanho.invalido";
    public static final String NOME_TAMANHO_INVALIDO = "nome.tamanho.invalido";
    public static final String REQUISICAO_INVALIDA = "requisicao.invalida";
    
    // Comuns
    public static final String PARAMETRO_INVALIDO = "comum.parametro.invalido";
    public static final String PARAMETRO_FALTANTE = "comum.parametro.faltante";
    public static final String ENTIDADE_NAO_ENCONTRADA = "comum.cliente.entidade_nao_encontrada";

    private MensagensResposta() {
        throw new IllegalStateException("Utility class");
    }
}
