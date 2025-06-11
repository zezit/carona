package com.br.puc.carona.dto.request;

import com.br.puc.carona.enums.TipoDenuncia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DenunciaRequest {

    @NotNull(message = "O ID do estudante denunciado é obrigatório")
    private Long denunciadoId;

    @NotNull(message = "O tipo de denúncia é obrigatório")
    private TipoDenuncia tipo;

    @NotBlank(message = "A descrição da denúncia é obrigatória")
    private String descricao;
}
