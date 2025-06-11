package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.response.AvaliacaoAnonimaDto;
import com.br.puc.carona.dto.response.AvaliacaoDto;
import com.br.puc.carona.dto.response.EstudanteResumoDto;
import com.br.puc.carona.model.Avaliacao;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;

@Component
public class AvaliacaoMapper {

    public AvaliacaoDto toDto(final Avaliacao entity) {
        if (entity == null) {
            return null;
        }

        return AvaliacaoDto.builder()
                .id(entity.getId())
                .caronaId(entity.getCarona() != null ? entity.getCarona().getId() : null)
                .avaliador(toEstudanteResumo(entity.getAvaliador()))
                .avaliado(toEstudanteResumo(entity.getAvaliado()))
                .nota(entity.getNota())
                .comentario(entity.getComentario())
                .dataHora(entity.getDataHora())
                .tipo(entity.getTipo())
                .build();
    }

    public AvaliacaoAnonimaDto toAnonimaDto(final Avaliacao entity) {
        if (entity == null) {
            return null;
        }

        return AvaliacaoAnonimaDto.builder()
                .id(entity.getId())
                .caronaId(entity.getCarona() != null ? entity.getCarona().getId() : null)
                .nota(entity.getNota())
                .comentario(entity.getComentario())
                .dataHora(entity.getDataHora())
                .tipo(entity.getTipo())
                .build();
    }

    public Avaliacao toEntity(final AvaliacaoDto dto) {
        if (dto == null) {
            return null;
        }

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setId(dto.getId());

        // Supondo que os relacionamentos serão carregados/referenciados fora do mapper,
        // aqui colocamos apenas objetos com IDs preenchidos para vinculação posterior.

        Carona carona = new Carona();
        carona.setId(dto.getCaronaId());
        avaliacao.setCarona(carona);

        Estudante avaliador = new Estudante();
        if (dto.getAvaliador() != null) {
            avaliador.setId(dto.getAvaliador().getId());
        }
        avaliacao.setAvaliador(avaliador);

        Estudante avaliado = new Estudante();
        if (dto.getAvaliado() != null) {
            avaliado.setId(dto.getAvaliado().getId());
        }
        avaliacao.setAvaliado(avaliado);

        avaliacao.setNota(dto.getNota());
        avaliacao.setComentario(dto.getComentario());
        avaliacao.setDataHora(dto.getDataHora());
        avaliacao.setTipo(dto.getTipo());

        return avaliacao;
    }

    private EstudanteResumoDto toEstudanteResumo(Estudante estudante) {
        if (estudante == null) {
            return null;
        }

        return EstudanteResumoDto.builder()
                .id(estudante.getId())
                .nome(estudante.getNome())
                .build();
    }
}
