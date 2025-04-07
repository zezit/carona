package com.br.puc.carona.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import com.br.puc.carona.exception.custom.ErroUploadImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.CarroRequest;
import com.br.puc.carona.dto.request.EstudanteUpdateRequest;
import com.br.puc.carona.dto.request.PerfilMotoristaRequest;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.dto.response.PerfilMotoristaDto;
import com.br.puc.carona.enums.Status;
import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.CarroMapper;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.PerfilMotoristaMapper;
import com.br.puc.carona.model.Carro;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.model.PerfilMotorista;
import com.br.puc.carona.repository.EstudanteRepository;
import com.br.puc.carona.repository.PerfilMotoristaRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class EstudanteService {

    private final EstudanteRepository repository;
    private final PerfilMotoristaRepository perfilMotoristaRepository;

    private final SupabaseStorageService supabaseStorageService;

    private final EstudanteMapper mapper;
    private final PerfilMotoristaMapper perfilMotoristaMapper;
    private final CarroMapper carroMapper;

    public Estudante completeEstudanteCreation(final SignupEstudanteRequest cadastroRequest) {
        if (repository.existsByMatricula(cadastroRequest.getMatricula())) {
            throw new ErroDeCliente(MensagensResposta.MATRICULA_JA_CADASTRADA);
        }

        final Estudante estudante = mapper.toEntity(cadastroRequest);

        repository.save(estudante);

        return estudante;
    }

    @Transactional
    public PerfilMotoristaDto criarPerfilMotorista(final Long estudanteId, final PerfilMotoristaRequest request) {
        final Estudante estudante = repository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        if (!Status.APROVADO.equals(estudante.getStatusCadastro())) {
            throw new ErroDeCliente(MensagensResposta.CADASTRO_NAO_APROVADO);
        }

        if (estudante.isMotorista()) {
            throw new ErroDeCliente(MensagensResposta.ESTUDANTE_JA_E_MOTORISTA);
        }

        // Validar CNH
        if (perfilMotoristaRepository.existsByCnh(request.getCnh())) {
            throw new ErroDeCliente(MensagensResposta.CNH_JA_CADASTRADA);
        }

        final PerfilMotorista perfilMotorista = perfilMotoristaMapper.toEntity(request);
        perfilMotorista.setEstudante(estudante);
        estudante.setPerfilMotorista(perfilMotorista);

        repository.save(estudante);
        log.info("Perfil de motorista criado com sucesso para estudante ID: {}", estudanteId);

        return perfilMotoristaMapper.tDto(perfilMotorista);
    }

    public PerfilMotoristaDto buscarPerfilMotorista(final Long estudanteId) {
        final Estudante estudante = repository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        if (!estudante.isMotorista()) {
            throw new ErroDeCliente(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA);
        }

        return perfilMotoristaMapper.tDto(estudante.getPerfilMotorista());
    }

    public Page<EstudanteDto> buscarTodosOsEstudantes(final Pageable pageable) {
        final Page<Estudante> estudantesPage = this.repository.findAll(pageable);

        return estudantesPage.map(mapper::toDto);

    }

    public EstudanteDto buscarEstudantePorId(final Long id) {
        log.info("Buscando estudante por ID: {}", id);
        final Estudante estudante = repository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, id));

        return mapper.toDto(estudante);
    }

    @Transactional
    public EstudanteDto atualizarEstudante(final Long id, final EstudanteUpdateRequest request, MultipartFile file) {
        log.info("Atualizando estudante com ID: {}", id);
        Estudante estudante = repository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, id));

        if (request.getMatricula() != null && !request.getMatricula().equals(estudante.getMatricula())
                && repository.existsByMatricula(request.getMatricula())) {
            throw new ErroDeCliente(MensagensResposta.MATRICULA_JA_CADASTRADA);
        }


        if (request.getNome() != null) {
            estudante.setNome(request.getNome());
        }

        if (request.getMatricula() != null) {
            estudante.setMatricula(request.getMatricula());
        }

        if (request.getCurso() != null) {
            estudante.setCurso(request.getCurso());
        }

        if (file != null && !file.isEmpty()) {
            try{
                String fileName = "profilePhoto_Student_" + id;
                String url = supabaseStorageService.uploadImage(file, fileName);
                estudante.setImgUrl(url);
            }catch (IOException e){
                throw new ErroUploadImage("Erro ao fazer upload da imagem de perfil", e);
            }

        }

        repository.save(estudante);
        log.info("Estudante com ID: {} atualizado com sucesso", id);

        return mapper.toDto(estudante);
    }

    @Transactional
    public void deletarEstudante(final Long id) {
        log.info("Deletando estudante com ID: {}", id);
        final Estudante estudante = repository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, id));

        repository.delete(estudante);
        log.info("Estudante com ID: {} deletado com sucesso", id);
    }

    public List<EstudanteDto> buscarEstudantesPorNome(final String nome) {
        log.info("Buscando estudantes com nome contendo: {}", nome);
        final List<Estudante> estudantes = repository.findByNomeContainingIgnoreCase(nome);

        return estudantes.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    public Page<EstudanteDto> buscarEstudantesPorCurso(final String curso, final Pageable pageable) {
        log.info("Buscando estudantes do curso: {}", curso);
        final Page<Estudante> estudantesPage = repository.findByCursoIgnoreCase(curso, pageable);

        return estudantesPage.map(mapper::toDto);
    }

    @Transactional
    public PerfilMotoristaDto atualizarPerfilMotorista(final Long estudanteId, final PerfilMotoristaRequest request) {
        log.info("Atualizando perfil de motorista para estudante ID: {}", estudanteId);
        final Estudante estudante = repository.findById(estudanteId)
                .orElseThrow(() -> new EntidadeNaoEncontrada(MensagensResposta.USUARIO_NAO_ENCONTRADO_ID, estudanteId));

        if (!estudante.isMotorista()) {
            throw new ErroDeCliente(MensagensResposta.ESTUDANTE_NAO_E_MOTORISTA);
        }

        final PerfilMotorista perfilMotorista = estudante.getPerfilMotorista();

        // Verificar se a CNH está sendo alterada e já existe
        if (request.getCnh() != null && 
            !request.getCnh().equals(perfilMotorista.getCnh()) && 
            perfilMotoristaRepository.existsByCnh(request.getCnh())) {
            throw new ErroDeCliente(MensagensResposta.CNH_JA_CADASTRADA);
        }

        // Atualizar o perfil do motorista com os novos dados
        if (request.getCnh() != null) {
            perfilMotorista.setCnh(request.getCnh());
        }

        perfilMotorista.setWhatsapp(request.getWhatsapp());
        perfilMotorista.setMostrarWhatsapp(request.getMostrarWhatsapp());

        // Atualizar os dados do carro se existirem
        if (request.getCarro() != null) {
            if (perfilMotorista.getCarro() == null) {
                final Carro novoCarro = carroMapper.toEntity(request.getCarro());
                perfilMotorista.setCarro(novoCarro);
            } else {
                atualizarDadosCarro(perfilMotorista.getCarro(), request.getCarro());
            }
        }

        perfilMotoristaRepository.save(perfilMotorista);
        log.info("Perfil de motorista atualizado com sucesso para estudante ID: {}", estudanteId);

        return perfilMotoristaMapper.tDto(perfilMotorista);
    }
    
    private void atualizarDadosCarro(final Carro carro, final CarroRequest carroRequest) {
        if (carroRequest.getModelo() != null) {
            carro.setModelo(carroRequest.getModelo());
        }
        if (carroRequest.getPlaca() != null) {
            carro.setPlaca(carroRequest.getPlaca());
        }
        if (carroRequest.getCor() != null) {
            carro.setCor(carroRequest.getCor());
        }
        if (carroRequest.getCapacidadePassageiros() != null) {
            carro.setCapacidadePassageiros(carroRequest.getCapacidadePassageiros());
        }
    }
}
