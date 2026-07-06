import { 
  useGetMe as useGeneratedGetMe,
  useGetUserHistory as useGeneratedGetUserHistory,
  useGetAdminStats as useGeneratedGetAdminStats,
  useGetAdminUsers as useGeneratedGetAdminUsers,
  useGetAdminDownloads as useGeneratedGetAdminDownloads,
  useDownloadVideo as useGeneratedDownloadVideo,
  useAnalyzeVideo,
  useLogin,
  useSignup,
  useLogout
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";

// Wrapped hooks that automatically inject the authorization header
export function useGetMe() {
  return useGeneratedGetMe({
    request: { headers: getAuthHeaders() }
  });
}

export function useGetUserHistory() {
  return useGeneratedGetUserHistory({
    request: { headers: getAuthHeaders() }
  });
}

export function useGetAdminStats() {
  return useGeneratedGetAdminStats({
    request: { headers: getAuthHeaders() }
  });
}

export function useGetAdminUsers() {
  return useGeneratedGetAdminUsers({
    request: { headers: getAuthHeaders() }
  });
}

export function useGetAdminDownloads() {
  return useGeneratedGetAdminDownloads({
    request: { headers: getAuthHeaders() }
  });
}

export {
  useAnalyzeVideo,
  useLogin,
  useSignup,
  useLogout
};

// Wrapped download hook that always sends the auth token so Pro/Elite/admin
// users can access 1440p and 4K downloads.
export function useDownloadVideo() {
  return useGeneratedDownloadVideo({
    request: { headers: getAuthHeaders() }
  });
}
