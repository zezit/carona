package com.br.puc.carona.mapper;

import java.util.List;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import com.br.puc.carona.dto.TrajetoDto;
import com.br.puc.carona.dto.request.CaronaRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.mock.CaronaMock;
import com.br.puc.carona.mock.TrajetoMock;
import com.br.puc.carona.model.Carona;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("Teste Mapper: Carona")
class CaronaMapperTest {

    @Spy
    @InjectMocks
    private CaronaMapper mapper;

    @Mock
    private PerfilMotoristaMapper perfilMotoristaMapper;

    @Mock
    private EstudanteMapper estudanteMapper;

    @Mock
    private TrajetoMapper trajetoriaMapper;

    @Test
    @DisplayName("Deve converter Carona para CaronaDto corretamente")
    void deveConverterCaronaParaCaronaDtoCorretamente() {
        // Given
        final Carona carona = CaronaMock.createValidCarona();
        final List<TrajetoDto> trajetosDto = List.of(TrajetoMock.createTrajetoPrincipalDto());

        Mockito.when(trajetoriaMapper.toDto(Mockito.anyList()))
                .thenReturn(trajetosDto);

        // When
        final CaronaDto dto = mapper.toDto(carona);

        // Then
        Assertions.assertNotNull(dto);
        Assertions.assertEquals(carona.getId(), dto.getId());
        Assertions.assertEquals(carona.getPontoPartida(), dto.getPontoPartida());
        Assertions.assertEquals(carona.getPontoDestino(), dto.getPontoDestino());
        Assertions.assertEquals(carona.getLatitudePartida(), dto.getLatitudePartida());
        Assertions.assertEquals(carona.getLongitudePartida(), dto.getLongitudePartida());
        Assertions.assertEquals(carona.getLatitudeDestino(), dto.getLatitudeDestino());
        Assertions.assertEquals(carona.getLongitudeDestino(), dto.getLongitudeDestino());
        Assertions.assertEquals(carona.getDataHoraPartida(), dto.getDataHoraPartida());
        Assertions.assertEquals(carona.getVagas(), dto.getVagas());
        Assertions.assertEquals(carona.getStatus(), dto.getStatus());
        Assertions.assertEquals(carona.getObservacoes(), dto.getObservacoes());
        Assertions.assertEquals(carona.getDistanciaEstimadaKm(), dto.getDistanciaEstimadaKm());
        Assertions.assertEquals(carona.getTempoEstimadoSegundos(), dto.getTempoEstimadoSegundos());
        Assertions.assertEquals(trajetosDto, dto.getTrajetos());
        
        Mockito.verify(trajetoriaMapper).toDto(carona.getTrajetos());
    }

    @Test
    @DisplayName("Deve converter CaronaRequest para Entity corretamente")
    void deveConverterRequestParaEntityCorretamente() {
        // Given
        final CaronaRequest request = CaronaMock.createValidRequest();

        // When
        final Carona entity = mapper.toEntity(request);

        // Then
        Assertions.assertNotNull(entity);
        Assertions.assertEquals(request.getPontoPartida(), entity.getPontoPartida());
        Assertions.assertEquals(request.getPontoDestino(), entity.getPontoDestino());
        Assertions.assertEquals(request.getLatitudePartida(), entity.getLatitudePartida());
        Assertions.assertEquals(request.getLongitudePartida(), entity.getLongitudePartida());
        Assertions.assertEquals(request.getLatitudeDestino(), entity.getLatitudeDestino());
        Assertions.assertEquals(request.getLongitudeDestino(), entity.getLongitudeDestino());
        Assertions.assertEquals(request.getDataHoraPartida(), entity.getDataHoraPartida());
        Assertions.assertEquals(request.getVagas(), entity.getVagas());
        Assertions.assertEquals(request.getObservacoes(), entity.getObservacoes());
        Assertions.assertEquals(StatusCarona.AGENDADA, entity.getStatus());
    }

    @Test
    @DisplayName("Deve retornar null ao converter request null para entity")
    void deveRetornarNullAoConverterRequestNullParaEntity() {
        // When
        final Carona entity = mapper.toEntity(null);

        // Then
        Assertions.assertNull(entity);
    }

    @Test
    @DisplayName("Deve retornar null ao converter entity null para dto")
    void deveRetornarNullAoConverterEntityNullParaDto() {
        // When
        final CaronaDto dto = mapper.toDto(null);

        // Then
        Assertions.assertNull(dto);
    }

