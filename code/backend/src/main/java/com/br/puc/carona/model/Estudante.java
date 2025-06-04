package com.br.puc.carona.model;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.br.puc.carona.enums.Status;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true, exclude = "perfilMotorista")
@Entity
@Table(name = "estudante")
public class Estudante extends Usuario {

    @Column(nullable = false)
    private LocalDate dataDeNascimento;

    @Column(nullable = false, unique = true)
    private String matricula;

    @Column
    private Float avaliacaoMedia;

    @Column(nullable = true)
    private String curso;

    @OneToOne(mappedBy = "estudante", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private PerfilMotorista perfilMotorista;

    @Column(nullable = false)
    @Builder.Default
    private String fcmToken = "fcmToken";

    public boolean isMotorista() {
        return perfilMotorista != null;
    }

    public boolean isAccountApproved() {
        return Status.APROVADO.equals(getStatusCadastro());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return isMotorista() ? List.of(new SimpleGrantedAuthority("ROLE_MOTORISTA")) : List.of(new SimpleGrantedAuthority("ROLE_PASSAGEIRO"));
    }
}
