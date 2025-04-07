package com.br.puc.carona.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private static final String BUCKET_NAME = "userphotos";

    public String uploadImage(MultipartFile file, String fileName) throws IOException {
        byte[] fileBytes = file.getBytes();

        return webClient.post()
                .uri("/storage/v1/object/" + BUCKET_NAME + "/" + fileName)
                .header(HttpHeaders.CONTENT_TYPE, file.getContentType())
                .bodyValue(fileBytes)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> "https://nfrirozajhxljhkieidn.supabase.co/storage/v1/object/public/" + BUCKET_NAME + "/" + fileName)
                .block();
    }
}
