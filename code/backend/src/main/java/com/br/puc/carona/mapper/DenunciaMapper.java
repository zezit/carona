package com.br.puc.carona.mapper;

import org.springframework.stereotype.Component;

import com.br.puc.carona.dto.response.DenunciaDto;
import com.br.puc.carona.dto.response.EstudanteResumoDto;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Denuncia;
import com.br.puc.carona.model.Estudante;

@Component
public class DenunciaMapper {

    public DenunciaDto toDto(final Denuncia entity) {
        if (entity == null) {
            return null;
        }

        return DenunciaDto.builder()
                .id(entity.getId())
                .caronaId(entity.getCarona() != null ? entity.getCarona().getId() : null)
                .denunciante(toEstudanteResumo(entity.getDenunciante()))
                .denunciado(toEstudanteResumo(entity.getDenunciado()))
                .tipo(entity.getTipo())
                .descricao(entity.getDescricao())
                .dataHora(entity.getDataHora())
                .status(entity.getStatus())
                .resolucao(entity.getResolucao())
                .dataHoraResolucao(entity.getDataHoraResolucao())
                .build();
    }

    public Denuncia toEntity(final DenunciaDto dto) {
        if (dto == null) {
            return null;
        }

        Denuncia denuncia = new Denuncia();
        denuncia.setId(dto.getId());

        Carona carona = new Carona();
        carona.setId(dto.getCaronaId());
        denuncia.setCarona(carona);

        Estudante denunciante = new Estudante();
        if (dto.getDenunciante() != null) {
            denunciante.setId(dto.getDenunciante().getId());
        }
        denuncia.setDenunciante(denunciante);

        Estudante denunciado = new Estudante();
        if (dto.getDenunciado() != null) {
            denunciado.setId(dto.getDenunciado().getId());
        }
        denuncia.setDenunciado(denunciado);

        denuncia.setTipo(dto.getTipo());
        denuncia.setDescricao(dto.getDescricao());
        denuncia.setDataHora(dto.getDataHora());
        denuncia.setStatus(dto.getStatus());
        denuncia.setResolucao(dto.getResolucao());
        denuncia.setDataHoraResolucao(dto.getDataHoraResolucao());

        return denuncia;
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
