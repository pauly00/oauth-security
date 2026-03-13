package com.fisa.auth.platform;

import com.fisa.auth.platform.service.ClientService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FisaOAuthApplication {

	public static void main(String[] args) {
		SpringApplication.run(FisaOAuthApplication.class, args);
	}

}
