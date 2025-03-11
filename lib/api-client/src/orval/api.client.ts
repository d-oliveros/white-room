/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import * as axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  DeleteUsersUserId404,
  GetAddressesAddressId200,
  GetAddressesAddressId404,
  GetAuthMe200,
  GetAuthMe401,
  GetDatatablesUsers200,
  GetDatatablesUsersParams,
  GetGoogleAutocomplete200,
  GetGoogleAutocomplete503,
  GetGoogleAutocompleteParams,
  GetUsers200,
  GetUsers400,
  GetUsersUserId200,
  GetUsersUserId404,
  PostAddresses201,
  PostAddresses400,
  PostAddressesBody,
  PostAuthLogin200,
  PostAuthLogin401,
  PostAuthLoginBody,
  PostAuthLogout200,
  PostAuthLogout401,
  PostAuthSignup200,
  PostAuthSignup400,
  PostAuthSignupBody,
  PutUsersUserId200,
  PutUsersUserId404,
  PutUsersUserIdBody,
} from './model';

export const getAddressesAddressId = (
  addressId: string,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetAddressesAddressId200>> => {
  return axios.default.get(`/addresses/${addressId}`, options);
};

export const getGetAddressesAddressIdQueryKey = (addressId: string) => {
  return [`/addresses/${addressId}`] as const;
};

export const getGetAddressesAddressIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getAddressesAddressId>>,
  TError = AxiosError<GetAddressesAddressId404>,
>(
  addressId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAddressesAddressIdQueryKey(addressId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getAddressesAddressId>>> = ({ signal }) =>
    getAddressesAddressId(addressId, { signal, ...axiosOptions });

  return { queryKey, queryFn, enabled: !!addressId, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getAddressesAddressId>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetAddressesAddressIdQueryResult = NonNullable<
  Awaited<ReturnType<typeof getAddressesAddressId>>
>;
export type GetAddressesAddressIdQueryError = AxiosError<GetAddressesAddressId404>;

export function useGetAddressesAddressId<
  TData = Awaited<ReturnType<typeof getAddressesAddressId>>,
  TError = AxiosError<GetAddressesAddressId404>,
>(
  addressId: string,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetAddressesAddressId<
  TData = Awaited<ReturnType<typeof getAddressesAddressId>>,
  TError = AxiosError<GetAddressesAddressId404>,
>(
  addressId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getAddressesAddressId>>,
          TError,
          TData
        >,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetAddressesAddressId<
  TData = Awaited<ReturnType<typeof getAddressesAddressId>>,
  TError = AxiosError<GetAddressesAddressId404>,
>(
  addressId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetAddressesAddressId<
  TData = Awaited<ReturnType<typeof getAddressesAddressId>>,
  TError = AxiosError<GetAddressesAddressId404>,
>(
  addressId: string,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getAddressesAddressId>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetAddressesAddressIdQueryOptions(addressId, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getGoogleAutocomplete = (
  params: GetGoogleAutocompleteParams,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetGoogleAutocomplete200>> => {
  return axios.default.get(`/google/autocomplete`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};

export const getGetGoogleAutocompleteQueryKey = (params: GetGoogleAutocompleteParams) => {
  return [`/google/autocomplete`, ...(params ? [params] : [])] as const;
};

export const getGetGoogleAutocompleteQueryOptions = <
  TData = Awaited<ReturnType<typeof getGoogleAutocomplete>>,
  TError = AxiosError<GetGoogleAutocomplete503>,
>(
  params: GetGoogleAutocompleteParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetGoogleAutocompleteQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getGoogleAutocomplete>>> = ({ signal }) =>
    getGoogleAutocomplete(params, { signal, ...axiosOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getGoogleAutocomplete>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetGoogleAutocompleteQueryResult = NonNullable<
  Awaited<ReturnType<typeof getGoogleAutocomplete>>
>;
export type GetGoogleAutocompleteQueryError = AxiosError<GetGoogleAutocomplete503>;

export function useGetGoogleAutocomplete<
  TData = Awaited<ReturnType<typeof getGoogleAutocomplete>>,
  TError = AxiosError<GetGoogleAutocomplete503>,
>(
  params: GetGoogleAutocompleteParams,
  options: {
    query: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>
    > &
      Pick<
        DefinedInitialDataOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetGoogleAutocomplete<
  TData = Awaited<ReturnType<typeof getGoogleAutocomplete>>,
  TError = AxiosError<GetGoogleAutocomplete503>,
>(
  params: GetGoogleAutocompleteParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getGoogleAutocomplete>>,
          TError,
          TData
        >,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetGoogleAutocomplete<
  TData = Awaited<ReturnType<typeof getGoogleAutocomplete>>,
  TError = AxiosError<GetGoogleAutocomplete503>,
>(
  params: GetGoogleAutocompleteParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetGoogleAutocomplete<
  TData = Awaited<ReturnType<typeof getGoogleAutocomplete>>,
  TError = AxiosError<GetGoogleAutocomplete503>,
>(
  params: GetGoogleAutocompleteParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getGoogleAutocomplete>>, TError, TData>
    >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetGoogleAutocompleteQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const postAddresses = (
  postAddressesBody: PostAddressesBody,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostAddresses201>> => {
  return axios.default.post(`/addresses`, postAddressesBody, options);
};

export const getPostAddressesMutationOptions = <
  TData = Awaited<ReturnType<typeof postAddresses>>,
  TError = AxiosError<PostAddresses400>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAddressesBody }, TContext>;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['postAddresses'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postAddresses>>,
    { data: PostAddressesBody }
  > = (props) => {
    const { data } = props ?? {};

    return postAddresses(data, axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<
    TData,
    TError,
    { data: PostAddressesBody },
    TContext
  >;
};

export type PostAddressesMutationResult = NonNullable<Awaited<ReturnType<typeof postAddresses>>>;
export type PostAddressesMutationBody = PostAddressesBody;
export type PostAddressesMutationError = AxiosError<PostAddresses400>;

export const usePostAddresses = <
  TData = Awaited<ReturnType<typeof postAddresses>>,
  TError = AxiosError<PostAddresses400>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAddressesBody }, TContext>;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, { data: PostAddressesBody }, TContext> => {
  const mutationOptions = getPostAddressesMutationOptions(options);

  return useMutation(mutationOptions);
};

export const postAuthLogin = (
  postAuthLoginBody: PostAuthLoginBody,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostAuthLogin200>> => {
  return axios.default.post(`/auth/login`, postAuthLoginBody, options);
};

export const getPostAuthLoginMutationOptions = <
  TData = Awaited<ReturnType<typeof postAuthLogin>>,
  TError = AxiosError<PostAuthLogin401>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAuthLoginBody }, TContext>;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['postAuthLogin'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postAuthLogin>>,
    { data: PostAuthLoginBody }
  > = (props) => {
    const { data } = props ?? {};

    return postAuthLogin(data, axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<
    TData,
    TError,
    { data: PostAuthLoginBody },
    TContext
  >;
};

export type PostAuthLoginMutationResult = NonNullable<Awaited<ReturnType<typeof postAuthLogin>>>;
export type PostAuthLoginMutationBody = PostAuthLoginBody;
export type PostAuthLoginMutationError = AxiosError<PostAuthLogin401>;

export const usePostAuthLogin = <
  TData = Awaited<ReturnType<typeof postAuthLogin>>,
  TError = AxiosError<PostAuthLogin401>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAuthLoginBody }, TContext>;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, { data: PostAuthLoginBody }, TContext> => {
  const mutationOptions = getPostAuthLoginMutationOptions(options);

  return useMutation(mutationOptions);
};

export const postAuthSignup = (
  postAuthSignupBody: PostAuthSignupBody,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostAuthSignup200>> => {
  return axios.default.post(`/auth/signup`, postAuthSignupBody, options);
};

export const getPostAuthSignupMutationOptions = <
  TData = Awaited<ReturnType<typeof postAuthSignup>>,
  TError = AxiosError<PostAuthSignup400>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAuthSignupBody }, TContext>;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['postAuthSignup'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof postAuthSignup>>,
    { data: PostAuthSignupBody }
  > = (props) => {
    const { data } = props ?? {};

    return postAuthSignup(data, axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<
    TData,
    TError,
    { data: PostAuthSignupBody },
    TContext
  >;
};

export type PostAuthSignupMutationResult = NonNullable<Awaited<ReturnType<typeof postAuthSignup>>>;
export type PostAuthSignupMutationBody = PostAuthSignupBody;
export type PostAuthSignupMutationError = AxiosError<PostAuthSignup400>;

export const usePostAuthSignup = <
  TData = Awaited<ReturnType<typeof postAuthSignup>>,
  TError = AxiosError<PostAuthSignup400>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { data: PostAuthSignupBody }, TContext>;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, { data: PostAuthSignupBody }, TContext> => {
  const mutationOptions = getPostAuthSignupMutationOptions(options);

  return useMutation(mutationOptions);
};

export const getAuthMe = (options?: AxiosRequestConfig): Promise<AxiosResponse<GetAuthMe200>> => {
  return axios.default.get(`/auth/me`, options);
};

export const getGetAuthMeQueryKey = () => {
  return [`/auth/me`] as const;
};

export const getGetAuthMeQueryOptions = <
  TData = Awaited<ReturnType<typeof getAuthMe>>,
  TError = AxiosError<GetAuthMe401>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetAuthMeQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getAuthMe>>> = ({ signal }) =>
    getAuthMe({ signal, ...axiosOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getAuthMe>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetAuthMeQueryResult = NonNullable<Awaited<ReturnType<typeof getAuthMe>>>;
export type GetAuthMeQueryError = AxiosError<GetAuthMe401>;

export function useGetAuthMe<
  TData = Awaited<ReturnType<typeof getAuthMe>>,
  TError = AxiosError<GetAuthMe401>,
>(options: {
  query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>> &
    Pick<
      DefinedInitialDataOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>,
      'initialData'
    >;
  axios?: AxiosRequestConfig;
}): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetAuthMe<
  TData = Awaited<ReturnType<typeof getAuthMe>>,
  TError = AxiosError<GetAuthMe401>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>> &
    Pick<
      UndefinedInitialDataOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>,
      'initialData'
    >;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetAuthMe<
  TData = Awaited<ReturnType<typeof getAuthMe>>,
  TError = AxiosError<GetAuthMe401>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetAuthMe<
  TData = Awaited<ReturnType<typeof getAuthMe>>,
  TError = AxiosError<GetAuthMe401>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAuthMe>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetAuthMeQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const postAuthLogout = (
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostAuthLogout200>> => {
  return axios.default.post(`/auth/logout`, undefined, options);
};

export const getPostAuthLogoutMutationOptions = <
  TData = Awaited<ReturnType<typeof postAuthLogout>>,
  TError = AxiosError<PostAuthLogout401>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, void, TContext>;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['postAuthLogout'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postAuthLogout>>, void> = () => {
    return postAuthLogout(axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<TData, TError, void, TContext>;
};

export type PostAuthLogoutMutationResult = NonNullable<Awaited<ReturnType<typeof postAuthLogout>>>;

export type PostAuthLogoutMutationError = AxiosError<PostAuthLogout401>;

export const usePostAuthLogout = <
  TData = Awaited<ReturnType<typeof postAuthLogout>>,
  TError = AxiosError<PostAuthLogout401>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, void, TContext>;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, void, TContext> => {
  const mutationOptions = getPostAuthLogoutMutationOptions(options);

  return useMutation(mutationOptions);
};

export const getDatatablesUsers = (
  params?: GetDatatablesUsersParams,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetDatatablesUsers200>> => {
  return axios.default.get(`/datatables/users`, {
    ...options,
    params: { ...params, ...options?.params },
  });
};

export const getGetDatatablesUsersQueryKey = (params?: GetDatatablesUsersParams) => {
  return [`/datatables/users`, ...(params ? [params] : [])] as const;
};

export const getGetDatatablesUsersQueryOptions = <
  TData = Awaited<ReturnType<typeof getDatatablesUsers>>,
  TError = AxiosError<unknown>,
>(
  params?: GetDatatablesUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetDatatablesUsersQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getDatatablesUsers>>> = ({ signal }) =>
    getDatatablesUsers(params, { signal, ...axiosOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getDatatablesUsers>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetDatatablesUsersQueryResult = NonNullable<
  Awaited<ReturnType<typeof getDatatablesUsers>>
>;
export type GetDatatablesUsersQueryError = AxiosError<unknown>;

export function useGetDatatablesUsers<
  TData = Awaited<ReturnType<typeof getDatatablesUsers>>,
  TError = AxiosError<unknown>,
>(
  params: undefined | GetDatatablesUsersParams,
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetDatatablesUsers<
  TData = Awaited<ReturnType<typeof getDatatablesUsers>>,
  TError = AxiosError<unknown>,
>(
  params?: GetDatatablesUsersParams,
  options?: {
    query?: Partial<
      UseQueryOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>
    > &
      Pick<
        UndefinedInitialDataOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetDatatablesUsers<
  TData = Awaited<ReturnType<typeof getDatatablesUsers>>,
  TError = AxiosError<unknown>,
>(
  params?: GetDatatablesUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetDatatablesUsers<
  TData = Awaited<ReturnType<typeof getDatatablesUsers>>,
  TError = AxiosError<unknown>,
>(
  params?: GetDatatablesUsersParams,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getDatatablesUsers>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetDatatablesUsersQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getUsers = (options?: AxiosRequestConfig): Promise<AxiosResponse<GetUsers200>> => {
  return axios.default.get(`/users`, options);
};

export const getGetUsersQueryKey = () => {
  return [`/users`] as const;
};

export const getGetUsersQueryOptions = <
  TData = Awaited<ReturnType<typeof getUsers>>,
  TError = AxiosError<GetUsers400>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetUsersQueryKey();

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUsers>>> = ({ signal }) =>
    getUsers({ signal, ...axiosOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getUsers>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetUsersQueryResult = NonNullable<Awaited<ReturnType<typeof getUsers>>>;
export type GetUsersQueryError = AxiosError<GetUsers400>;

export function useGetUsers<
  TData = Awaited<ReturnType<typeof getUsers>>,
  TError = AxiosError<GetUsers400>,
>(options: {
  query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>> &
    Pick<
      DefinedInitialDataOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>,
      'initialData'
    >;
  axios?: AxiosRequestConfig;
}): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetUsers<
  TData = Awaited<ReturnType<typeof getUsers>>,
  TError = AxiosError<GetUsers400>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>> &
    Pick<
      UndefinedInitialDataOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>,
      'initialData'
    >;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetUsers<
  TData = Awaited<ReturnType<typeof getUsers>>,
  TError = AxiosError<GetUsers400>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetUsers<
  TData = Awaited<ReturnType<typeof getUsers>>,
  TError = AxiosError<GetUsers400>,
>(options?: {
  query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsers>>, TError, TData>>;
  axios?: AxiosRequestConfig;
}): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetUsersQueryOptions(options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const getUsersUserId = (
  userId: string,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetUsersUserId200>> => {
  return axios.default.get(`/users/${userId}`, options);
};

export const getGetUsersUserIdQueryKey = (userId: string) => {
  return [`/users/${userId}`] as const;
};

export const getGetUsersUserIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getUsersUserId>>,
  TError = AxiosError<GetUsersUserId404>,
>(
  userId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
) => {
  const { query: queryOptions, axios: axiosOptions } = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetUsersUserIdQueryKey(userId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getUsersUserId>>> = ({ signal }) =>
    getUsersUserId(userId, { signal, ...axiosOptions });

  return { queryKey, queryFn, enabled: !!userId, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof getUsersUserId>>,
    TError,
    TData
  > & { queryKey: DataTag<QueryKey, TData> };
};

export type GetUsersUserIdQueryResult = NonNullable<Awaited<ReturnType<typeof getUsersUserId>>>;
export type GetUsersUserIdQueryError = AxiosError<GetUsersUserId404>;

export function useGetUsersUserId<
  TData = Awaited<ReturnType<typeof getUsersUserId>>,
  TError = AxiosError<GetUsersUserId404>,
>(
  userId: string,
  options: {
    query: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>> &
      Pick<
        DefinedInitialDataOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetUsersUserId<
  TData = Awaited<ReturnType<typeof getUsersUserId>>,
  TError = AxiosError<GetUsersUserId404>,
>(
  userId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>> &
      Pick<
        UndefinedInitialDataOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>,
        'initialData'
      >;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };
export function useGetUsersUserId<
  TData = Awaited<ReturnType<typeof getUsersUserId>>,
  TError = AxiosError<GetUsersUserId404>,
>(
  userId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> };

export function useGetUsersUserId<
  TData = Awaited<ReturnType<typeof getUsersUserId>>,
  TError = AxiosError<GetUsersUserId404>,
>(
  userId: string,
  options?: {
    query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getUsersUserId>>, TError, TData>>;
    axios?: AxiosRequestConfig;
  },
): UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData> } {
  const queryOptions = getGetUsersUserIdQueryOptions(userId, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: DataTag<QueryKey, TData>;
  };

  query.queryKey = queryOptions.queryKey;

  return query;
}

export const deleteUsersUserId = (
  userId: string,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<unknown>> => {
  return axios.default.delete(`/users/${userId}`, options);
};

export const getDeleteUsersUserIdMutationOptions = <
  TData = Awaited<ReturnType<typeof deleteUsersUserId>>,
  TError = AxiosError<DeleteUsersUserId404>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { userId: string }, TContext>;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['deleteUsersUserId'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof deleteUsersUserId>>,
    { userId: string }
  > = (props) => {
    const { userId } = props ?? {};

    return deleteUsersUserId(userId, axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<
    TData,
    TError,
    { userId: string },
    TContext
  >;
};

export type DeleteUsersUserIdMutationResult = NonNullable<
  Awaited<ReturnType<typeof deleteUsersUserId>>
>;

export type DeleteUsersUserIdMutationError = AxiosError<DeleteUsersUserId404>;

export const useDeleteUsersUserId = <
  TData = Awaited<ReturnType<typeof deleteUsersUserId>>,
  TError = AxiosError<DeleteUsersUserId404>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<TData, TError, { userId: string }, TContext>;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, { userId: string }, TContext> => {
  const mutationOptions = getDeleteUsersUserIdMutationOptions(options);

  return useMutation(mutationOptions);
};

export const putUsersUserId = (
  userId: string,
  putUsersUserIdBody: PutUsersUserIdBody,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<PutUsersUserId200>> => {
  return axios.default.put(`/users/${userId}`, putUsersUserIdBody, options);
};

export const getPutUsersUserIdMutationOptions = <
  TData = Awaited<ReturnType<typeof putUsersUserId>>,
  TError = AxiosError<PutUsersUserId404>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TData,
    TError,
    { userId: string; data: PutUsersUserIdBody },
    TContext
  >;
  axios?: AxiosRequestConfig;
}) => {
  const mutationKey = ['putUsersUserId'];
  const { mutation: mutationOptions, axios: axiosOptions } = options
    ? options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey
      ? options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey }, axios: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof putUsersUserId>>,
    { userId: string; data: PutUsersUserIdBody }
  > = (props) => {
    const { userId, data } = props ?? {};

    return putUsersUserId(userId, data, axiosOptions);
  };

  return { mutationFn, ...mutationOptions } as UseMutationOptions<
    TData,
    TError,
    { userId: string; data: PutUsersUserIdBody },
    TContext
  >;
};

export type PutUsersUserIdMutationResult = NonNullable<Awaited<ReturnType<typeof putUsersUserId>>>;
export type PutUsersUserIdMutationBody = PutUsersUserIdBody;
export type PutUsersUserIdMutationError = AxiosError<PutUsersUserId404>;

export const usePutUsersUserId = <
  TData = Awaited<ReturnType<typeof putUsersUserId>>,
  TError = AxiosError<PutUsersUserId404>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TData,
    TError,
    { userId: string; data: PutUsersUserIdBody },
    TContext
  >;
  axios?: AxiosRequestConfig;
}): UseMutationResult<TData, TError, { userId: string; data: PutUsersUserIdBody }, TContext> => {
  const mutationOptions = getPutUsersUserIdMutationOptions(options);

  return useMutation(mutationOptions);
};
