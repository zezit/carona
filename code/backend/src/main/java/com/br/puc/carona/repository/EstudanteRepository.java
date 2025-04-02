package com.br.puc.carona.repository;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.Estudante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstudanteRepository extends JpaRepository<Estudante, Long> {
    Optional<Estudante> findByEmail(String email);
    Boolean existsByEmail(String email);
    boolean existsByMatricula(String matricula);
    
    List<Estudante> findByNomeContainingIgnoreCase(String nome);
    
    Page<Estudante> findByCursoIgnoreCase(String curso, Pageable pageable);
    
    List<Estudante> findByStatusCadastro(Status status);
}
