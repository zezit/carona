package com.br.puc.carona.service;

import com.br.puc.carona.exception.custom.EntidadeNaoEncontrada;
import com.br.puc.carona.exception.custom.ErroUploadImage;
import com.br.puc.carona.model.Usuario;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.dto.request.SignupEstudanteRequest;
import com.br.puc.carona.dto.request.SignupUsuarioRequest;
import com.br.puc.carona.dto.response.AdministradorDto;
import com.br.puc.carona.dto.response.EstudanteDto;
import com.br.puc.carona.exception.custom.ErroDeCliente;
import com.br.puc.carona.mapper.EstudanteMapper;
import com.br.puc.carona.mapper.UsuarioMapper;
import com.br.puc.carona.model.Administrador;
import com.br.puc.carona.model.Estudante;
import com.br.puc.carona.repository.UsuarioRepository;
import com.br.puc.carona.util.MD5Util;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@AllArgsConstructor
@Slf4j
public class UsuarioService {

    private final PasswordEncoder passwordEncoder;
    private final MD5Util md5Util;

    private final UsuarioRepository usuarioRepository;
    
    private final AdministradorService adminService;
    private final EstudanteService estudanteService;
    private final SupabaseStorageService supabaseStorageService;

    private final UsuarioMapper mapper;
    private final EstudanteMapper estudanteMapper;

    private void validateEmailAndPassword(String email, String password) {
        // Verificar se e-mail já existe
        if (usuarioRepository.existsByEmail(email)) {
            log.warn("E-mail já cadastrado: {}", email);
            throw new ErroDeCliente(MensagensResposta.EMAIL_JA_CADASTRADO);
        }

        // Verificar se a senha está no formato MD5
        if (!md5Util.isValidMD5Hash(password)) {
            log.warn("Senha não está no formato MD5 esperado");
            throw new ErroDeCliente(MensagensResposta.FORMATO_SENHA_INVALIDO);
        }
    }

    @Transactional
    public AdministradorDto registerAdmin(final SignupUsuarioRequest request) {
        log.info("Iniciando cadastro de usuário com e-mail: {}", request.getEmail());

        validateEmailAndPassword(request.getEmail(), request.getPassword());

        // Aplicar criptografia adicional sobre o hash MD5 recebido
        request.setPassword(passwordEncoder.encode(request.getPassword()));

        final Administrador administrador = adminService.completeAdministradorCreation(request);

        log.info("Usuário cadastrado com sucesso: {}", request.getEmail());

        return mapper.toAdminDto(administrador);
    }

    @Transactional
    public EstudanteDto registerEstudante(final SignupEstudanteRequest request) {
        log.info("Inicio cadastro de estudante com e-mail: {}", request.getEmail());

        validateEmailAndPassword(request.getEmail(), request.getPassword());

        request.setPassword(passwordEncoder.encode(request.getPassword()));

        final Estudante estudante = estudanteService.completeEstudanteCreation(request);

        log.info("Fim cadastro de estudante com e-mail: {}", request.getEmail());

        return estudanteMapper.toDto(estudante);
    }

    @Transactional
    public void atualizarImagemUsuario(Long id, MultipartFile file) {
        log.info("atualizarImagemUsuario: id: {}, file: {}", id, file.getOriginalFilename());
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Usuário não encontrado com id: " + id));

        try{
            final String fileName = "profile_user_photo_" + id;
            final String url = supabaseStorageService.uploadOrUpdateUserPhoto(file, fileName);
            usuario.setImgUrl(url);
        }catch (IOException e){
            e.printStackTrace();
            throw new ErroUploadImage("Erro ao fazer upload da imagem de perfil", e);
        }

        usuarioRepository.save(usuario);
        log.info("Imagem de perfil atualizada com sucesso para o usuário com id: {}", id);
    }

}
