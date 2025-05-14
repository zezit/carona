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
    public static final String USUARIO_NAO_AUTENTICADO = "usuario.nao_autenticado";
    public static final String ADMINISTRADOR_NAO_PODE_ACESSAR_RECURSO = "usuario.administrador.nao_pode_acessar_recurso";

    // Messagens relacionadas aos estudantes
    public static final String MATRICULA_JA_CADASTRADA = "usuario.estudante.matricula.ja_cadastrada";
    public static final String ESTUDANTE_NAO_ENCONTRADO = "usuario.estudante.nao_encontrado";
    public static final String ESTUDANTE_NAO_PODE_ACESSAR_RECURSO = "usuario.estudante.nao_pode_acessar_recurso";
    
    // Mensagens relacionadas ao motorista
    public static final String ESTUDANTE_JA_E_MOTORISTA = "usuario.estudante.motorista.ja_e_motorista";
    public static final String CNH_JA_CADASTRADA = "usuario.estudante.motorista.cnh_ja_cadastrada";
    public static final String ESTUDANTE_NAO_E_MOTORISTA = "usuario.estudante.motorista.nao_e_motorista";
    
    // Mensagens relacionadas a caronas
    public static final String CARONA_NAO_ENCONTRADA = "carona.nao.encontrada";
    public static final String CARONA_CONCLUIDA_CANCELADA = "carona.concluida_cancelada";
    public static final String CARONA_JA_INICIADA = "carona.ja.iniciada";
    public static final String CARONA_NAO_PLANEJADA = "carona.nao.planejada";
    public static final String VAGAS_INSUFICIENTES = "carona.vagas.insuficientes";
    public static final String CARONA_SEM_VAGAS = "carona.sem.vagas";
    public static final String ESTUDANTE_JA_PASSAGEIRO = "carona.estudante.ja.passageiro";
    public static final String MOTORISTA_COMO_PASSAGEIRO = "carona.motorista.como.passageiro";
    public static final String DATA_PARTIDA_INVALIDA = "carona.data.partida.invalida";
    public static final String DATA_CHEGADA_INVALIDA = "carona.data.chegada.invalida";
    public static final String DATA_CHEGADA_ANTERIOR_PARTIDA = "carona.data.chegada.anterior_partida";
    public static final String NECESSARIO_INFORMAR_DATA_PARTIDA_CHEGADA = "carona.data.deve_informar_partida_ou_chegada";
    public static final String CARONA_NAO_PERTENCE_AO_MOTORISTA = "carona.nao_pertence_motorista";
    public static final String ALTERACAO_STATUS_CARONA_INVALIDA = "carona.alteracao_status_invalida";
    public static final String CARONA_NAO_PERMITE_ADICIONAR_PASSAGEIRO = "carona.nao_permite_adicionar_passageiro";
    public static final String CARONA_STATUS_INVALIDO = "carona.status.invalido";
    public static final String CARONA_HORARIO_FORA_DA_JANELA = "carona.horario.fora_janela";

    public static final String QUANTIDADE_VAGAS_INVALIDAS = "carona.quantidade_vagas.invalida";
    public static final String PASSAGEIRO_JA_EM_CARONA = "carona.estudante.ja_em_carona";

    // Mensagens relacionadas a trajetos
    public static final String TRAJETO_NAO_ENCONTRADO = "carona.trajeto.nao_encontrado";

    // Mensagens relacionadas à autenticação
    public static final String LOGIN_INVALIDO = "login.invalido";
    public static final String TOKEN_INVALIDO = "token.invalido";
    public static final String TOKEN_EXPIRADO = "token.expirado";
    public static final String INTERNAL_AUTH_ERROR = "internal auth error";
    
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
    
    // Mensagens relacionadas ao upload de arquivos
    public static final String ARQUIVO_INVALIDO = "arquivo.invalido";
    public static final String ARQUIVO_VAZIO = "arquivo.vazio";
    public static final String FORMATO_ARQUIVO_INVALIDO = "arquivo.formato.invalido";
    public static final String ARQUIVO_MUITO_GRANDE = "arquivo.muito.grande";
    public static final String IMAGEM_CORROMPIDA = "arquivo.imagem.corrompida";
    public static final String ERRO_LEITURA_ARQUIVO = "arquivo.erro.leitura";
    public static final String PROPORCAO_IMAGEM_INVALIDA = "arquivo.imagem.proporcao.invalida";
    public static final String IMAGEM_MUITO_PEQUENA = "arquivo.imagem.muito.pequena";
    public static final String IMAGEM_MUITO_GRANDE = "arquivo.imagem.muito.grande";
    public static final String ERRO_UPLOAD_ARQUIVO = "arquivo.erro.upload";
    public static final String ERRO_ATUALIZACAO_ARQUIVO = "arquivo.erro.atualizacao";

    // Mensagens relacionadas a solicitação de caronas
    public static final String SOLICITACAO_CARONA_NAO_ENCONTRADA = "solicitacao_carona.nao.encontrada";

    // Mensagens para avaliação
    public static final String AVALIACAO_NAO_ENCONTRADA = "Avaliação não encontrada com ID %s";
    public static final String CARONA_NAO_FINALIZADA = "Não é possível avaliar uma carona que não foi finalizada";
    public static final String NAO_PARTICIPOU_DA_CARONA = "Você não participou desta carona e não pode realizar uma avaliação";
    public static final String AVALIADO_NAO_PARTICIPOU_DA_CARONA = "O estudante avaliado não participou desta carona";
    public static final String AVALIACAO_JA_REALIZADA = "Você já avaliou este estudante nesta carona";
    public static final String NOTA_INVALIDA = "A nota deve estar entre 1 e 5";
    public static final String NAO_E_AVALIADOR = "Você não pode modificar uma avaliação que não foi feita por você";

    private MensagensResposta() {
        throw new IllegalStateException("Utility class");
    }
}
