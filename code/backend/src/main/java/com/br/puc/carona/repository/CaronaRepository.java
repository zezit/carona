package com.br.puc.carona.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;

@Repository
public interface CaronaRepository extends JpaRepository<Carona, Long> {

    @Query("SELECT c FROM Carona c WHERE c.motorista.id = :motoristaId ORDER BY c.dataHoraPartida DESC")
    Page<Carona> findByMotoristaIdOrderByDataHoraPartidaDesc(final Long motoristaId, final Pageable pageable);

    List<Carona> findByMotoristaIdAndStatusAndDataHoraPartidaAfterOrderByDataHoraPartidaAsc(
            Long motoristaId, StatusCarona status, LocalDateTime dataAtual);

    // New method to find active caronas for conflict checking
    List<Carona> findByMotoristaIdAndStatusNotInAndDataHoraChegadaAfter(
            Long motoristaId, List<StatusCarona> statusList, LocalDateTime dataAtual);
}