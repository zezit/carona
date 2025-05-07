package com.br.puc.carona.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

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

    Set<Carona> findByStatusAndDataHoraPartidaAfter(StatusCarona agendada, LocalDateTime minusMinutes);

    @Query("SELECT COUNT(c) > 0 FROM Carona c " +
            "WHERE c.motorista.id = :motoristaId " +
            "AND c.status = com.br.puc.carona.enums.StatusCarona.EM_ANDAMENTO")
    boolean driverIsAlreadyDriving(Long motoristaId);

    @Query("SELECT COUNT(c) > 0 FROM Carona c " +
            "JOIN c.passageiros p " +
            "WHERE p.id = :passageiroId " +
            "AND (c.status = com.br.puc.carona.enums.StatusCarona.EM_ANDAMENTO OR c.status = com.br.puc.carona.enums.StatusCarona.AGENDADA) "
            +
            "AND :dataAtual BETWEEN c.dataHoraPartida AND c.dataHoraChegada")
    boolean isPassangerAlreadyInRide(Long passageiroId, LocalDateTime dataAtual);

    @Query("""
               SELECT c
                 FROM Carona c
                WHERE c.status        = com.br.puc.carona.enums.StatusCarona.AGENDADA
                  AND c.vagas         > SIZE(c.passageiros)
                  AND (EXTRACT(HOUR FROM c.dataHoraPartida) * 3600
                     + EXTRACT(MINUTE FROM c.dataHoraPartida) * 60
                     + EXTRACT(SECOND FROM c.dataHoraPartida)
                     + c.tempoEstimadoSegundos)
                    <= :arrivalEpochSec
            """)
    List<Carona> findViableCaronas(int arrivalEpochSec);

}