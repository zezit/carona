package com.br.puc.carona.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageService {

    private final WebClient webClient;

    @Value("${supabase.userphotos-bucket-name}")
    private String userPhotosBucketName;

    @Value("${supabase.code}")
    private String supabaseCode;

    public String uploadImage(MultipartFile file, String fileName, String bucketName) throws IOException {
        byte[] fileBytes = file.getBytes();
        log.info("Fazendo upload de imagem no Supabase Storage: {}", fileName);

        return webClient.post()
                .uri("/storage/v1/object/" + bucketName + "/" + fileName)
                .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                .bodyValue(fileBytes)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> "https://" + supabaseCode + ".supabase.co/storage/v1/object/public/" + bucketName + "/" + fileName)
                .block();
    }

    public String uploadOrUpdateUserPhoto(MultipartFile file, String fileName) throws IOException {
        String fileUrl = "/storage/v1/object/" + userPhotosBucketName + "/" + fileName;

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
            log.info("Arquivo '{}' não encontrado no bucket '{}'. Realizando upload...", fileName, userPhotosBucketName);
            return uploadImage(file, fileName, this.userPhotosBucketName);
        }
    }

    public String updateImage(MultipartFile file, String fileName, String bucketName) throws IOException {
        byte[] fileBytes = file.getBytes();
        log.info("Atualizando imagem no Supabase Storage: {}", fileName);

        return webClient.put()
                .uri("/storage/v1/object/" + bucketName + "/" + fileName)
                .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                .bodyValue(fileBytes)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> "https://" + supabaseCode + ".supabase.co/storage/v1/object/public/" + bucketName + "/" + fileName)
                .block();
    }




}
