package com.br.puc.carona.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.Carona;

@Repository
public interface CaronaRepository extends JpaRepository<Carona, Long> {

    /*
     * @Query("SELECT v FROM Viagem v WHERE v.motorista.id = :motoristaId ORDER BY v.dataHoraPartida DESC"
     * ) Page<Viagem> findByMotoristaIdOrderByDataHoraPartidaDesc(@Param("motoristaId") Long
     * motoristaId, Pageable pageable);
     * @Query("SELECT v FROM Viagem v WHERE v.status = :status AND v.motorista.id = :motoristaId ORDER BY v.dataHoraPartida DESC"
     * ) Page<Viagem> findByStatusAndMotoristaIdOrderByDataHoraPartidaDesc(@Param("status") StatusViagem
     * status,
     * @Param("motoristaId") Long motoristaId, Pageable pageable);
     * @Query("SELECT v FROM Viagem v WHERE v.motorista.id = :motoristaId AND v.dataHoraPartida >= :dataMinima ORDER BY v.dataHoraPartida ASC"
     * ) List<Viagem> findProximasViagensByMotoristaId(@Param("motoristaId") Long motoristaId,
     * @Param("dataMinima") LocalDateTime dataMinima);
     * @Query("SELECT COUNT(v) FROM Viagem v WHERE v.status = :status AND v.motorista.id = :motoristaId"
     * ) Long countByStatusAndMotoristaId(@Param("status") StatusViagem status, @Param("motoristaId")
     * Long motoristaId);
     * @Query("SELECT v FROM Viagem v JOIN v.passageiros p WHERE p.id = :passageiroId ORDER BY v.dataHoraPartida DESC"
     * ) Page<Viagem> findByPassageiroIdOrderByDataHoraPartidaDesc(@Param("passageiroId") Long
     * passageiroId, Pageable pageable);
     * @Query("SELECT v FROM Viagem v WHERE v.status = :status AND v.dataHoraPartida BETWEEN :inicio AND :fim"
     * ) List<Viagem> findByStatusAndDataHoraPartidaBetween(@Param("status") StatusViagem status,
     * @Param("inicio") LocalDateTime inicio,
     * @Param("fim") LocalDateTime fim); }
     */

    @Query("SELECT c FROM Carona c WHERE c.motorista.id = :motoristaId ORDER BY c.dataHoraPartida DESC")
    Page<Carona> findByMotoristaIdOrderByDataHoraPartidaDesc(final Long motoristaId, final Pageable pageable);
}