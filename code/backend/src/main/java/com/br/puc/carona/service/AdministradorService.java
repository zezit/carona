package com.br.puc.carona.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.CaronaDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.RideStatsDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.enums.StatusCarona;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.CaronaMapper;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.UsuarioMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Carona;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.Usuario;
import com.br.puc.carona.repository.AdministradorRepository;
import com.br.puc.carona.repository.CaronaRepository;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.UsuarioRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@AllArgsConstructor
@Slf4j
public class AdministradorService {

    private final UsuarioRepository usuarioRepository;
    private final EstudanteRepository estudanteRepository;
    private final AdministradorRepository repository;
    private final CaronaRepository caronaRepository;
    private final UsuarioMapper usuarioMapper;
    private final EstudanteMapper estudanteMapper;
    private final CaronaMapper caronaMapper;

    @Transactional
    public void reviewUserRegistration(final Long userId, final Status status) {
        log.info("Inicio revisão do registro do usuário com ID: {} e status: {}", userId, status);

        // Verificar se o status é válido
        if (status == null || status == Status.PENDENTE) {
            throw new ErroDeCliente(MensagensResposta.STATUS_CADASTRO_INVALIDO);
        }

        // Verificar se o usuário existe
        final Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID));

        // Atualizar o status do usuário (permitindo qualquer alteração de status)
        usuario.setStatusCadastro(status);
        usuarioRepository.save(usuario);
        
        log.info("Usuário com ID: {} teve seu status atualizado para: {}", userId, status);
    }

    public Administrador completeAdministradorCreation(final SignupUsuarioRequest cadastroRequest) {
        final Administrador administrador = usuarioMapper.toAdminEntity(cadastroRequest);
        repository.save(administrador);
        return administrador;
    }

    public List<EstudanteDto> getPendingUsers() {
        log.info("Buscando usuários com status pendente");
        
        List<Estudante> pendingEstudantes = estudanteRepository.findByStatusCadastro(Status.PENDENTE);
        
        log.info("Encontrados {} usuários pendentes", pendingEstudantes.size());
        
        return pendingEstudantes.stream()
            .map(estudanteMapper::toDto)
            .collect(Collectors.toList());
    }
    
    public List<EstudanteDto> getAllUsers() {
        log.info("Buscando todos os usuários");
        
        List<Estudante> allEstudantes = estudanteRepository.findAll();
        
        log.info("Encontrados {} usuários", allEstudantes.size());
        
        return allEstudantes.stream()
            .map(estudanteMapper::toDto)
            .collect(Collectors.toList());
    }

    public Page<CaronaDto> listarTodasCaronas(Pageable pageable) {
        log.info("Buscando todas as caronas com paginação - página: {}, tamanho: {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Carona> caronas = caronaRepository.findAll(pageable);
        
        log.info("Encontradas {} caronas de um total de {}", 
                 caronas.getNumberOfElements(), caronas.getTotalElements());
        
        return caronas.map(caronaMapper::toDto);
    }

    public Page<CaronaDto> listarTodasCaronas(Pageable pageable, StatusCarona status) {
        log.info("Buscando caronas com paginação - página: {}, tamanho: {}, status: {}", 
                 pageable.getPageNumber(), pageable.getPageSize(), status);
        
        Page<Carona> caronas;
        if (status != null) {
            caronas = caronaRepository.findByStatus(status, pageable);
        } else {
            caronas = caronaRepository.findAll(pageable);
        }
        
        log.info("Encontradas {} caronas de um total de {}", 
                 caronas.getNumberOfElements(), caronas.getTotalElements());
        
        return caronas.map(caronaMapper::toDto);
    }

    public Page<CaronaDto> listarTodasCaronas(Pageable pageable, StatusCarona status, String search) {
        log.info("Buscando caronas com paginação - página: {}, tamanho: {}, status: {}, pesquisa: {}", 
                 pageable.getPageNumber(), pageable.getPageSize(), status, search);
        
        Page<Carona> caronas;
        
        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.trim().toLowerCase() + "%";
            if (status != null) {
                caronas = caronaRepository.findByStatusAndSearch(status, searchTerm, pageable);
            } else {
                caronas = caronaRepository.findBySearch(searchTerm, pageable);
            }
        } else {
            if (status != null) {
                caronas = caronaRepository.findByStatus(status, pageable);
            } else {
                caronas = caronaRepository.findAll(pageable);
            }
        }
        
        log.info("Encontradas {} caronas de um total de {}", 
                 caronas.getNumberOfElements(), caronas.getTotalElements());
        
        return caronas.map(caronaMapper::toDto);
    }

    public RideStatsDto obterEstatisticasCaronas() {
        log.info("Obtendo estatísticas das caronas");
        
        Long total = caronaRepository.count();
        Long agendada = caronaRepository.countByStatus(StatusCarona.AGENDADA);
        Long emAndamento = caronaRepository.countByStatus(StatusCarona.EM_ANDAMENTO);
        Long finalizada = caronaRepository.countByStatus(StatusCarona.FINALIZADA);
        Long cancelada = caronaRepository.countByStatus(StatusCarona.CANCELADA);
        
        log.info("Estatísticas obtidas: total={}, agendada={}, em_andamento={}, finalizada={}, cancelada={}", 
                 total, agendada, emAndamento, finalizada, cancelada);
        
        return RideStatsDto.builder()
            .total(total)
            .agendada(agendada)
            .emAndamento(emAndamento)
            .finalizada(finalizada)
            .cancelada(cancelada)
            .build();
    }
}
