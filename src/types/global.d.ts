import { ILoginResponse } from "@/services/types/backend-services-types";

declare global {
  type TUser = Readonly<{
    auth_date: number;
    first_name: string;
    last_name?: string;
    hash: string;
    id: number;
    photo_url?: string;
    username?: string;
  }>;

  interface TWidgetLogin {
    auth?: () => void;
  }

  interface TelegramLoginOption {
    bot_id: number;
    request_access: boolean;
  }

  interface TelegramLogin {
    auth?: (opts: TelegramLoginOption, callback: (value: TUser | false) => void) => void;
  }

  interface TelegramWebApp {
    Login?: TelegramLogin;
  }

  interface Window {
    onTelegramAuth?: (user: TUser) => void;
    TWidgetLogin?: TWidgetLogin;
    Telegram?: TelegramWebApp;
  }

  interface PaginationResponseWrapper<T> {
    data: Array<T>;
    meta: PaginationResponse;
  }

  interface ResponseAPI<T, U = any> {
    statusCode: number;
    message: string;
    data: T;
    meta?: U
  }

  interface PaginationRequest {
    page: number;
    limit: number;
    search?: string;
  }

  interface PaginationResponse {
    currentPage: number;
    lastPage: number;
    next:null
    perPage: number;
    prev:null
    total: number;
  }

  type CustomHeaderMime = `application/${"json"|"octet-stream"|"x-www-form-urlencoded"|"pdf"|"technology"|"zip"|"xlsx"|"csv"|"gzip"|"epub+zip"}`
  type CustomImageMime = `image/${"avif"|"bmp"|"gif"|"vnd.microsoft.icon"|"jpeg"|"jpg"|"svg"|"png"|"svg+xml"|"tiff"|"webp"|"x-icon"}`
  type CustomVideoMime = `video/${"x-flv"|"mp4"|"MP2T"|"3gpp"|"quicktime"|"x-msvideo"|"x-ms-wmv"}`
}