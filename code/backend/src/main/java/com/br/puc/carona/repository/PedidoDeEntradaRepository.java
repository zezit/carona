package com.br.puc.carona.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.PedidoDeEntrada;

@Repository
public interface PedidoDeEntradaRepository extends JpaRepository<PedidoDeEntrada, Long> {
    
    @Query("SELECT p FROM PedidoDeEntrada p WHERE p.carona.id = :caronaId AND p.status = :pendente AND p.carona.motorista.id = :motoristaId")
    Page<PedidoDeEntrada> findAllByCaronaIdAndStatusAndCaronaMotoristaId(
        @Param("caronaId") Long caronaId, 
        @Param("pendente") Status pendente,
        @Param("motoristaId") Long motoristaId,
        Pageable pageable);

    @Query("SELECT p FROM PedidoDeEntrada p WHERE p.carona.id = :caronaId AND p.solicitacao.estudante.id = :estudanteId AND p.status = com.br.puc.carona.enums.Status.PENDENTE")
    Optional<PedidoDeEntrada> findByCaronaIdAndSolicitacaoEstudanteId(
        @Param("caronaId") Long caronaId,
        @Param("estudanteId") Long estudanteId);
}
