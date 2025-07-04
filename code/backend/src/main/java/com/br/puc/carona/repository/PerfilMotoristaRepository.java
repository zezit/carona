package com.br.puc.carona.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.PerfilMotorista;

@Repository
public interface PerfilMotoristaRepository extends JpaRepository<PerfilMotorista, Long> {
    boolean existsByCnh(String cnh);

    Optional<PerfilMotorista> findByEstudanteId(Long id);
}
