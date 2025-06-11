package com.br.puc.carona.repository;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Denuncia;
import com.br.puc.carona.model.Estudante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {
    boolean existsByCaronaAndDenuncianteAndDenunciado(Carona carona, Estudante denunciante, Estudante denunciado);

    Page<Denuncia> findByCaronaIdOrderByDataHoraDesc(Long caronaId, Pageable pageable);
    Page<Denuncia> findByDenuncianteIdOrderByDataHoraDesc(Long denuncianteId, Pageable pageable);
    Page<Denuncia> findByDenunciadoIdOrderByDataHoraDesc(Long denunciadoId, Pageable pageable);
    Page<Denuncia> findByStatus(Status status, Pageable pageable);
    Page<Denuncia> findByStatusOrderByDataHoraDesc(Status status, Pageable pageable);
}
