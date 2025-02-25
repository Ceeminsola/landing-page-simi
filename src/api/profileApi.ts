import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

interface ProfileResponse {
    data: {
        userId: string;
        status: string;
        provider: string;
        currency: string;
        email: string;
        role: string;
        wallets: Wallet[];
    };
}

interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: number;
}

interface UpdateProfileRequest {
    currentPassword?: string;
    newPassword?: string;
}

export const profileApi = createApi({
    reducerPath: "profileApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.root?.auth?.token; 
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getProfile: builder.query<ProfileResponse, void>({
            query: () => "profile",
        }),
        updateProfile: builder.mutation<any, UpdateProfileRequest>({
            query: (body) => ({
                url: 'profile',
                method: 'PATCH',
                body,
            }),
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
