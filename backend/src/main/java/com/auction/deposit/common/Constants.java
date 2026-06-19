package com.auction.deposit.common;

public class Constants {

    private Constants() {
    }

    public static final Integer SUCCESS_CODE = 200;

    public static final String SUCCESS_MESSAGE = "操作成功";

    public static final Integer FAIL_CODE = 500;

    public static final String FAIL_MESSAGE = "操作失败";

    public static final Integer UNAUTHORIZED_CODE = 401;

    public static final String UNAUTHORIZED_MESSAGE = "未授权";

    public static final Integer FORBIDDEN_CODE = 403;

    public static final String FORBIDDEN_MESSAGE = "禁止访问";

    public static final Integer PARAM_ERROR_CODE = 400;

    public static final String PARAM_ERROR_MESSAGE = "参数错误";

    public static final String DEFAULT_PAGE_NUM = "1";

    public static final String DEFAULT_PAGE_SIZE = "10";

    public static final Integer MAX_PAGE_SIZE = 100;

    public static final String TOKEN_HEADER = "Authorization";

    public static final String TOKEN_PREFIX = "Bearer ";
}
