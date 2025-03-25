package com.br.puc.carona.util;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/**
 * Utilitário para validar hashes MD5.
 */
@Component
public class MD5Util {

    private static final Pattern MD5_PATTERN = Pattern.compile("^[a-fA-F0-9]{32}$");
    
    /**
     * Verifica se uma string corresponde a um hash MD5 válido.
     * 
     * @param input A string a ser validada
     * @return true se a string é um hash MD5 válido, false caso contrário
     */
    public boolean isValidMD5Hash(String input) {
        return input != null && MD5_PATTERN.matcher(input).matches();
    }
}
