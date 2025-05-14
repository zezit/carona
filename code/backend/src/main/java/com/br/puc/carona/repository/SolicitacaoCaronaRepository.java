package com.br.puc.carona.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.SolicitacaoCarona;

@Repository
public interface SolicitacaoCaronaRepository extends JpaRepository<SolicitacaoCarona, Long> {

    List<SolicitacaoCarona> findByEstudante(Estudante estudante);

    List<SolicitacaoCarona> findByEstudanteId(Long estudanteId);

}