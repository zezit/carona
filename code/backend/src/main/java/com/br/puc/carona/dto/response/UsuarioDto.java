package com.br.puc.carona.dto.response;

import com.br.puc.carona.dto.AbstractDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoUsuario;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UsuarioDto extends AbstractDto {
    private String nome;
    private String email;
    private TipoUsuario tipoUsuario;
    private Status statusCadastro;
    private String imgUrl;
}
