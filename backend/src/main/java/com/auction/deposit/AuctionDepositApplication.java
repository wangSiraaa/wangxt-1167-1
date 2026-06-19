package com.auction.deposit;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.auction.deposit.mapper")
public class AuctionDepositApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuctionDepositApplication.class, args);
    }
}
