package com.br.puc.carona.dto.response;

import java.time.LocalDate;
import java.util.Set;

import com.br.puc.carona.dto.AbstractDTO;
import com.br.puc.carona.enums.StatusCadastro;
import com.br.puc.carona.enums.TipoEstudante;
import com.br.puc.carona.enums.TipoUsuario;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class UserDto extends AbstractDTO {
    
    private String nome;
    private String email;
    private TipoUsuario tipoUsuario;
    private StatusCadastro statusCadastro;
    
    // Campos específicos de Estudante
    private LocalDate dataDeNascimento;
    private String matricula;
    private TipoEstudante tipoEstudante;
    private Float avaliacaoMedia;
    
    // Campos específicos de Motorista
    private String cnh;
    private String whatsapp;
    private Boolean mostrarWhatsapp;
    private CarroDto veiculo;
    
    // Outros
    private Set<String> perfis;
}
