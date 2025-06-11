package com.br.puc.carona.dto.request;

import com.br.puc.carona.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolverDenunciaRequest {
    private Status status;

    private String resolucao;
}
