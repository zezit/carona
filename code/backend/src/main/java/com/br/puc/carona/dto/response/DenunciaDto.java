package com.br.puc.carona.dto.response;

import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.TipoDenuncia;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Builder
@Data
public class DenunciaDto {
    private Long id;
    private Long caronaId;
    private EstudanteResumoDto denunciante;
    private EstudanteResumoDto denunciado;
    private TipoDenuncia tipo;
    private String descricao;
    private LocalDateTime dataHora;
    private Status status;
    private String resolucao;
    private LocalDateTime dataHoraResolucao;
}
