package com.auction.deposit.common;

import lombok.Data;

import java.io.Serializable;

@Data
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer code;

    private String message;

    private T data;

    private Result() {
    }

    public static <T> Result<T> success() {
        Result<T> result = new Result<>();
        result.setCode(Constants.SUCCESS_CODE);
        result.setMessage(Constants.SUCCESS_MESSAGE);
        return result;
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(Constants.SUCCESS_CODE);
        result.setMessage(Constants.SUCCESS_MESSAGE);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.setCode(Constants.SUCCESS_CODE);
        result.setMessage(message);
        result.setData(data);
        return result;
    }

    public static <T> Result<T> fail(String message) {
        Result<T> result = new Result<>();
        result.setCode(Constants.FAIL_CODE);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> fail(BusinessException e) {
        Result<T> result = new Result<>();
        result.setCode(e.getCode());
        result.setMessage(e.getMessage());
        return result;
    }
}
