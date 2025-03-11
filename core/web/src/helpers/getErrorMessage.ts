import { AxiosError } from 'axios';

export default function getErrorMessage(error: AxiosError | Error | null | undefined) {
  if (error instanceof AxiosError) {
    return error.response?.data?.error || error.message;
  }
  return error?.message || null;
}