    @Test
    @DisplayName("Deve atualizar entity corretamente")
    void deveAtualizarEntityCorretamente() {
        // Given
        final CaronaRequest request = CaronaMock.createValidRequest();
        final Carona entity = CaronaMock.createValidCarona();
        
        // When
        mapper.updateEntity(entity, request);

        // Then
        Assertions.assertEquals(request.getPontoPartida(), entity.getPontoPartida());
        Assertions.assertEquals(request.getPontoDestino(), entity.getPontoDestino());
        Assertions.assertEquals(request.getLatitudePartida(), entity.getLatitudePartida());
        Assertions.assertEquals(request.getLongitudePartida(), entity.getLongitudePartida());
        Assertions.assertEquals(request.getLatitudeDestino(), entity.getLatitudeDestino());
        Assertions.assertEquals(request.getLongitudeDestino(), entity.getLongitudeDestino());
        Assertions.assertEquals(request.getDataHoraPartida(), entity.getDataHoraPartida());
        Assertions.assertEquals(request.getVagas(), entity.getVagas());
        Assertions.assertEquals(request.getObservacoes(), entity.getObservacoes());
    }

    @Test
    @DisplayName("Não deve atualizar entity quando request for null")
    void naoDeveAtualizarEntityQuandoRequestForNull() {
        // Given
        final Carona entityOriginal = CaronaMock.createValidCarona();
        final Carona entityParaAtualizar = CaronaMock.createValidCarona(entityOriginal);

        // When
        mapper.updateEntity(entityParaAtualizar, null);

        // Then
        Assertions.assertEquals(entityOriginal, entityParaAtualizar);
    }

    @Test
    @DisplayName("Não deve lançar exceção quando entity for null no update")
    void naoDeveLancarExcecaoQuandoEntityForNullNoUpdate() {
        // Given
        final CaronaRequest request = CaronaMock.createValidRequest();

        // When & Then
        Assertions.assertDoesNotThrow(() -> mapper.updateEntity(null, request));
    }

    @Test
    @DisplayName("Deve selecionar trajetória principal quando existir")
    void deveSelecionarTrajetoriaPrincipalQuandoExistir() {
        // Given
        final Carona carona = CaronaMock.createValidCarona();
        final TrajetoDto trajetoPrincipal = TrajetoDto.builder()
                .descricao("Principal")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .build();
        final TrajetoDto trajetoAlternativo = TrajetoDto.builder()
                .descricao("Alternativo")
                .distanciaKm(18.0)
                .tempoSegundos(1500)
                .build();
        final List<TrajetoDto> trajetosDto = List.of(trajetoAlternativo, trajetoPrincipal);

        Mockito.when(trajetoriaMapper.toDto(Mockito.anyList()))
                .thenReturn(trajetosDto);

        // When
        final CaronaDto dto = mapper.toDto(carona);

        // Then
        Assertions.assertEquals(trajetoPrincipal, dto.getTrajetoPrincipal());
    }

    @Test
    @DisplayName("Deve selecionar primeiro trajeto quando não existir principal")
    void deveSelecionarPrimeiroTrajetoQuandoNaoExistirPrincipal() {
        // Given
        final Carona carona = CaronaMock.createValidCarona();
        final TrajetoDto trajeto1 = TrajetoDto.builder()
                .descricao("Rota 1")
                .distanciaKm(15.5)
                .tempoSegundos(1200)
                .build();
        final TrajetoDto trajeto2 = TrajetoDto.builder()
                .descricao("Rota 2")
                .distanciaKm(18.0)
                .tempoSegundos(1500)
                .build();
        final List<TrajetoDto> trajetosDto = List.of(trajeto1, trajeto2);

        Mockito.when(trajetoriaMapper.toDto(Mockito.anyList()))
                .thenReturn(trajetosDto);

        // When
        final CaronaDto dto = mapper.toDto(carona);

        // Then
        Assertions.assertEquals(trajeto1, dto.getTrajetoPrincipal());
    }

    @Test
    @DisplayName("Deve retornar trajetória principal null quando não houver trajetos")
    void deveRetornarTrajetoriaPrincipalNullQuandoNaoHouverTrajetos() {
        // Given
        final Carona carona = CaronaMock.createValidCarona();
        final List<TrajetoDto> trajetosDto = List.of();

        Mockito.when(trajetoriaMapper.toDto(Mockito.anyList()))
                .thenReturn(trajetosDto);

        // When
        final CaronaDto dto = mapper.toDto(carona);

        // Then
        Assertions.assertNull(dto.getTrajetoPrincipal());
    }
}
