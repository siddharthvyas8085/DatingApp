// import * as SecureStore from 'expo-secure-store';

// const AUTH_TOKEN_KEY = 'bloom_auth_token';

// export async function saveAuthToken(token: string) {
//   await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
// }

// // export async function getToken() {
// //   return await SecureStore.getItemAsync('token');
// // }

// export async function getAuthToken() {
//   return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
// }

// export async function clearAuthToken() {
//   await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
// }


import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_TOKEN_KEY = "auth_token";//bloom_auth_token

export async function saveAuthToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken() {
  if (Platform.OS === "web") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function clearAuthToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}