package com.br.puc.carona.service;

import com.br.puc.carona.constants.MensagensResposta;
import com.br.puc.carona.exception.custom.ErroUploadImage;
import com.br.puc.carona.exception.custom.ImagemInvalidaException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.List;

@Service
@Slf4j
public class SupabaseStorageService {

    List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");

    private final WebClient webClient;

    @Value("${supabase.userphotos-bucket-name}")
    private String userPhotosBucketName;

    @Value("${supabase.code}")
    private String supabaseCode;
    
    // Explicit constructor with @Qualifier annotation
    public SupabaseStorageService(@Qualifier("supabaseWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    private String uploadImage(MultipartFile file, String fileName, String bucketName) throws IOException {
        final byte[] fileBytes = file.getBytes();
        log.info("Fazendo upload de imagem no Supabase Storage: {}", fileName);

        try {
            return webClient.post()
                    .uri("/storage/v1/object/" + bucketName + "/" + fileName)
                    .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                    .bodyValue(fileBytes)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> "https://" + supabaseCode + ".supabase.co/storage/v1/object/public/" + bucketName + "/"
                            + fileName)
                    .block();
        } catch (Exception e) {
            log.error("Erro ao fazer upload da imagem para o Supabase: {}", e.getMessage());
            throw new ErroUploadImage(MensagensResposta.ERRO_UPLOAD_ARQUIVO, e);
        }
    }

    public String uploadOrUpdateUserPhoto(MultipartFile file, String fileName) throws IOException {
        validateImage(file);

        final String fileUrl = "/storage/v1/object/" + userPhotosBucketName + "/" + fileName;

        log.info("Checando existência do arquivo: {} no Supabase", fileName);
        try {
            webClient.head()
                    .uri(fileUrl)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Arquivo '{}' já existe no bucket '{}'. Atualizando imagem...", fileName, userPhotosBucketName);
            return updateImage(file, fileName, this.userPhotosBucketName);

        } catch (Exception e) {
            log.info("Arquivo '{}' não encontrado no bucket '{}'. Realizando upload...", fileName,
                    userPhotosBucketName);
            return uploadImage(file, fileName, this.userPhotosBucketName);
        }
    }

    private String updateImage(MultipartFile file, String fileName, String bucketName) throws IOException {
        final byte[] fileBytes = file.getBytes();
        log.info("Atualizando imagem no Supabase Storage: {}", fileName);

        try {
            return webClient.put()
                    .uri("/storage/v1/object/" + bucketName + "/" + fileName)
                    .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                    .bodyValue(fileBytes)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(response -> "https://" + supabaseCode + ".supabase.co/storage/v1/object/public/" + bucketName + "/"
                            + fileName)
                    .block();
        } catch (Exception e) {
            log.error("Erro ao atualizar a imagem no Supabase: {}", e.getMessage());
            throw new ErroUploadImage(MensagensResposta.ERRO_ATUALIZACAO_ARQUIVO, e);
        }
    }

    private void validateImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ImagemInvalidaException(MensagensResposta.ARQUIVO_VAZIO);
        }

        if (!allowedContentTypes.contains(file.getContentType())) {
            throw new ImagemInvalidaException(MensagensResposta.FORMATO_ARQUIVO_INVALIDO);
        }

        final long maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSizeInBytes) {
            throw new ImagemInvalidaException(MensagensResposta.ARQUIVO_MUITO_GRANDE);
        }

        BufferedImage image;
        try {
            image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new ImagemInvalidaException(MensagensResposta.IMAGEM_CORROMPIDA);
            }
        } catch (IOException e) {
            log.error("Erro ao ler o arquivo de imagem: {}", e.getMessage());
            throw new ImagemInvalidaException(MensagensResposta.ERRO_LEITURA_ARQUIVO, e);
        }

        int width = image.getWidth();
        int height = image.getHeight();

        double ratio = (double) width / height;
        if (ratio < 0.8 || ratio > 1.2) {
            throw new ImagemInvalidaException(MensagensResposta.PROPORCAO_IMAGEM_INVALIDA);
        }

        if (width < 200 || height < 200) {
            throw new ImagemInvalidaException(MensagensResposta.IMAGEM_MUITO_PEQUENA);
        }
        
        if (width > 2000 || height > 2000) {
            throw new ImagemInvalidaException(MensagensResposta.IMAGEM_MUITO_GRANDE);
        }
    }
}
