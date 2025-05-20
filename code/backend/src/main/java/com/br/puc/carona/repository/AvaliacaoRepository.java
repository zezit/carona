package com.br.puc.carona.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.br.puc.carona.model.Avaliacao;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {

    /**
     * Busca todas as avaliações de uma carona ordenadas por data e hora decrescente
     *
     * @param caronaId ID da carona
     * @param pageable configuração de paginação
     * @return página de avaliações
     */
    Page<Avaliacao> findByCaronaIdOrderByDataHoraDesc(Long caronaId, Pageable pageable);

    /**
     * Busca todas as avaliações recebidas por um estudante ordenadas por data e hora decrescente
     *
     * @param avaliadoId ID do estudante avaliado
     * @param pageable configuração de paginação
     * @return página de avaliações
     */
    Page<Avaliacao> findByAvaliadoIdOrderByDataHoraDesc(Long avaliadoId, Pageable pageable);

    /**
     * Busca todas as avaliações realizadas por um estudante ordenadas por data e hora decrescente
     *
     * @param avaliadorId ID do estudante avaliador
     * @param pageable configuração de paginação
     * @return página de avaliações
     */
    Page<Avaliacao> findByAvaliadorIdOrderByDataHoraDesc(Long avaliadorId, Pageable pageable);

    /**
     * Verifica se já existe uma avaliação para a combinação de carona, avaliador e avaliado
     *
     * @param carona carona
     * @param avaliador estudante avaliador
     * @param avaliado estudante avaliado
     * @return true se já existe uma avaliação
     */
    boolean existsByCaronaAndAvaliadorAndAvaliado(Carona carona, Estudante avaliador, Estudante avaliado);

    /**
     * Busca todas as avaliações recebidas por um estudante
     *
     * @param avaliadoId ID do estudante avaliado
     * @return lista de avaliações
     */
    List<Avaliacao> findByAvaliadoId(Long avaliadoId);
}