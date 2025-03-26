package com.br.puc.carona.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.Estudante;

@Repository
public interface EstudanteRepository extends JpaRepository<Estudante, Long> {
    Optional<Estudante> findByEmail(String email);
    Boolean existsByEmail(String email);
    Boolean existsByMatricula(String matricula);
}
