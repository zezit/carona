package com.br.puc.carona.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.Motorista;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
    
    Optional<Motorista> findByEmail(String email);
    
    Boolean existsByCnh(String cnh);
}
