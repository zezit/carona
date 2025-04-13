package com.br.puc.carona.mapper;

import static org.mockito.ArgumentMatchers.*;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.model.Trajeto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.fasterxml.jackson.databind.type.TypeFactory;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: Trajeto")
class TrajetoMapperTest {

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private TypeFactory typeFactory;

    @InjectMocks
    private TrajetoMapper mapper;

    @Test
    @DisplayName("Deve converter trajeto para dto com sucesso")
    void deveConverterTrajetoParaDtoComSucesso() throws JsonProcessingException {
        // Given
        final Trajeto trajeto = Trajeto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .coordenadas("[['-19.9322507','-43.9408341']]")
                .principal(true)
                .build();

        final List<List<Double>> coordenadas = List.of(List.of(-19.9322507, -43.9408341));
        
        // Mock the nested collection type construction
        CollectionType innerCollectionType = Mockito.mock(CollectionType.class);
        CollectionType outerCollectionType = Mockito.mock(CollectionType.class);
        
        Mockito.when(objectMapper.getTypeFactory()).thenReturn(typeFactory);
        Mockito.when(typeFactory.constructCollectionType(Mockito.eq(List.class), Mockito.eq(Double.class)))
                .thenReturn(innerCollectionType);
        Mockito.when(typeFactory.constructCollectionType(Mockito.eq(List.class), Mockito.same(innerCollectionType)))
                .thenReturn(outerCollectionType);
        Mockito.when(objectMapper.readValue(Mockito.eq("[['-19.9322507','-43.9408341']]"), Mockito.same(outerCollectionType)))
                .thenReturn(coordenadas);

        // When
        final TrajetoDto dto = mapper.toDto(trajeto);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(trajeto.getDescricao(), dto.getDescricao());
        Assertions.assertEquals(trajeto.getDistanciaKm(), dto.getDistanciaKm());
        Assertions.assertEquals(trajeto.getTempoSegundos(), dto.getTempoSegundos());
        Assertions.assertEquals(coordenadas, dto.getCoordenadas());
        
        // Verify the correct sequence of calls
        Mockito.verify(objectMapper, Mockito.times(2)).getTypeFactory();
        Mockito.verify(typeFactory).constructCollectionType(eq(List.class), eq(Double.class));
        Mockito.verify(typeFactory).constructCollectionType(eq(List.class), same(innerCollectionType));
        Mockito.verify(objectMapper).readValue(eq("[['-19.9322507','-43.9408341']]"), same(outerCollectionType));
    }

    @Test
    @DisplayName("Deve retornar null quando trajeto for null")
    void deveRetornarNullQuandoTrajetoForNull() {
        // When
        final TrajetoDto dto = mapper.toDto((Trajeto) null);

        // Then
        Assertions.assertNull(dto);
    }

    @Test
    @DisplayName("Deve retornar lista vazia quando lista de trajetos for null")
    void deveRetornarListaVaziaQuandoListaTrajetosForNull() {
        // When
        final List<TrajetoDto> dtos = mapper.toDto((List<Trajeto>) null);

        // Then
        Assertions.assertNotNull(dtos);
        Assertions.assertTrue(dtos.isEmpty());
    }

    @Test
    @DisplayName("Deve converter lista de trajetos para lista de dtos com sucesso")
    void deveConverterListaDeTrajetosParaListaDeDtosComSucesso() throws JsonProcessingException {
        // Given
        final Trajeto trajeto = Trajeto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .coordenadas("[['-19.9322507','-43.9408341']]")
                .principal(true)
                .build();

        final List<List<Double>> coordenadas = List.of(List.of(-19.9322507, -43.9408341));
        
        CollectionType innerCollectionType = Mockito.mock(CollectionType.class);
        CollectionType outerCollectionType = Mockito.mock(CollectionType.class);
        
        Mockito.when(objectMapper.getTypeFactory()).thenReturn(typeFactory);
        Mockito.when(typeFactory.constructCollectionType(Mockito.eq(List.class), Mockito.eq(Double.class)))
                .thenReturn(innerCollectionType);
        Mockito.when(typeFactory.constructCollectionType(Mockito.eq(List.class), Mockito.same(innerCollectionType)))
                .thenReturn(outerCollectionType);
        Mockito.when(objectMapper.readValue(Mockito.eq("[['-19.9322507','-43.9408341']]"), Mockito.same(outerCollectionType)))
                .thenReturn(coordenadas);

        // When
        final List<TrajetoDto> dtos = mapper.toDto(List.of(trajeto));

        // Then
        Assertions.assertNotNull(dtos);
        Assertions.assertEquals(1, dtos.size());
        Assertions.assertEquals(trajeto.getDescricao(), dtos.get(0).getDescricao());
        Assertions.assertEquals(trajeto.getDistanciaKm(), dtos.get(0).getDistanciaKm());
        Assertions.assertEquals(trajeto.getTempoSegundos(), dtos.get(0).getTempoSegundos());
        Assertions.assertEquals(coordenadas, dtos.get(0).getCoordenadas());
    }

    @Test
    @DisplayName("Deve converter dto para trajeto com sucesso")
    void deveConverterDtoParaTrajetoComSucesso() throws JsonProcessingException {
        // Given
        final List<List<Double>> coordenadas = List.of(List.of(-19.9322507, -43.9408341));
        final TrajetoDto dto = TrajetoDto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .coordenadas(coordenadas)
                .build();

        Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenReturn("[['-19.9322507','-43.9408341']]");

        // When
        final Trajeto trajeto = mapper.toEntity(dto);

        // Then
        Assertions.assertNotNull(trajeto);
        Assertions.assertEquals(dto.getDescricao(), trajeto.getDescricao());
        Assertions.assertEquals(dto.getDistanciaKm(), trajeto.getDistanciaKm());
        Assertions.assertEquals(dto.getTempoSegundos(), trajeto.getTempoSegundos());
        Assertions.assertTrue(trajeto.getPrincipal());
        Assertions.assertNotNull(trajeto.getCoordenadas());
    }

    @Test
    @DisplayName("Deve retornar null quando dto for null")
    void deveRetornarNullQuandoDtoForNull() {
        // When
        final Trajeto trajeto = mapper.toEntity(null);

        // Then
        Assertions.assertNull(trajeto);
    }

    @Test
    @DisplayName("Deve definir principal como false quando descrição não for Principal")
    void deveDefinirPrincipalComoFalseQuandoDescricaoNaoForPrincipal() {
        // Given
        final TrajetoDto dto = TrajetoDto.builder()
                .descricao("Alternativo")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .build();

        // When
        final Trajeto trajeto = mapper.toEntity(dto);

        // Then
        Assertions.assertNotNull(trajeto);
        Assertions.assertFalse(trajeto.getPrincipal());
    }

    @Test
    @DisplayName("Deve tratar erro na conversão de coordenadas no toEntity")
    void deveTratarErroNaConversaoDeCoordenasNoToEntity() throws JsonProcessingException {
        // Given
        final TrajetoDto dto = TrajetoDto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .coordenadas(List.of(List.of(-19.9322507, -43.9408341)))
                .build();

        Mockito.when(objectMapper.writeValueAsString(Mockito.any())).thenThrow(JsonProcessingException.class);

        // When
        final Trajeto trajeto = mapper.toEntity(dto);

        // Then
        Assertions.assertNotNull(trajeto);
        Assertions.assertEquals("[]", trajeto.getCoordenadas());
    }
}
