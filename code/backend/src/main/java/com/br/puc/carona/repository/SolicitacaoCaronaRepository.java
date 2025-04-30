package com.br.puc.carona.repository;

import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.SolicitacaoCarona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoCaronaRepository extends JpaRepository<SolicitacaoCarona, Long> {

    Optional<SolicitacaoCarona> findByEstudante(Estudante estudante);

    List<SolicitacaoCarona> findByEstudanteId(Long estudanteId);

}