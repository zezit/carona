package com.br.puc.carona.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.dto.LocationDTO;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.model.Carona;

@Repository
public interface CaronaRepository extends JpaRepository<Carona, Long> {

    @Query("SELECT c FROM Carona c WHERE c.motorista.id = :motoristaId ORDER BY c.dataHoraPartida DESC")
    Page<Carona> findByMotoristaIdOrderByDataHoraPartidaDesc(final Long motoristaId, final Pageable pageable);

    List<Carona> findByMotoristaIdAndStatusAndDataHoraPartidaAfterOrderByDataHoraPartidaAsc(
            Long motoristaId, StatusCarona status, LocalDateTime dataAtual);

    List<Carona> findByMotoristaIdAndStatusOrderByDataHoraPartidaAsc(
            Long motoristaId, StatusCarona status);

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
                 WHERE c.status = com.br.puc.carona.enums.StatusCarona.AGENDADA
                   AND c.vagas > SIZE(c.passageiros)
                   AND c.dataHoraChegada BETWEEN :lowerBound AND :upperBound
            """)
    List<Carona> findViableCaronas(LocalDateTime lowerBound,
            LocalDateTime upperBound,
            LocationDTO studentOrigin,
            LocationDTO studentDestination);

    List<Carona> findByDataHoraPartidaBetween(LocalDateTime start, LocalDateTime end);

    // Method for filtering caronas by status with pagination
    Page<Carona> findByStatus(StatusCarona status, Pageable pageable);

    // Search methods for admin functionality
    @Query("SELECT c FROM Carona c WHERE c.status = :status AND " +
           "(LOWER(c.motorista.estudante.nome) LIKE :searchTerm OR " +
           "LOWER(c.pontoPartida) LIKE :searchTerm OR " +
           "LOWER(c.pontoDestino) LIKE :searchTerm)")
    Page<Carona> findByStatusAndSearch(@Param("status") StatusCarona status, 
                                       @Param("searchTerm") String searchTerm, 
                                       Pageable pageable);

    @Query("SELECT c FROM Carona c WHERE " +
           "(LOWER(c.motorista.estudante.nome) LIKE :searchTerm OR " +
           "LOWER(c.pontoPartida) LIKE :searchTerm OR " +
           "LOWER(c.pontoDestino) LIKE :searchTerm)")
    Page<Carona> findBySearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Method to find caronas where a student was a passenger
    @Query("SELECT c FROM Carona c " +
           "JOIN c.passageiros p " +
           "WHERE p.id = :estudanteId " +
           "ORDER BY c.dataHoraPartida DESC")
    List<Carona> findByPassageiroIdOrderByDataHoraPartidaDesc(@Param("estudanteId") Long estudanteId);

    // Method to find active caronas where a student is a passenger (with specific status)
    @Query("SELECT c FROM Carona c " +
           "JOIN c.passageiros p " +
           "WHERE p.id = :estudanteId " +
           "AND c.status = :status " +
           "ORDER BY c.dataHoraPartida ASC")
    List<Carona> findByPassageiroIdAndStatusOrderByDataHoraPartidaAsc(@Param("estudanteId") Long estudanteId, @Param("status") StatusCarona status);

    // Statistics count methods
    Long countByStatus(StatusCarona status);
}