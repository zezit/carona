package com.br.puc.carona.mapper;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.response.CarroDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.model.Carro;
import com.br.puc.carona.model.PerfilMotorista;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: PerfilMotorista")
class PerfilMotoristaMapperTest {

    @Mock
    private CarroMapper carroMapper;
    
    @Mock
    private EstudanteMapper estudanteMapper;

    @InjectMocks
    private PerfilMotoristaMapper perfilMotoristaMapper;

    private PerfilMotorista perfilMotorista;
    private Carro carro;
    private CarroDto carroDto;

    @BeforeEach
    void setUp() {
        carro = Carro.builder()
                .id(1L)
                .modelo("Corolla")
                .cor("Preto")
                .placa("ABC1234")
                .capacidadePassageiros(4)
                .atualizadoPor("usuario")
                .dataAtualizacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .criadoPor("usuario")
                .dataCriacao(LocalDateTime.of(2023, 10, 1, 10, 0))
                .build();
                
        carroDto = CarroDto.builder()
                .id(1L)
                .modelo("Corolla")
                .cor("Preto")
                .placa("ABC1234")
                .build();

        perfilMotorista = PerfilMotorista.builder()
                .id(1L)
                .cnh("12345678901")
                .carro(carro)
                .build();
    }

    @Test
    @DisplayName("Deve converter PerfilMotorista para PerfilMotoristaDto corretamente")
    void deveConverterPerfilMotoristaParaPerfilMotoristaDtoCorretamente() {
        // Given
        Mockito.when(carroMapper.toDto(Mockito.any(Carro.class)))
               .thenReturn(carroDto);

        // When
        final PerfilMotoristaDto dto = perfilMotoristaMapper.tDto(perfilMotorista);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(perfilMotorista.getId(), dto.getId());
        Assertions.assertEquals(perfilMotorista.getCnh(), dto.getCnh());
        
        // Verificar o mapeamento do carro
        Assertions.assertNotNull(dto.getCarro());
        Assertions.assertEquals(carroDto.getId(), dto.getCarro().getId());
        Assertions.assertEquals(carroDto.getModelo(), dto.getCarro().getModelo());
        
        // Verify the method call
        Mockito.verify(carroMapper).toDto(carro);
    }

    @Test
    @DisplayName("Deve converter PerfilMotoristaRequest para PerfilMotorista corretamente")
    void deveConverterPerfilMotoristaRequestParaPerfilMotoristaCorretamente() {
        // Given
        final CarroRequest carroRequest = CarroRequest.builder()
                .modelo("Civic")
                .cor("Branco")
                .placa("XYZ5678")
                .capacidadePassageiros(4)
                .build();

        final PerfilMotoristaRequest request = PerfilMotoristaRequest.builder()
                .cnh("98765432101")
                .carro(carroRequest)
                .build();
                
        final Carro novoCarro = Carro.builder()
                .modelo("Civic")
                .cor("Branco")
                .placa("XYZ5678")
                .capacidadePassageiros(4)
                .build();
                
        Mockito.when(carroMapper.toEntity(Mockito.any(CarroRequest.class)))
               .thenReturn(novoCarro);

        // When
        final PerfilMotorista perfilMotorista = perfilMotoristaMapper.toEntity(request);

        // Then
        Assertions.assertNotNull(perfilMotorista);
        Assertions.assertNull(perfilMotorista.getId()); // Id should be ignored in mapping
        Assertions.assertEquals(request.getCnh(), perfilMotorista.getCnh());
        
        // Verificar o mapeamento do carro
        Assertions.assertNotNull(perfilMotorista.getCarro());
        Assertions.assertEquals(novoCarro.getModelo(), perfilMotorista.getCarro().getModelo());
        Assertions.assertEquals(novoCarro.getCor(), perfilMotorista.getCarro().getCor());
        Assertions.assertEquals(novoCarro.getPlaca(), perfilMotorista.getCarro().getPlaca());
        
        // Verify the method call
        Mockito.verify(carroMapper).toEntity(carroRequest);
    }
    
    @Test
    @DisplayName("Deve retornar null quando perfilMotorista for null")
    void deveRetornarNullQuandoPerfilMotoristaForNull() {
        // When
        final PerfilMotoristaDto dto = perfilMotoristaMapper.tDto(null);
        
        // Then
        Assertions.assertNull(dto);
    }
    
    @Test
    @DisplayName("Deve retornar null quando request for null")
    void deveRetornarNullQuandoRequestForNull() {
        // When
        final PerfilMotorista entity = perfilMotoristaMapper.toEntity(null);
        
        // Then
        Assertions.assertNull(entity);
    }
    
    @Test
    @DisplayName("Deve lidar com carro null")
    void deveLidarComCarroNulo() {
        // Given
        final PerfilMotorista perfilSemCarro = PerfilMotorista.builder()
                .id(1L)
                .cnh("12345678901")
                .carro(null)
                .build();
                
        // When
        final PerfilMotoristaDto dto = perfilMotoristaMapper.tDto(perfilSemCarro);
        
        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertNull(dto.getCarro());
        // We don't verify any call to carroMapper.toDto here since perfilMotorista.carro is null
    }
}
