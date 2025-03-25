package com.br.puc.carona.model;

import jakarta.persistence.Entity;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "administradores")
@SequenceGenerator(name = "id_sequence", sequenceName = "admin_seq", allocationSize = 1)
public class Administrador extends Usuario {
    // No specific fields for now
}
