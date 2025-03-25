package com.br.puc.carona.model;

import com.br.puc.carona.enums.StatusCadastro;
import com.br.puc.carona.enums.TipoUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@SequenceGenerator(name = "id_sequence", sequenceName = "usuario_seq", allocationSize = 1)
public class Usuario extends AbstractEntity {
    
    @Column(name = "nome", nullable = false)
    private String nome;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "senha", nullable = false)
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false)
    private TipoUsuario tipoUsuario;
    
    @Column(name = "status_cadastro")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusCadastro status = StatusCadastro.PENDENTE;
}
