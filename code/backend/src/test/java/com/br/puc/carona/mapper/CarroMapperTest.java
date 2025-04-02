package com.br.puc.carona.mapper;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.model.Carro;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: Carro")
class CarroMapperTest {

    @Spy
    @InjectMocks
    private CarroMapper mapper;

    @Test
    @DisplayName("Deve converter Carro para CarroDto corretamente")
    void deveConverterCarroParaCarroDtoCorretamente() {
        // Given
        final Carro carro = Carro.builder()
                .id(1L)
                .modelo("Corolla")
                .cor("Preto")
                .placa("ABC1234")
                .atualizadoPor("usuario")
                .dataAtualizacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .criadoPor("usuario")
                .dataCriacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .build();

        // When
        final CarroDto dto = mapper.toDto(carro);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(carro.getId(), dto.getId());
        Assertions.assertEquals(carro.getModelo(), dto.getModelo());
        Assertions.assertEquals(carro.getCor(), dto.getCor());
        Assertions.assertEquals(carro.getPlaca(), dto.getPlaca());
        Assertions.assertEquals(carro.getAtualizadoPor(), dto.getAtualizadoPor());
        Assertions.assertEquals(carro.getDataAtualizacao(), dto.getDataAtualizacao());
        Assertions.assertEquals(carro.getCriadoPor(), dto.getCriadoPor());
        Assertions.assertEquals(carro.getDataCriacao(), dto.getDataCriacao());
    }

    @Test
    @DisplayName("Deve converter CarroRequest para Carro corretamente")
    void deveConverterCarroRequestParaCarroCorretamente() {
        // Given
        final CarroRequest request = CarroRequest.builder()
                .modelo("Civic")
                .cor("Branco")
                .placa("XYZ5678")
                .capacidadePassageiros(4)
                .build();

        // When
        final Carro carro = mapper.toEntity(request);

        // Then
        Assertions.assertNotNull(carro);
        Assertions.assertEquals(request.getModelo(), carro.getModelo());
        Assertions.assertEquals(request.getCor(), carro.getCor());
        Assertions.assertEquals(request.getPlaca(), carro.getPlaca());
        Assertions.assertEquals(request.getCapacidadePassageiros(), carro.getCapacidadePassageiros());
        Assertions.assertNull(carro.getId()); // Id should be ignored in mapping
        Assertions.assertNull(carro.getAtualizadoPor()); // AtualizadoPor should be null
        Assertions.assertNull(carro.getDataAtualizacao()); // DataAtualizacao should be null
        Assertions.assertNull(carro.getCriadoPor()); // CriadoPor should be null
        Assertions.assertNull(carro.getDataCriacao()); // DataCriacao should be null
    }
    
    @Test
    @DisplayName("Deve retornar null quando carro for null")
    void deveRetornarNullQuandoCarroForNull() {
        // When
        final CarroDto dto = mapper.toDto(null);
        
        // Then
        Assertions.assertNull(dto);
    }
    
    @Test
    @DisplayName("Deve retornar null quando request for null")
    void deveRetornarNullQuandoRequestForNull() {
        // When
        final Carro entity = mapper.toEntity(null);
        
        // Then
        Assertions.assertNull(entity);
    }
}
