package com.br.puc.carona.utils;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("Teste Utils: MD5Util")
class MD5UtilTest {

    private final MD5Util md5Util = new MD5Util();

    @Test
    @DisplayName("Deve retornar verdadeiro para hash MD5 válido")
    void shouldReturnTrueForValidMD5Hash() {
        // Valid MD5 hashes
        Assertions.assertTrue(md5Util.isValidMD5Hash("d41d8cd98f00b204e9800998ecf8427e"));
        Assertions.assertTrue(md5Util.isValidMD5Hash("5d41402abc4b2a76b9719d911017c592"));
        Assertions.assertTrue(md5Util.isValidMD5Hash("098f6bcd4621d373cade4e832627b4f6"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "invalid",
            "tooShort",
            "d41d8cd98f00b204e9800998ecf8427",  // too short
            "d41d8cd98f00b204e9800998ecf8427e1", // too long
            "g41d8cd98f00b204e9800998ecf8427e",  // invalid character 'g'
            "z41d8cd98f00b204e9800998ecf8427e",  // invalid character 'z'
            "D41D8CD98F00B204E9800998ECF8427" // too short, uppercase
    })
    @DisplayName("Deve retornar falso para hash MD5 inválido")
    void shouldReturnFalseForInvalidMD5Hash(final String input) {
        Assertions.assertFalse(md5Util.isValidMD5Hash(input));
    }

    @ParameterizedTest
    @NullAndEmptySource
    @DisplayName("Deve retornar falso para entrada nula ou vazia")
    void shouldReturnFalseForNullOrEmptyInput(final String input) {
        Assertions.assertFalse(md5Util.isValidMD5Hash(input));
    }

    @Test
    @DisplayName("Deve aceitar letras hexadecimais maiúsculas")
    void shouldAcceptUppercaseHexadecimalLetters() {
        Assertions.assertTrue(md5Util.isValidMD5Hash("D41D8CD98F00B204E9800998ECF8427E"));
        Assertions.assertTrue(md5Util.isValidMD5Hash("5D41402ABC4B2A76B9719D911017C592"));
    }

    @Test
    @DisplayName("Deve aceitar letras hexadecimais com caixa mista")
    void shouldAcceptMixedCaseHexadecimalLetters() {
        Assertions.assertTrue(md5Util.isValidMD5Hash("D41d8cd98f00B204e9800998ECf8427E"));
    }
}
